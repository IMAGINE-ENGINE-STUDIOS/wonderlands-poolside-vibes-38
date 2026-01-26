

# Implementation Plan: Add Promotions Tab with Dark Theme

## Overview
This plan will add the missing **Promotions** navigation tab to the Admin Dashboard and ensure the entire Client Management section (and all admin sections) maintains a consistent dark theme matching the "Command Center" aesthetic.

## Issues Identified
1. **Missing Promotions Tab**: The navigation sidebar has no "Promotions" item despite the plan being approved
2. **Light Background on Cards**: The Card components inside AdminClientManager are using holographic-panel styling but the base shadcn Card component has light backgrounds that bleed through
3. **Missing Database Table**: The `promotions` table does not exist yet

---

## Step 1: Database Migration

Create the `promotions` table with all required columns:

```text
Table: promotions
- id: UUID (primary key)
- name: TEXT (e.g., "Bermuda Pool + Barrel Sauna")
- description: TEXT
- bundle_price: NUMERIC
- original_price: NUMERIC (nullable)
- included_items: JSONB (array of items)
- start_date: TIMESTAMP (nullable)
- end_date: TIMESTAMP (nullable)
- is_active: BOOLEAN (default: true)
- image_url: TEXT (nullable)
- highlight_text: TEXT (nullable)
- terms_conditions: TEXT (nullable)
- created_at/updated_at: TIMESTAMP
```

**RLS Policies:**
- SELECT: Public read access for sales reps
- INSERT/UPDATE/DELETE: Authenticated admins only

**Seed Data:** Insert the Bermuda Pool + Barrel Sauna bundle ($72,863)

---

## Step 2: Create AdminPromotionsManager Component

Create `src/components/admin/AdminPromotionsManager.tsx` with:

**Summary Cards:**
- Total Promotions count
- Active Promotions count  
- Expired Promotions count

**Features:**
- View all promotions in a dark-themed table/card layout
- Create new promotions via dialog form
- Edit existing promotions
- Toggle active/inactive status with one click
- Delete promotions with confirmation dialog

**Styling:**
- Matches existing command center holographic aesthetic
- Dark background (`bg-[#0a0a0f]`)
- Neon cyan/blue glows and borders
- Monospace fonts throughout

---

## Step 3: Update AdminDashboard Navigation

Modify `src/pages/AdminDashboard.tsx`:

**Add to sidebar (after Referrals in MANAGEMENT section):**
```typescript
<NavItem 
  icon={Tag} 
  label="Promotions" 
  active={activeSection === "promotions"} 
  onClick={() => setActiveSection("promotions")} 
/>
```

**Add section render:**
```typescript
{activeSection === "promotions" && (
  <div className="animate-fade-in bg-[#0a0a0f] -m-6 p-6 min-h-screen">
    <AdminPromotionsManager />
  </div>
)}
```

---

## Step 4: Fix Dark Theme on Client Management

The Card components in AdminClientManager need their internal backgrounds fixed. Update the `holographic-panel` class usage to ensure:

- Card backgrounds are truly dark (not the default light shadcn theme)
- Table headers and rows have dark backgrounds
- All text maintains proper contrast (cyan/blue on dark)

**Specific fixes needed:**
- Add explicit background colors to table header: `bg-black/40`
- Add dark backgrounds to table rows: `bg-black/20`
- Ensure inputs/selects have dark backgrounds

---

## Step 5: Sales Rep Dashboard Integration (Future)

After the admin side is complete, update `src/pages/SalesRepDashboard.tsx` to:
- Fetch active promotions on load
- Display "ACTIVE PROMOTIONS" section with promotion cards
- Show bundle prices and included items

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `supabase/migrations/[timestamp]_create_promotions.sql` | CREATE | Database table + RLS policies + seed data |
| `src/components/admin/AdminPromotionsManager.tsx` | CREATE | Full CRUD management component |
| `src/pages/AdminDashboard.tsx` | MODIFY | Add navigation item + section render + import Tag icon |
| `src/components/AdminClientManager.tsx` | MODIFY | Fix table/card dark backgrounds |

---

## Technical Notes

### Promotion TypeScript Interface
```typescript
interface Promotion {
  id: string;
  name: string;
  description: string;
  bundle_price: number;
  original_price?: number;
  included_items: Array<{ name: string; value?: string }>;
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

### Active Promotions Query
```typescript
const fetchActivePromotions = async () => {
  const now = new Date().toISOString();
  const { data } = await supabase
    .from('promotions')
    .select('*')
    .eq('is_active', true)
    .or(`end_date.is.null,end_date.gt.${now}`)
    .order('created_at', { ascending: false });
  return data || [];
};
```

