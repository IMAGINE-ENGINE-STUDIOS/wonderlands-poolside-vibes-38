

# Bulk Client Assignment to Sales Representatives

## Overview

Add a "Bulk Assign" feature to the Admin Client Manager that allows assigning multiple selected clients to a sales representative at once. This will appear alongside the existing "Automate Selected" button when clients are selected.

## Implementation Details

### 1. Add State for Bulk Assignment Dialog

Add new state variables to manage the bulk assignment dialog:
- `isBulkAssignDialogOpen` - controls dialog visibility
- `bulkAssignRepId` - stores selected sales rep for bulk assignment
- `isBulkAssigning` - loading state during assignment

### 2. Create Bulk Assignment Function

Create `bulkAssignSalesRep` function that:
- Takes the selected sales rep ID and updates all selected clients
- Uses Supabase batch update with `.in('id', [...selectedClients])`
- Logs activity for each client assignment
- Shows success toast with count of assigned clients
- Clears selection after successful assignment

### 3. Add UI Components

**Bulk Assign Button** (appears when clients are selected):
- Position: Next to existing "Automate Selected" button
- Style: Match the holographic/neon theme
- Shows count of selected clients
- Opens the bulk assignment dialog

**Bulk Assignment Dialog**:
- Sales rep selection dropdown (lists all active sales reps)
- "Unassign" option to remove assignments
- Confirm and Cancel buttons
- Loading indicator during assignment

### 4. File Changes

**File: `src/components/AdminClientManager.tsx`**

| Location | Change |
|----------|--------|
| Lines ~86-93 | Add state: `isBulkAssignDialogOpen`, `bulkAssignRepId`, `isBulkAssigning` |
| After line ~356 | Add `bulkAssignSalesRep` function |
| Lines ~857-866 | Add "Bulk Assign" button next to "Automate Selected" |
| After bulk button | Add bulk assignment Dialog component |

---

## Technical Implementation

### New Function: `bulkAssignSalesRep`

```text
async function bulkAssignSalesRep():
  1. Get array of selected client IDs
  2. Update clients table: SET assigned_sales_rep_id WHERE id IN (selected)
  3. Insert activity log entries for each client
  4. Update local state to reflect changes
  5. Clear selection
  6. Show success toast
  7. Close dialog
```

### UI Flow

```text
User selects clients via checkboxes
         |
         v
"Bulk Assign" button appears (shows count)
         |
         v
User clicks button --> Dialog opens
         |
         v
User selects sales rep from dropdown
         |
         v
User clicks "Assign" --> API updates all clients
         |
         v
Success toast + selection cleared
```

## Summary

This feature adds efficient bulk assignment capability while:
- Following existing patterns in the codebase
- Matching the holographic/neon UI theme
- Reusing the existing `salesReps` data already loaded
- Providing activity logging for audit trail

