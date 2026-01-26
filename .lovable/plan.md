
# Promotions Management System Implementation Plan

## Overview
This plan outlines the implementation of a new **Promotions** section in the Admin Dashboard where you can manage product promotions (like "Bermuda Pool + Sauna"). Active promotions will automatically be displayed to Sales Representatives in their dashboard so they stay informed about current company offers.

## Architecture

### Database Design
A new `promotions` table will be created with the following structure:

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Promotion name (e.g., "Bermuda Pool + Barrel Sauna") |
| description | TEXT | Detailed description of the offer |
| bundle_price | NUMERIC | Total bundle price (e.g., 72863) |
| original_price | NUMERIC | Original combined price before discount |
| included_items | JSONB | Array of items included in the bundle |
| start_date | TIMESTAMP | When the promotion becomes active |
| end_date | TIMESTAMP | When the promotion expires (nullable for ongoing) |
| is_active | BOOLEAN | Manual toggle to enable/disable |
| image_url | TEXT | Optional promotional image |
| highlight_text | TEXT | Short tagline (e.g., "Save $5,000!") |
| terms_conditions | TEXT | Fine print / terms |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

### RLS Policies
- **SELECT**: Public read access (so Sales Reps can view active promotions)
- **INSERT/UPDATE/DELETE**: Restricted to authenticated admin users only

---

## Implementation Steps

### Step 1: Database Migration
Create the `promotions` table with all required columns and insert the existing "Bermuda Pool + Barrel Sauna" promotion as seed data:
- Bundle price: $72,863
- Includes: Pool, 4-Person Barrel Sauna ($18,000), Salt System, 3D Patio Render, 5ft Pavers, 2 LED Lights
- 3-month installation timeline

### Step 2: Admin Promotions Manager Component
Create `src/components/admin/AdminPromotionsManager.tsx` with:

**Features:**
- View all promotions in a styled table/card layout
- Create new promotions with a dialog form
- Edit existing promotions
- Toggle active/inactive status with one click
- Delete promotions with confirmation
- Visual indicators for active vs inactive promotions
- Date range display (start/end dates)

**UI Elements:**
- Summary cards showing: Total Promotions, Active Promotions, Expired Promotions
- Filterable list view matching the command center aesthetic
- Form fields for all promotion properties
- JSON editor for included_items or structured input fields

### Step 3: Admin Dashboard Integration
Update `src/pages/AdminDashboard.tsx`:
- Add "Promotions" navigation item under the "MANAGEMENT" section with a `Gift` or `Tag` icon
- Add the conditional render for the Promotions section
- Import and display the `AdminPromotionsManager` component

### Step 4: Sales Rep Dashboard - Active Promotions Display
Update `src/pages/SalesRepDashboard.tsx` to:
- Fetch active promotions on dashboard load
- Display a new "ACTIVE PROMOTIONS" card section above the client list
- Show promotion cards with:
  - Promotion name and highlight text
  - Bundle price and savings
  - Included items as a bulleted list
  - Start/end date if applicable
  - "Use in Quote" button (future enhancement)

**UI Design:**
- Collapsible section with count badge
- Eye-catching gradient cards for each active promotion
- Matches existing holographic/neon aesthetic

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `supabase/migrations/[timestamp]_create_promotions.sql` | CREATE | Database table + RLS + seed data |
| `src/components/admin/AdminPromotionsManager.tsx` | CREATE | Full CRUD management component |
| `src/pages/AdminDashboard.tsx` | MODIFY | Add nav item + section render |
| `src/pages/SalesRepDashboard.tsx` | MODIFY | Add active promotions display |
| `src/integrations/supabase/types.ts` | AUTO-UPDATE | Types will regenerate automatically |

---

## Technical Details

### Promotion Interface (TypeScript)
```typescript
interface Promotion {
  id: string;
  name: string;
  description: string;
  bundle_price: number;
  original_price?: number;
  included_items: Array<{
    name: string;
    value?: string;
  }>;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  image_url?: string;
  highlight_text?: string;
  terms_conditions?: string;
  created_at: string;
  updated_at: string;
}
```

### Fetching Active Promotions (Sales Rep)
```typescript
const fetchActivePromotions = async () => {
  const now = new Date().toISOString();
  const { data } = await supabase
    .from('promotions')
    .select('*')
    .eq('is_active', true)
    .or(`end_date.is.null,end_date.gt.${now}`)
    .order('created_at', { ascending: false });
  setActivePromotions(data || []);
};
```

### Seed Data for Bermuda Bundle
```json
{
  "name": "Bermuda Pool + 4-Person Barrel Sauna",
  "description": "Complete backyard transformation package",
  "bundle_price": 72863,
  "included_items": [
    { "name": "Bermuda Pool" },
    { "name": "4-Person Barrel Sauna", "value": "$18,000" },
    { "name": "Salt System" },
    { "name": "3D Patio Render" },
    { "name": "5 Feet of Pavers" },
    { "name": "2 LED Lights" }
  ],
  "highlight_text": "3-Month Installation",
  "is_active": true
}
```

---

## Visual Flow

**Admin Dashboard:**
```text
MANAGEMENT section
├── Users
├── Sales Reps
├── Clients
├── Contractors
├── Referrals
├── [NEW] Promotions  <-- Gift/Tag icon
└── API Manager
```

**Sales Rep Dashboard:**
```text
┌─────────────────────────────────────────────┐
│ SALES REP PORTAL                            │
├─────────────────────────────────────────────┤
│ [Stats Cards: Total, Qualified, etc.]       │
├─────────────────────────────────────────────┤
│ 🎁 ACTIVE PROMOTIONS (2)            [Hide]  │
│ ┌─────────────────────────────────────────┐ │
│ │ Bermuda Pool + Barrel Sauna             │ │
│ │ $72,863 | 3-Month Installation          │ │
│ │ • Bermuda Pool                          │ │
│ │ • 4-Person Barrel Sauna                 │ │
│ │ • Salt System, Pavers, LEDs             │ │
│ └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│ YOUR ASSIGNED CLIENTS                       │
│ [Client cards...]                           │
└─────────────────────────────────────────────┘
```

---

## Benefits
1. **Centralized Promotion Management** - Create and manage all promotions from one place
2. **Real-time Sales Rep Updates** - Sales reps always see current active promotions
3. **Consistent Pricing** - Bundle prices are stored centrally, reducing errors
4. **Quick Toggle** - Instantly activate/deactivate promotions as needed
5. **Historical Tracking** - Keep records of past promotions
