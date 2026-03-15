

# Plan: Create `/jobs` Public Careers Page + Admin Job Board Management

## Overview

Create a branded, colorful public `/jobs` page showcasing four job categories. Two categories (Sales Team, Independent Contractor) link to existing registration pages. Two categories (Construction Worker, Pool Cleaner) display individual job postings managed from the Admin Dashboard.

## What Gets Built

### 1. New `/jobs` Page (`src/pages/JobsPage.tsx`)
- Branded landing page using Wonderlands teal/coral/orange palette
- Header + Footer from existing components
- **Four featured job category cards** with vibrant gradients and icons:
  - **Sales Team** -- links to `/sales-rep-register`
  - **Independent Contractor** -- links to `/contractor-registration`
  - **Construction Worker** -- shows job listings from DB (category = "construction_worker")
  - **Pool Cleaner** -- shows job listings from DB (category = "pool_cleaner")
- Clicking Construction Worker or Pool Cleaner expands/navigates to show individual postings fetched from a new `career_postings` table
- Each posting shows: title, description, location, job type (full-time/part-time), and an "Apply" button (opens email or a simple application form)

### 2. New DB Table: `career_postings`
Separate from the existing `job_postings` (which is for procurement/B2B). This table stores internal hiring posts.

```sql
CREATE TABLE public.career_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('construction_worker', 'pool_cleaner')),
  description TEXT,
  location TEXT DEFAULT 'Orlando, FL',
  job_type TEXT DEFAULT 'full_time',
  requirements TEXT,
  salary_range TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
-- Public read for active, admin write
ALTER TABLE public.career_postings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active career postings" ON public.career_postings FOR SELECT USING (is_active = true);
CREATE POLICY "Main admins can manage career postings" ON public.career_postings FOR ALL TO authenticated USING (is_main_admin()) WITH CHECK (is_main_admin());
```

### 3. Admin Dashboard: "Job Board" Section
- New nav item "Job Board" under MANAGEMENT in the admin sidebar
- Component `AdminJobBoardManager.tsx`:
  - List all career postings with status toggle
  - Create new posting form (title, category dropdown, description, location, job type, requirements, salary range)
  - Edit/delete existing postings

### 4. Route & Navigation Updates
- Add `/jobs` route in `App.tsx`
- Add "Careers" link in `Footer.tsx`

## File Changes Summary

| File | Action |
|------|--------|
| `src/pages/JobsPage.tsx` | Create -- public careers page |
| `src/components/admin/AdminJobBoardManager.tsx` | Create -- admin CRUD for postings |
| `src/App.tsx` | Add `/jobs` route |
| `src/pages/AdminDashboard.tsx` | Add "Job Board" nav item + section render |
| `src/components/Footer.tsx` | Add "Careers" link |
| `src/integrations/supabase/types.ts` | Auto-updated after migration |
| DB migration | Create `career_postings` table |

