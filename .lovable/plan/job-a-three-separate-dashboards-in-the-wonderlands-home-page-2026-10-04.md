# Job A — Three separate dashboards in the Wonderlands home page / FLIP style

## What exists today (checked)
- **Command Center** (`/admin`, platform admin): works, ~35 sections in one 900-line page, dark gold styling, defaults to Quotes.
- **Contractor workspace**: lives inside the same `/admin` page. Has real bids, projects, licenses, payouts, messages — but it is keyed to the old `contractors` list, not to the new company accounts. A business that signs up today gets a company but sees "No contractor profile yet", and that button points to a registration page that was removed. So the contractor solution is only partly built.
- **Customer account** (`/account`): orders, offers and addresses are real, but the Payments tab shows a fake card (•••• 4242) and the Tracking tab shows a fake "Pool Cleaning Kit" order. Partly built, with mock data.

## Goal
Split into three independent pages, each its own file, each testable on its own without a real user, all in the editorial home/FLIP look. Quotes, product cards and product images are not touched.

```text
/admin       Command Center   (platform admin only)
/workspace   Company workspace (any business/contractor company)
/account     Customer account  (homeowners)
/admin/preview/:view   admin-only live preview of workspace or account
```

## 1. Shared editorial shell (built once, used by all three)
- Cover band like the home hero: big headline, greeting, date, one-line status; soft teal-to-coral glow; Sora headings, Manrope body.
- Left "table of contents" rail like the FLIP reader (numbered chapters, collapsible on mobile into a bottom sheet).
- Glass panels, generous spacing, thin rules, page-number style section labels.
- Light theme for workspace and customer (no cyan text); Command Center gets the same layout in a deep navy/ink variant with coral and teal accents (replaces the current gold-on-black).
- Shared pieces: cover, rail, stat tile, action card, empty state, loading skeleton. All colors come from the theme, nothing hardcoded.

## 2. Command Center (`/admin`)
Chapters, mapping every existing section (nothing removed):
1. Today — real metrics (one set, duplicates removed), action queue (quotes, applications, unassigned clients, pending orders, overdue invoices, pending bids), ⌘K search.
2. Sales & CRM — clients, sales reps, head of sales, categories, referrals, customer cache.
3. Quotes & Invoices — quotes, quote tool, invoices, invoice tool, calculator.
4. Projects — projects, procurement, contractors, applications, job board, delivery.
5. Catalog — unified products, pool specs, promotions.
6. Marketing — SOCIALITE launcher, automation sequences/templates/status.
7. Builders — Web Builder (placeholder card until Job B), FLIP V3 launcher.
8. Companies — list of licensed companies (name, trades, status, members count) from the companies table.
9. Settings — users, API, performance, setup.
- Opens on Today instead of Quotes.
- Role preview switch at the top: "View as company workspace" / "View as customer" opens the preview route.

## 3. Company workspace (`/workspace`, new page file)
For every business account (any trade, not only suppliers/installers):
1. Today — company name, plan/status, real counts (their clients, open quotes, invoices, projects).
2. Clients — their own clients only (company-scoped).
3. Quotes & Invoices — their own records.
4. Projects & Bids — existing opportunities/bids/assigned projects (kept), plus their own projects.
5. Payouts & Messages — existing tabs.
6. Compliance — licenses and agreement (existing).
7. Marketing — SOCIALITE link. Builders — FLIP V3 / Web Builder link.
8. Company settings — name, trades, phone, logo, team members list.
- Fix the broken path: workspace resolves the user's company from company membership; the old contractor record is optional (if missing, bids show "Set up your trade profile" which creates it inline instead of linking to a removed page).
- `/admin` sends business users to `/workspace`; the sign-in redirect is updated the same way.

## 4. Customer account (`/account`)
1. Welcome cover with name and next step (book consultation, Calendly link).
2. My quotes — their saved quotes (read-only, existing quote style untouched).
3. Orders & tracking — real orders and their real status timeline (fake tracking order removed).
4. Invoices & payments — their invoices with pay links (fake card removed; no stored cards).
5. Offers — existing promotions. 6. Addresses & preferences — existing.
- Every tab has a real empty state; no sample rows.

## 5. Testing without a real user ("technology only")
- Admin-only preview route `/admin/preview/workspace` and `/admin/preview/account` renders each page with the admin's choice of company or customer, read-only.
- A test checklist page per solution is not needed for users; instead I verify with automated browser checks using dedicated test accounts I create myself (one business company, one homeowner), screenshot each chapter on desktop and mobile, and confirm no console errors and no cross-company data.

## 6. Acceptance checks
- Each of the three pages loads for its role and is refused for others.
- Every number traces to a real query; zero sample data in the three pages.
- Business signup → lands on `/workspace` with its company, no dead links.
- Mobile: rail collapses, nothing overflows the screen.
- Quotes, product cards, images unchanged.

## Technical details
- New files: `src/components/shell/EditorialShell.tsx` (+ Cover, Rail, StatTile, EmptyState), `src/pages/CommandCenter.tsx` (wraps existing AdminDashboard sections by chapter), `src/pages/CompanyWorkspace.tsx`, `src/pages/CustomerAccount.tsx` (replaces ConsumerDashboard), `src/pages/AdminPreview.tsx`, `src/lib/dashboardChapters.ts` (single chapter/section registry).
- Existing section components are reused and lazy-loaded per chapter for speed; AdminDashboard becomes the section renderer only.
- Company workspace queries filter by `company_id` from `company_members`; RLS already isolates companies, no new tables. Contractor record creation reuses the existing `contractors` insert policy.
- Routes in `App.tsx`: add `/workspace`, `/admin/preview/:view`; role redirects in `AuthPage` and `AdminDashboard`.
- Test accounts are created through normal signup and listed in the closing message for later deletion.
- Delivered in one run; if it runs long, order is shell → Command Center → workspace → customer → preview/tests.
