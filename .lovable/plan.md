

# Fix: Implement Promotions Tab (Currently Missing)

## The Problem
I apologize - I was stuck in "planning mode" and never actually implemented the changes. The approved plan was never executed, which is why you don't see:
1. The Promotions tab in the navigation
2. The `AdminPromotionsManager` component
3. The `promotions` database table

## What I Will Implement Now

### 1. Create Database Table
Create `promotions` table with:
- `id`, `name`, `description`, `bundle_price`, `included_items` (JSONB)
- `is_active`, `start_date`, `end_date`
- Seed the Bermuda Pool + Barrel Sauna bundle ($72,863)

### 2. Create AdminPromotionsManager Component
New file: `src/components/admin/AdminPromotionsManager.tsx`
- Dark theme matching command center (`bg-[#0a0a0f]`)
- Summary cards: Total, Active, Expired promotions
- Full CRUD: Create, Edit, Toggle, Delete promotions
- Holographic styling with cyan/blue neon

### 3. Add Navigation Tab to Admin Dashboard
Modify `src/pages/AdminDashboard.tsx`:

**Insert at line 248-249** (between Users and Sales Reps):
```typescript
<NavItem icon={Users} label="Users" ... />
<NavItem icon={Tag} label="Promotions" active={activeSection === "promotions"} onClick={() => setActiveSection("promotions")} />  // NEW
<NavItem icon={Users} label="Sales Reps" ... />
```

**Add section render for promotions**

### 4. Update Sales Rep Dashboard
Show active promotions to sales reps so they stay informed

## Files to Create/Modify

| File | Action |
|------|--------|
| `supabase/migrations/xxx_create_promotions.sql` | **CREATE** - Database table + seed data |
| `src/components/admin/AdminPromotionsManager.tsx` | **CREATE** - Full management component |
| `src/pages/AdminDashboard.tsx` | **MODIFY** - Add Tag import, nav item at line 249, section render |
| `src/pages/SalesRepDashboard.tsx` | **MODIFY** - Display active promotions |

## Navigation Position (Exact)
```text
MANAGEMENT
├── Users           (line 248)
├── Promotions      ← INSERT HERE (new line 249)
├── Sales Reps      (moves to line 250)
├── Clients
├── Contractors
├── Referrals
└── API Manager
```

**Click "Approve" to implement these changes now.**

