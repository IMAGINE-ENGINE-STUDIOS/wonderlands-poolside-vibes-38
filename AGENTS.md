
- SOCIALITE architecture rules live in src/components/socialite/AGENTS.md — why: keeps root small.
- Every home discipline links to a suite (src/lib/suiteRoutes.ts); non-dedicated ones use /suites/:category (CategorySuite on ProductSuite); every suite lists all boards; FlipEditorBoard opens SurveyQuoteTool — why: one board+quote path for all trades.
- Command Center and Contractor/Supplier hubs share `/admin` (AdminDashboard picks the workspace by role) and show only database-derived figures; never add sample rows or invented stats — why: one protected entry point, trustworthy numbers.
