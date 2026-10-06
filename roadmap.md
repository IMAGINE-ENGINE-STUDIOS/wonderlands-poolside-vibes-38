# Roadmap

## In progress
- [x] SaaS Phase 1: companies + members, company_id isolation on business tables, single /auth sign-in, verified with 2 test companies
- [ ] SaaS design phases (home page + Flip style), company workspace, licensing — waiting on user go-ahead
- [x] Dashboards Job 1: remove invented figures (System 100%, DB health, marketplace 500+/$300k+/1000+/<24h)
- [x] Dashboards Job 2: action queue + clickable telemetry
- [x] Dashboards Job 3: Technology Hub launcher (global search moved to Job 6)
- [x] Dashboards Job 4: contractor/supplier overview + bid tracking (+ Job 5 projects & compliance; POs, payments, messages still open)
- [x] Dashboards Job 5: payouts & work orders, messages, projects, compliance
- [x] Dashboards Job 6: ⌘K search, contractor isolation from company analytics, single telemetry fetch
- [x] Add FLIP V8 and make it the home-page edition
- [x] Disable V8 page-turn effects and gesture-based navigation
- [x] Calm V8 index motion and keep arrow navigation
- [x] Verify desktop/mobile behavior and preview build

## Done
- [x] Architect curvature — DXF-exact circular arcs with typed radius, tangent
      corner fillets, tensioned splines, draggable apex handles and a numeric
      curvature inspector (`src/lib/design/curvature.ts`)
- [x] Cropping tool — pools, spas, ledges and buildings cut the paver deck and
      turf they sit on; SF and price read net (`src/lib/design/shapeCrop.ts`)
- [x] Board tools moved into the sheet header (icon-only, mobile-friendly)
- [x] Shared 70 ft default board altitude tuned for pool + patio work
- [x] Global Design Board dossier aggregates every trade (estimate, take-off,
      specifications, process, project payment schedule)

## Next build (approved plan, Oct 4)
- [x] Fix blank live sign-in page (bad preload line in index.html) — needs publish
- [x] Job A — /workspace + /account rebuilt, Command Center reskin + Today/Companies/preview (inner Command Center sections still old styling)
- [ ] Job B1 — Web Builder canvas, drag/resize, layers, text/image/background controls
- [ ] Job B2 — Widget library (all Wonderlands + FLIP V3), company products/cards, publish /site/:company/:page

## Final job — CRM, Web Builder, customer sites
- [x] Phase 1: company CRM in /workspace (My Day, deals pipeline drag-and-drop + forecast, accounts/contacts/timeline, 1-click lead conversion, deal↔quotes/invoices, team assignment)
- [x] Phase 2: drag-and-drop Web Builder saving to company_sites (pages, blocks, layers, styles, theme, catalogue import, FLIP + tool embeds, draft/publish)
- [ ] Phase 3: public customer sites /sites/:slug with lead capture into the company CRM
- [ ] Phase 4: Command Center links to inspect each company's workspace and site

- [ ] Save every website form submission (solar, quote tool, other sites) into clients + CRM — plan awaiting user DNS additions
