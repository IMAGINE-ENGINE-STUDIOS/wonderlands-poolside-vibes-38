# Wonderlands Platform — Commercial-Ready Plan (SaaS for Contractors)

## Goal
Turn Wonderlands into software that any construction or outdoor company (pools, landscaping, outdoor kitchens, enclosures, solar, design studios, general contractors) can license. Each company gets its own private workspace with CRM, admin tools, design studios, quoting, product customization, invoicing and advertising (SOCIALITE). One sign-in page and one registration flow for everyone. All screens restyled in the home page and Flip book look.

## What is wrong today (confirmed)
- Five separate sign-in screens: main sign-in, Contractor login, Sales rep login, SOCIALITE sign-in, and an old Admin pop-up.
- The Contractor login only asks for an email, with no password. Anyone who knows a contractor's email can open their profile. This is a security hole.
- The old Admin pop-up has demo passwords written into the website.
- Contractor registration saves a form without creating a real account, so contractors can't sign in properly afterward.
- There is no "contractor" account type in the database. Contractors and installers are saved as "supplier", which is why the workspace was built around suppliers and installers.
- There is no "company" concept. All data belongs to Wonderlands, so another company can't have its own private clients, quotes or invoices.

## The new model

```text
Wonderlands (platform owner, you)
   |
   +-- Company A (pool builder)      -> its owner, staff, its clients, quotes, invoices
   +-- Company B (landscaper)        -> its owner, staff, its clients, quotes, invoices
   +-- Company C (design studio)     -> ...
   |
   +-- Homeowners (customers)        -> My Account
```

Account types: Platform admin (you), Company owner, Company staff (sales, estimator, field crew), Customer.
Each company picks its trades during sign-up (pools, landscaping, outdoor kitchens, enclosures, fencing, solar, pavers, design studio, general contracting). The trades decide which tools and catalogs show in their workspace.

## Phase 1 — One sign-in, one registration (security first)
- One page `/auth` for everyone: Sign in / Create account. Same page used by SOCIALITE (SOCIALITE keeps its own look but uses the same form logic).
- Registration asks first: "I'm a homeowner" or "I run a business".
  - Homeowner: name, email, password, phone, WhatsApp opt-in (mandatory, as before). Lands on My Account and is added to your client list (as today).
  - Business: company name, trades, phone, city/state, license number (optional), team size, password. Creates the company, makes them its owner, lands on their Company workspace with a "Finish setup" checklist.
- After sign-in everyone goes to the right place automatically: you to the Command Center, companies to their workspace, staff to their company, customers to My Account.
- Old pages `/contractor-login`, `/contractor-registration`, `/sales-rep-login`, `/sales-rep-register` redirect to the new page (old links keep working).
- Remove the email-only contractor login and the old Admin pop-up with demo passwords.
- Password reset page checked and restyled; inline error messages (no red error banners in production).
- Existing contractors are linked to accounts by email; ones without an account get an invite email to set a password.

## Phase 2 — Companies and private data (the SaaS core)
- New "companies" records with members and roles (owner, admin, sales, estimator, crew).
- Every business record gets a company owner tag: clients, quotes, invoices, orders, projects, tasks, products/price lists, flip books, SOCIALITE contacts and campaigns.
- Database rules so a company only ever sees its own data; you (platform admin) see everything.
- All existing Wonderlands data is assigned to a "Wonderlands" company, so nothing you have today changes or disappears.
- Team invites: company owner invites staff by email and sets their role.

## Phase 3 — Licensing and billing
- Reuse the existing SOCIALITE plans and Stripe checkout instead of building a second billing system: one license per company with plans (example tiers, prices to be set by you in admin): Starter, Professional, Enterprise; per-seat add-ons; 14-day trial.
- Plans switch tools on/off (CRM, Design studios, Quote tool, Invoicing, SOCIALITE, Flip Builder, API).
- Expired or unpaid companies keep read access to their data but can't send, quote or invoice.
- Your Command Center gets a "Licenses" page: companies, plan, status, seats, monthly revenue — real numbers only.

## Phase 4 — Company workspace (replaces their admin tools)
One workspace per company, same sections for every trade, filtered by their trades:
- Overview: real counts (new leads, open quotes, unpaid invoices, active projects) and a "Needs attention" list.
- CRM: clients, pipeline stages, notes, activity history, follow-ups, imports from CSV.
- Quotes: the existing quote tool, using the company's own logo, name, prices and markups (quote style stays exactly as it is today — only the company details change).
- Product catalog & customization: start from Wonderlands catalogs for their trades, set their own prices, add their own products (product images and card outlines untouched).
- Design tools: 3D studio, Global design board, Blueprint builder, Solar, Flip Builder — opened from the workspace, saving into the company.
- Invoicing: milestone invoices and Stripe payment links with the company's own details.
- Projects: phases, tasks, crew assignment, client share links.
- Advertising: SOCIALITE (email, SMS, WhatsApp, calls, social posts, campaigns) scoped to the company's own contacts.
- Settings: company profile, logo, team, license, sender name/phone/email used in their emails.
- Wonderlands' own name, Ricardo's details and Calendly link appear only on Wonderlands' company; other companies use their own.

