/**
 * SocialiteAdmin — the full /admin dashboard rebuilt inside SOCIALITE.
 * Each module is the same component the /admin page uses (same data, same
 * actions), lazy-loaded so SOCIALITE stays fast. Wrapped in .socialite-skin
 * so the modules pick up SOCIALITE's dark zinc look.
 */
import React, { Suspense, lazy, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const mod = {
  overview: lazy(() => import("@/components/AdminDashboardMetrics")),
  products: lazy(() => import("@/components/StandardizedProductManager")),
  users: lazy(() => import("@/components/AdminUserManagement")),
  orders: lazy(() => import("@/components/AdminOrdersManager")),
  quotes: lazy(() => import("@/components/AdminQuotesManager")),
  invoices: lazy(() => import("@/components/AdminInvoicesManager")),
  salesreps: lazy(() => import("@/components/admin/SalesRepManager")),
  repcategories: lazy(() => import("@/components/admin/SalesRepCategoryManager")),
  headofsales: lazy(() => import("@/components/HeadOfSalesDashboard")),
  promotions: lazy(() => import("@/components/admin/AdminPromotionsManager")),
  contractors: lazy(() => import("@/components/admin/AdminContractorManagement")),
  projects: lazy(() => import("@/components/admin/projectManagement/AdminProjectManagement")),
  referrals: lazy(() => import("@/components/AdminReferralsManager")),
  customers: lazy(() => import("@/components/admin/CustomerCacheSearch")),
  sequences: lazy(() => import("@/components/admin/AutomationSequencesManager")),
  automationstatus: lazy(() => import("@/components/admin/AutomationStatusManager")),
  applications: lazy(() => import("@/components/admin/AdminApplicationsPanel")),
  jobs: lazy(() => import("@/components/admin/AdminJobBoardManager")),
  api: lazy(() => import("@/components/admin/AdminApiManagement")),
  performance: lazy(() => import("@/components/admin/PerformanceMonitoring").then(m => ({ default: m.PerformanceMonitoring }))),
} as const;

type Key = keyof typeof mod;
const TABS: { id: Key; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "products", label: "Products" },
  { id: "orders", label: "Orders" },
  { id: "quotes", label: "Quotes" },
  { id: "invoices", label: "Invoices" },
  { id: "customers", label: "Customer Search" },
  { id: "promotions", label: "Promotions" },
  { id: "projects", label: "Projects" },
  { id: "contractors", label: "Contractors" },
  { id: "salesreps", label: "Sales Reps" },
  { id: "repcategories", label: "Rep Categories" },
  { id: "headofsales", label: "Head of Sales" },
  { id: "referrals", label: "Referrals" },
  { id: "sequences", label: "Sequences" },
  { id: "automationstatus", label: "Automation Status" },
  { id: "users", label: "Users" },
  { id: "applications", label: "Applications" },
  { id: "jobs", label: "Job Board" },
  { id: "api", label: "API" },
  { id: "performance", label: "Performance" },
];

export default function SocialiteAdmin() {
  const { profile } = useAuth() as any;
  const [tab, setTab] = useState<Key>(() => (localStorage.getItem("pf_admin_tab") as Key) || "overview");
  const pick = (k: Key) => { setTab(k); localStorage.setItem("pf_admin_tab", k); };
  const Comp: any = mod[tab] ?? mod.overview;

  return (
    <div className="p-4 lg:p-8 space-y-5">
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight text-zinc-100">Admin</h1>
        <p className="text-[13px] text-zinc-500">Everything from the admin dashboard, live on your real data.</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {TABS.map(t => (
          <button key={t.id} onClick={() => pick(t.id)}
            className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition ${tab === t.id ? "bg-white text-black" : "bg-zinc-900 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"}`}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="socialite-skin rounded-2xl border border-zinc-800 bg-zinc-950/60 p-3 lg:p-5 min-h-[400px]">
        <Suspense fallback={<div className="text-[13px] text-zinc-500 p-6">Loading…</div>}>
          {tab === "users" ? <Comp currentAdmin={profile} /> : <Comp />}
        </Suspense>
      </div>
    </div>
  );
}
