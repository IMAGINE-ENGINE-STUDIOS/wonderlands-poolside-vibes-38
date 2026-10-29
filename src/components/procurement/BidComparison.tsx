/**
 * BidComparison — the buyer's bid table for one job: every proposal side by
 * side with best-price highlighting, shortlist / reject / award actions and
 * a two-step award confirmation. Used by My Postings and the job detail.
 * Credits: Imagine Engine Studios Corp.
 */
import * as React from "react";
import { Award, Check, Star, X } from "lucide-react";
import { toast } from "sonner";
import {
  awardProposal,
  proposalStatusLabel,
  rejectProposal,
  shortlistProposal,
  type ProcJob,
  type ProcProposal,
} from "@/lib/procurement/procurementService";

const money = (n?: number | null) => (n == null ? "—" : `$${Number(n).toLocaleString()}`);
const supplierName = (p: ProcProposal) =>
  p.profiles?.company_name ||
  [p.profiles?.first_name, p.profiles?.last_name].filter(Boolean).join(" ") ||
  "Supplier";

const statusPill: Record<string, string> = {
  pending: "bg-neutral-100 text-neutral-700 ring-neutral-200",
  shortlisted: "bg-amber-50 text-amber-800 ring-amber-300",
  accepted: "bg-emerald-50 text-emerald-800 ring-emerald-300",
  rejected: "bg-red-50 text-red-700 ring-red-200",
  withdrawn: "bg-neutral-100 text-neutral-400 ring-neutral-200",
};

export function BidComparison({
  job,
  proposals,
  onChanged,
}: {
  job: ProcJob;
  proposals: ProcProposal[];
  onChanged: () => void;
}) {
  const [busy, setBusy] = React.useState<string>("");
  const [confirmAward, setConfirmAward] = React.useState<string>("");
  const [expanded, setExpanded] = React.useState<string>("");

  const live = proposals.filter((p) => !["withdrawn"].includes(p.status));
  const bestPrice = live
    .filter((p) => p.proposed_price != null && p.status !== "rejected")
    .reduce<number | null>((min, p) => (min == null || (p.proposed_price ?? Infinity) < min ? p.proposed_price : min), null);
  const winner = proposals.find((p) => p.status === "accepted");

  const run = async (id: string, fn: () => Promise<void>, ok: string) => {
    setBusy(id);
    try {
      await fn();
      toast.success(ok);
      onChanged();
    } catch {
      toast.error("That action failed — please try again.");
    } finally {
      setBusy("");
      setConfirmAward("");
    }
  };

  if (!proposals.length) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-6 text-center text-sm text-neutral-500">
        No proposals yet. When suppliers bid, they appear here side by side — you can shortlist,
        message and award without leaving this page.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {winner && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          <Award className="h-4 w-4 shrink-0" />
          Awarded to <strong>{supplierName(winner)}</strong>
          {winner.proposed_price != null ? <> at <strong>{money(winner.proposed_price)}</strong></> : null}.
          Both sides have been notified.
        </div>
      )}
      {proposals.map((p) => {
        const isBest = bestPrice != null && p.proposed_price === bestPrice && p.status !== "rejected";
        const actionable = job.status === "open" && !["accepted", "withdrawn"].includes(p.status);
        return (
          <div key={p.id} className="rounded-xl border border-neutral-200 bg-white p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-neutral-900">{supplierName(p)}</span>
              {isBest && (
                <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[11px] font-semibold text-neutral-900">
                  Best price
                </span>
              )}
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${statusPill[p.status] ?? statusPill.pending}`}>
                {proposalStatusLabel[p.status] ?? p.status}
              </span>
              <span className="ml-auto text-xs text-neutral-400">
                {new Date(p.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm">
              <span>
                <span className="text-neutral-400">Bid </span>
                <span className="font-semibold text-neutral-900">{money(p.proposed_price)}</span>
              </span>
              <span>
                <span className="text-neutral-400">Timeline </span>
                <span className="text-neutral-800">{p.estimated_timeline || "—"}</span>
              </span>
            </div>
            {p.proposal_text && (
              <p className={`mt-2 text-sm leading-relaxed text-neutral-600 ${expanded === p.id ? "" : "line-clamp-2"}`}>
                {p.proposal_text}
              </p>
            )}
            {p.proposal_text && p.proposal_text.length > 160 && (
              <button onClick={() => setExpanded(expanded === p.id ? "" : p.id)} className="mt-1 text-xs font-medium text-amber-700 underline">
                {expanded === p.id ? "Show less" : "Read full proposal"}
              </button>
            )}
            {actionable && (
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  disabled={busy === p.id}
                  onClick={() => void run(p.id, () => shortlistProposal(p, job), p.status === "shortlisted" ? "Removed from the shortlist" : "Shortlisted")}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-neutral-800 ring-1 ring-neutral-300 transition hover:bg-neutral-50 disabled:opacity-50"
                >
                  <Star className="h-3.5 w-3.5" /> {p.status === "shortlisted" ? "Unshortlist" : "Shortlist"}
                </button>
                <button
                  disabled={busy === p.id}
                  onClick={() => void run(p.id, () => rejectProposal(p, job), "Proposal declined — the supplier has been notified")}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-red-700 ring-1 ring-red-200 transition hover:bg-red-50 disabled:opacity-50"
                >
                  <X className="h-3.5 w-3.5" /> Decline
                </button>
                {confirmAward === p.id ? (
                  <button
                    disabled={busy === p.id}
                    onClick={() => void run(p.id, () => awardProposal(job, p, proposals), "Job awarded — both sides notified")}
                    className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
                  >
                    <Check className="h-3.5 w-3.5" /> Confirm award at {money(p.proposed_price)}?
                  </button>
                ) : (
                  <button
                    disabled={busy === p.id}
                    onClick={() => setConfirmAward(p.id)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-neutral-700 disabled:opacity-50"
                  >
                    <Award className="h-3.5 w-3.5" /> Award job
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
