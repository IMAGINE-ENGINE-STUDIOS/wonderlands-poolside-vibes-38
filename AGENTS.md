
- SOCIALITE architecture rules live in src/components/socialite/AGENTS.md — why: keeps root small.
- Every home discipline links to a suite (src/lib/suiteRoutes.ts); non-dedicated ones use /suites/:category (CategorySuite on ProductSuite); every suite lists all boards; FlipEditorBoard opens SurveyQuoteTool — why: one board+quote path for all trades.
- Command Center and Contractor/Supplier hubs share `/admin` (AdminDashboard picks the workspace by role) and show only database-derived figures; never add sample rows or invented stats — why: one protected entry point, trustworthy numbers.

- Multi-tenancy: business tables carry company_id (default current_company_id(), platform company for public visitors); RLS grants company members via is_company_member(); company roles live in company_members, never profiles — why: licensed companies must never see each other's data.
- One sign-in: all users use /auth; business sign-up (account_type=business) creates a company + owner in handle_new_user; legacy login routes redirect — why: one secure gateway.
