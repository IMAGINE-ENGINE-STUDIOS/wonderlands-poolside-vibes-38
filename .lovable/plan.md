

# Implementation Plan: Add Promotions Tab to Admin Dashboard

## Overview
Add a **Promotions** navigation tab to the Admin Dashboard under the **MANAGEMENT** section, positioned between "Users" and "Sales Reps". This will allow you to manage company promotions (like the Bermuda Pool + Barrel Sauna bundle). Active promotions will automatically display to Sales Representatives so they stay informed.

---

## Step 1: Create Database Table

Create the `promotions` table with full CRUD support:

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Promotion name |
| description | TEXT | Detailed description |
| bundle_price | NUMERIC | Total bundle price |
| original_price | NUMERIC | Original price (for showing savings) |
| included_items | JSONB | Array of items in the bundle |
| start_date | TIMESTAMP | When promotion starts |
| end_date | TIMESTAMP | When promotion expires |
| is_active | BOOLEAN | Toggle on/off |
| highlight_text | TEXT | Short tagline |
| image_url | TEXT | Optional image |
| created_at | TIMESTAMP | Auto-generated |
| updated_at | TIMESTAMP | Auto-updated |

**Seed Data:** Insert the Bermuda Pool + Barrel Sauna bundle ($72,863)

---

## Step 2: Create AdminPromotionsManager Component

Create `src/components/admin/AdminPromotionsManager.tsx` with:

**Summary Cards:**
- Total Promotions
- Active Promotions  
- Expired Promotions

**Features:**
- View all promotions in dark-themed table
- Create new promotions via dialog
- Edit existing promotions
- One-click toggle active/inactive
- Delete with confirmation

**Styling:**
- Dark background (`bg-[#0a0a0f]`)
- Cyan/blue neon glows matching command center aesthetic
- Monospace fonts throughout

---

## Step 3: Update Admin Dashboard Navigation

Modify `src/pages/AdminDashboard.tsx`:

**Add navigation item in MANAGEMENT section (after Users, before Sales Reps):**

Current order:
```text
MANAGEMENT
├── Users
├── Sales Reps    ← Promotions goes BEFORE this
├── Clients
├── Contractors
├── Referrals
└── API Manager
```

New order:
```text
MANAGEMENT
├── Users
├── Promotions    ← NEW (Tag icon)
├── Sales Reps
├── Clients
├── Contractors
├── Referrals
└── API Manager
```

**Add section render with dark background wrapper**

---

## Step 4: Sales Rep Dashboard Integration

Update `src/pages/SalesRepDashboard.tsx` to:
- Fetch active promotions on load
- Display "ACTIVE PROMOTIONS" section
- Show promotion cards with bundle details
- Match holographic aesthetic

---

## File Changes Summary

| File | Action |
|------|--------|
| `supabase/migrations/xxx_create_promotions.sql` | CREATE - Database table + RLS + seed data |
| `src/components/admin/AdminPromotionsManager.tsx` | CREATE - Full CRUD management component |
| `src/pages/AdminDashboard.tsx` | MODIFY - Add nav item + import Tag icon + section render |
| `src/pages/SalesRepDashboard.tsx` | MODIFY - Display active promotions |

---

## Technical Details

### Navigation Change in AdminDashboard.tsx

Add `Tag` to imports and insert new NavItem between Users and Sales Reps:

```typescript
// Line 248-249 current:
<NavItem icon={Users} label="Users" ... />
<NavItem icon={Users} label="Sales Reps" ... />

// Will become:
<NavItem icon={Users} label="Users" ... />
<NavItem icon={Tag} label="Promotions" active={activeSection === "promotions"} onClick={() => setActiveSection("promotions")} />
<NavItem icon={Users} label="Sales Reps" ... />
```

### Promotions Section Render

```typescript
{activeSection === "promotions" && (
  <div className="animate-fade-in bg-[#0a0a0f] -m-6 p-6 min-h-screen">
    <AdminPromotionsManager />
  </div>
)}
```

### Active Promotions Query (for Sales Reps)

```typescript
const { data } = await supabase
  .from('promotions')
  .select('*')
  .eq('is_active', true)
  .or(`end_date.is.null,end_date.gt.${now}`)
  .order('created_at', { ascending: false });
```

