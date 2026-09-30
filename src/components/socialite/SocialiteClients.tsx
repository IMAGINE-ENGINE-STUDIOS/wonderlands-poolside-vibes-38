/**
 * SocialiteClients — the /admin client manager (real `clients` table, map,
 * ZIP filter, reps, stages) shown inside SOCIALITE with its dark skin.
 */
import React, { Suspense, lazy } from "react";

const AdminClientManager = lazy(() => import("@/components/AdminClientManager"));

export default function SocialiteClients() {
  return (
    <div className="p-4 lg:p-8 space-y-5">
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight text-zinc-100">Clients</h1>
        <p className="text-[13px] text-zinc-500">Same clients as the admin dashboard — edits here show up there too.</p>
      </div>
      <div className="socialite-skin rounded-2xl border border-zinc-800 bg-zinc-950/60 p-3 lg:p-5">
        <Suspense fallback={<div className="text-[13px] text-zinc-500 p-6">Loading clients…</div>}>
          <AdminClientManager />
        </Suspense>
      </div>
    </div>
  );
}
