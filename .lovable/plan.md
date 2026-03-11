

# Procurement Integration with Admin Projects & Contractor Dashboard

## Overview

Connect the existing admin project management system (`construction_projects` with `project_phases` and `phase_items`) to the procurement marketplace, and add a "Procurement" tab to the contractor dashboard so approved contractors can browse and bid on procured projects/tasks.

---

## Database Changes

### 1. New table: `procurement_listings`
Bridges `construction_projects` to the procurement marketplace. Admin can procure an entire project or individual phase items.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| project_id | uuid FK → construction_projects | |
| phase_item_id | uuid FK → phase_items | NULL = entire project |
| title | text | Auto-filled from project/item name |
| description | text | |
| location | text | Jobsite address |
| budget_min | numeric | |
| budget_max | numeric | |
| deadline | date | |
| status | text | 'open', 'assigned', 'completed', 'cancelled' |
| created_by | uuid | Admin who posted it |
| created_at, updated_at | timestamptz | |

RLS: Public SELECT for open listings. Admin ALL.

### 2. New table: `procurement_proposals`
Contractors submit bids on procurement listings.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| listing_id | uuid FK → procurement_listings | |
| contractor_id | uuid FK → contractors | |
| proposal_type | text | 'existing_service' or 'custom' |
| service_id | uuid FK → contractor_services | If using existing pricing |
| proposed_price | numeric | |
| proposal_text | text | Detailed description |
| estimated_timeline | text | |
| status | text | 'pending', 'accepted', 'rejected' |
| created_at, updated_at | timestamptz | |

RLS: Contractors can CRUD own proposals. Admin can view/update all.

---

## Admin Dashboard Changes

### In `ProjectDetailView.tsx`
- Add a **"Procure"** button on each phase item and a **"Procure Entire Project"** button at the project level
- Clicking opens a dialog to set: location (jobsite address), budget range, deadline, description
- For "entire project": creates one `procurement_listing` with `phase_item_id = NULL`
- For individual task: creates one listing per selected item with `phase_item_id` set
- Show a badge on items/projects that are already procured
- Add a "View Proposals" section showing contractor bids for each listing

---

## Contractor Dashboard Changes

### In `ContractorProfile.tsx`
- Add a 4th tab: **"Procurement"** (icon: Briefcase)
- Update `TabsList` from `grid-cols-3` to `grid-cols-4`
- Tab content shows:
  1. **Available Listings** — all open `procurement_listings` with location, budget, deadline
  2. **My Proposals** — contractor's submitted proposals and their status

### Proposal Submission
When a contractor clicks "Apply" on a listing:
- **Option A**: Use existing service pricing — select from their `contractor_services`, auto-fill price
- **Option B**: Custom proposal — enter a detailed description, custom price, timeline
- Contractor can bid on the whole project OR individual tasks independently

---

## Component Structure

```text
src/
  components/
    admin/projectManagement/
      ProcurementDialog.tsx        ← Admin dialog to procure project/task
      ProcurementProposalsList.tsx  ← View proposals on a listing
    contractor/
      ContractorProcurementTab.tsx  ← Procurement tab for contractor dashboard
      ProcurementProposalForm.tsx   ← Contractor bid submission form
```

---

## Implementation Steps

1. **Migration**: Create `procurement_listings` and `procurement_proposals` tables with RLS policies
2. **Admin UI**: Add "Procure" buttons + dialog in `ProjectDetailView.tsx`, show procurement status badges
3. **Contractor Tab**: Add "Procurement" tab to `ContractorProfile.tsx` with listing browser and proposal form
4. **Proposal Logic**: Allow contractors to apply with existing service prices or custom proposals for individual tasks or entire projects

---

## Technical Notes
- Reuse existing `contractor_services` table for "apply with existing pricing" flow
- The `procurement_listings` table is separate from `job_postings` since these are admin-initiated from real construction projects, not user-posted marketplace jobs
- Only approved contractors (`status = 'approved'`) can view and submit proposals
- Location field is free-text for the jobsite address

