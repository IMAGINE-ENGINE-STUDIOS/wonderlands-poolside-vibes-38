# Next build: a real redesign, a real CRM, an integrated tools hub

You are right about three things, and this plan fixes them directly:
1. The Command Center only got a new left menu. Every section (Quotes, Clients, Products, Invoices, Users and the rest) is still the old dark/blue page. It is also not white.
2. The company workspace is a thin list of tabs. It is not a CRM, and it can't replace Salesforce.
3. The Technology Hub is a grid of link cards, the same as your mock-up. It should be one integrated place where the tools open inside the dashboard.

This plan is split into four jobs. Each one ends with screenshots of every page it touched, for you to check before the next job starts.

---

## Job 1: White Command Center, every section restyled

The goal is a visible change on every single page of /admin, not just the menu.

- **Light editorial theme:** white/ivory background, ink text, teal and coral accents only. Large serif chapter titles and numbered chapters, like the home page and the flip book. The dark "ink" look is removed from /admin.
- **One page frame for every section:** a chapter header (number, title, one-line description, main actions) and white cards. All 35 sections are wrapped in it, replacing the 30 dark full-screen backgrounds.
- **Inside each section:** tables, filters, tabs, dialogs, inputs and badges move to the light design: clean tables with sticky headers, row hover, a clear empty state, and nothing running off the screen.
- **Menu:** white, grouped into chapters (Today, Sales & CRM, Catalog, Money, Operations, Marketing, Technology, Platform), with your ⌘K search at the top.
- **Not touched:** product images, product card outlines, and the style of quote documents. Quote and invoice tools get the new frame around them, but their documents are not changed.
- **Check:** a screenshot of all 35 sections at desktop and phone sizes, signed in as admin.

## Job 2: Full CRM for every licensed company (the Salesforce replacement)

This is built for every company in /workspace, and the admin gets the same CRM for Wonderlands.

- **Accounts and contacts:** company or person records with a timeline of every call, email, SMS, note, quote, invoice and project.
- **Leads:** capture from the website, imports (CSV), and SOCIALITE; then assign, score and convert into an account and a deal.
- **Deals pipeline:** a drag-and-drop board with stages each company can set itself, deal value, probability, expected close date, and weighted forecast.
- **Activities and tasks:** calls, meetings and follow-ups with due dates, a "My day" list, overdue alerts, and a calendar view.
- **Quotes and invoices linked to deals:** these use your existing quote and invoice tools, tied to the account and deal.
- **Team:** owners and reps, record ownership, and role permissions (owner, admin, rep, viewer).
- **Reports:** pipeline by stage, win rate, revenue by month, rep leaderboard and lead sources. Every number comes from real records.
- **Custom fields and saved views** for each company.
- **Privacy:** each company sees only its own data, with the same isolation that was tested in Phase 1.
- **Check:** create two test companies, run a full lead → deal → quote → invoice flow in each, and prove neither can see the other's data.

## Job 3: An integrated Technology Hub

- The tools open **inside the dashboard**: 3D Studio, Solar Studio, Flip Builder V3, Design Board, Blueprint Builder, Content Editor, SOCIALITE, Procurement and Repository. The menu and the account or deal you're working on stay on screen, so you aren't sent off to another page.
- **"Recent work" for each tool:** the latest designs, books, campaigns and blueprints from real saved records.
- **Context handoff:** "New design for this client" and "Quote from this design" work from a CRM account or deal.
- The same hub is in /workspace, limited to what the company's license includes.

## Job 4: Workspace and customer account brought to the same standard

- **/workspace** uses the Job 1 light frame and gets the CRM from Job 2 as its main chapter. It keeps the existing chapters: bids, projects, payouts, messages, licenses, tools and settings.
- **/account** (homeowners) gets a polish pass in the same style.
- **Admin preview:** the admin can open the workspace or account previews and check each one without a real user.

## After this: the Web Builder (Jobs B1 and B2 from before)

These are unchanged and start only after Jobs 1–4 are approved:
- **B1:** drag and resize, layers, and full control of text, images and backgrounds.
- **B2:** every Wonderlands widget and every FLIP V3 layout available as blocks, product cards each company can edit, and publishing.

---

## Technical details

- **Theme:** add `--cc-*` light tokens in `src/index.css`, and give `EditorialShell` a `tone="paper"` option. Add a `SectionFrame` component (header, actions, body). Replace every `bg-[#0a0a0f] -m-6 p-6 min-h-screen` wrapper in `AdminDashboard.tsx` with `SectionFrame`. Then restyle each admin child component's dark classes to the tokens, one file at a time. Split `AdminDashboard.tsx` (906 lines) into a lazy-loaded section registry (`src/pages/admin/sections/*`) so it stays fast.
- **CRM database:** new tables `crm_accounts`, `crm_contacts`, `crm_leads`, `crm_deals`, `crm_pipeline_stages`, `crm_activities`, `crm_tasks`, `crm_custom_fields` and `crm_saved_views`. Each has `company_id default current_company_id()`, grants, RLS through `is_company_member()`, and indexes on `(company_id, owner_id, stage, updated_at)`. Existing `clients` rows are brought into Wonderlands' accounts and leads, without deleting the old table. Lists use server-side pagination, and drag and drop uses dnd-kit.
- **Hub:** a `ToolHost` component lazy-loads each existing tool page inside the shell, using the URL `/admin/tools/:tool` and `/workspace/tools/:tool`. Each tool's records are pulled from the tables it already uses.
- **Checks for every job:** typecheck; Playwright screenshots of every page, both as admin (signed-in session) and as a test company; the RLS cross-company test; no sample data.