## Phase 5 — Your Command Center (platform owner)
- Keeps everything you have plus: Companies & licenses, platform revenue, usage per company, approvals, support view of any company.
- The Wonderlands company workspace is where you run your own pool business, same as any customer company.
- Contractor marketplace (procurement/bids) stays: companies can post jobs and bid on others.

## Phase 6 — New design (home page + Flip book style)
- One shared look for the sign-in page, registration, Command Center, Company workspace and My Account, taken from the home page magazine style and the Flip book: editorial serif headings, generous white space, soft glass panels, Teal and Coral accents, calm motion, page-like sections.
- Dark Command Center gets the same editorial layout in its dark version; company and customer areas use the light version (no cyan/blue text, as required).
- Clean sidebar grouped as: Overview, CRM, Sales (Quotes, Invoices, Orders), Design, Projects, Marketing, Catalog, Settings.
- Remove old cyan "holographic" panels everywhere in the dashboards.
- Works on phones and tablets: collapsible menu, tables scroll inside their card.

## Phase 7 — My Account (customers) redesign
- Same style. Shows their real quotes, invoices with pay buttons, orders, project progress, saved designs, offers, profile and preferences.

## Phase 8 — Checks before going live
- Sign up and sign in tested as: homeowner, new company owner, invited staff, you.
- Confirm a company can never see another company's clients, quotes or invoices.
- Confirm Wonderlands data is unchanged, quotes look identical, product images and cards unchanged.
- No real messages, calls or payments sent during testing.
- Security scan rerun.

## Suggested build order (to protect your credits)
```text
Job A  Phase 1  One sign-in + registration, close the login hole        (do first)
Job B  Phase 2  Companies + private data, move Wonderlands data in      (highest risk, careful)
Job C  Phase 6  New shared design + new sidebar shell
Job D  Phase 4  Company workspace sections wired to real data
Job E  Phase 3+5 Licensing/billing + Command Center platform pages
Job F  Phase 7+8 My Account redesign + full testing
```
Each job ends with a working site; nothing is half-switched.

## Execute now: Phase 1 = data separation + secure sign-in (no screen redesign)
Order changed at your request. All design work is paused until company separation is proven.
1. Save to project memory: "Multi-tenant B2B SaaS — every business record is isolated by company_id."
2. Database: create companies and company members (owner, admin, sales, estimator, crew) with access rules and permission checks.
3. Create the "Wonderlands" company, make you its owner, and assign all existing records to it, so nothing you see today changes.
4. Add a company tag to every business table (clients, quotes, invoices, orders, projects, tasks, cost items, contractors, procurement, products/price lists, flip books, SOCIALITE contacts/campaigns/scheduled sends, communication logs, notifications).
5. Replace access rules on those tables: a person only sees their own company's records; you (platform admin) see all; customers see only their own quotes/invoices/orders.
6. One secure sign-in: one sign-in and one registration (homeowner or business). New business sign-ups automatically create their company and make them owner. Remove the email-only contractor login and the old admin pop-up with written-in demo passwords; old login links forward to the single page. Existing screens keep their current look.
7. Pages that save new records automatically attach the signed-in person's company.
8. Proof before moving on: create two test companies and confirm each one cannot see, change or delete the other's clients, quotes, invoices or projects; confirm Wonderlands data and quotes are unchanged; rerun the security scan. Report results, then stop for your go-ahead on the design phases.

## Things I need from you before building

- License prices and what each plan includes (I'll use placeholders you can edit in admin until then).
- Whether companies can see the Wonderlands catalog prices or only start from their own.
- Whether new companies need your approval before using the tools, or start a free trial immediately.

## Technical details
- Auth: single `AuthPage` with homeowner/business branches; `handle_new_user` extended to create `companies` + `company_members` from signup metadata; remove `AdminLogin` demo credentials and the email-only `ContractorLogin` query; redirects for legacy routes in `App.tsx`.
- Roles: keep `profiles.role` for platform level (`main_admin`, `consumer`); company roles live in `company_members(company_id, user_id, role)`; checks via security-definer `is_company_member(_cid)` / `has_company_role(_cid, _role)`; never stored on profiles; never localStorage.
- Tenancy: add nullable `company_id` to business tables, backfill to the Wonderlands company, then set NOT NULL; RLS `using (is_main_admin() or is_company_member(company_id))`; GRANTs on every new table.
- Billing: extend `socialite_plans`/`socialite_subscriptions` into company licenses (`company_id`), enforced via the existing `_shared/socialiteBilling.ts` meter; feature flags per plan read by a `useCompanyLicense` hook.
- Branding: company profile (logo, sender name/phone/email, Calendly) replaces hardcoded Ricardo details in quote/invoice/email senders for non-Wonderlands companies.
- Design: new semantic tokens in `index.css` (editorial light + dark), shared `WorkspaceShell` component used by Command Center, company workspace and My Account; lazy-loaded sections.
- Docs: AGENTS.md rules for tenancy and auth; README in new folders.
