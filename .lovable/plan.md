

# Sales Commission System for Jessica Grey (Head of Sales Florida)

## Overview
Build a comprehensive sales team commission system where Jessica Grey, as Head of Sales for Florida, can assign sales representatives from different categories to clients and track commissions accordingly.

## Commission Structure

| Role | Commission Rate | Description |
|------|----------------|-------------|
| Head of Sales (Jessica) | 8% | Full commission if closes alone |
| BDR (Business Development Rep) | 2% | Lead generation |
| AE (Account Executive) | 3% | Sales closing |
| CSM (Customer Success Manager) | 1% | Client retention |
| Regional Sales | 1.5% | Territory-based sales |

**Logic**: When Jessica closes a sale alone, she gets 8%. When she assigns team members, the commission is split between all parties involved based on their category rates.

---

## Database Changes

### 1. Create `sales_rep_categories` Enum
```sql
CREATE TYPE sales_rep_category AS ENUM ('bdr', 'ae', 'csm', 'regional_sales', 'head_of_sales');
```

### 2. Create `client_sales_team` Table
Track which sales reps (by category) are assigned to each client:
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| client_id | UUID | FK to clients |
| sales_rep_id | UUID | FK to profiles |
| category | sales_rep_category | BDR, AE, CSM, etc. |
| assigned_by | UUID | Who made the assignment |
| assigned_at | TIMESTAMP | When assigned |
| is_active | BOOLEAN | Currently active |

### 3. Create `sales_commissions` Table
Track earned commissions per deal:
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| client_id | UUID | FK to clients |
| sales_rep_id | UUID | FK to profiles |
| category | sales_rep_category | Role in the deal |
| deal_value | NUMERIC | Total sale amount |
| commission_rate | NUMERIC | Percentage (2%, 3%, etc.) |
| commission_amount | NUMERIC | Calculated amount |
| status | TEXT | pending, approved, paid |

### 4. Add `sales_category` to Profiles
Add column to track each sales rep's category.

---

## UI Components

### 1. Head of Sales Dashboard (Jessica's Portal)
New dashboard section accessible only to Head of Sales:

**Features:**
- View all clients (not just assigned ones)
- Assign reps from each category to clients
- View team commission summaries
- Track pipeline by team member

**Assignment Interface:**
```text
Client: Keith Kerzel
├── BDR: [Dropdown - Select BDR rep]
├── AE: [Dropdown - Select AE rep]  
├── CSM: [Dropdown - Select CSM rep]
└── Regional: [Dropdown - Select Regional rep]
```

### 2. Commission Calculator Display
Show real-time commission breakdown when viewing a client:
```text
Deal Value: $85,000
Commission Split:
├── Jessica Grey (Head of Sales): $6,800 (8%) - if solo
OR
├── Maria (BDR): $1,700 (2%)
├── John (AE): $2,550 (3%)
├── Sarah (CSM): $850 (1%)
├── Tom (Regional): $1,275 (1.5%)
└── Total Commission: $6,375 (7.5%)
```

### 3. Sales Team Management Tab
New section in Admin Dashboard to:
- Categorize existing sales reps (assign them to BDR, AE, CSM, Regional Sales)
- Designate Head of Sales (Jessica)
- View commission leaderboard

---

## Files to Create

| File | Purpose |
|------|---------|
| `supabase/migrations/xxx_sales_commission_system.sql` | Database schema changes |
| `src/components/HeadOfSalesDashboard.tsx` | Jessica's management portal |
| `src/components/ClientSalesTeamAssignment.tsx` | Multi-category rep assignment UI |
| `src/components/admin/SalesRepCategoryManager.tsx` | Categorize sales reps |
| `src/components/CommissionCalculator.tsx` | Display commission splits |

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/SalesRepDashboard.tsx` | Add Head of Sales view toggle |
| `src/pages/AdminDashboard.tsx` | Add Sales Team Categories nav item |
| `src/components/admin/SalesRepManager.tsx` | Add category assignment column |
| `src/integrations/supabase/types.ts` | Auto-generated types update |

---

## Security & Permissions

- Only users with `head_of_sales` category can assign reps to clients
- Regular sales reps can only see their assigned clients
- Admins retain full access to all functionality
- Commission data visible based on role hierarchy

---

## Technical Summary

**New Database Objects:**
- 1 new enum type (`sales_rep_category`)
- 2 new tables (`client_sales_team`, `sales_commissions`)
- 1 new column on `profiles` (`sales_category`)

**New Components:**
- Head of Sales Dashboard with team management
- Multi-category client assignment interface
- Commission tracking and calculation display

**Permissions Logic:**
- Jessica Grey (ID: `5e64621c-83c4-48c8-a3b0-dd317d7e7336`) = Head of Sales
- She can assign any sales rep to any client by category
- Each client can have max 1 rep per category (4 total + Head of Sales)

