/**
 * Procurement service — the jobs marketplace data layer (job_postings /
 * job_proposals), completing the loop the UI always promised:
 * post → bid → shortlist → award → notify, plus per-thread messaging
 * (job_messages, see the 20261029120000_job_messages migration).
 * Credits: Imagine Engine Studios Corp.
 */
import { supabase } from "@/integrations/supabase/client";

export interface ProcJob {
  id: string;
  title: string;
  description: string | null;
  category: string;
  budget_min: number | null;
  budget_max: number | null;
  deadline: string | null;
  location: string | null;
  status: string;
  created_at: string;
  business_id: string;
  view_count?: number | null;
  proposal_count?: number | null;
  last_activity?: string | null;
  profiles?: { first_name: string | null; last_name: string | null; company_name: string | null } | null;
}

export interface ProcProposal {
  id: string;
  job_id: string;
  supplier_id: string;
  proposal_text: string | null;
  proposed_price: number | null;
  estimated_timeline: string | null;
  status: string; // pending | shortlisted | accepted | rejected | withdrawn
  created_at: string;
  profiles?: { first_name: string | null; last_name: string | null; company_name: string | null } | null;
}

export const proposalStatusLabel: Record<string, string> = {
  pending: "Pending review",
  shortlisted: "Shortlisted",
  accepted: "Awarded",
  rejected: "Not selected",
  withdrawn: "Withdrawn",
};

export const jobStatusLabel: Record<string, string> = {
  open: "Open for bids",
  awarded: "Awarded",
  closed: "Closed",
  draft: "Draft",
};

/* ------------------------------ notifications ------------------------------ */

/** Notify a marketplace user (and mirror into their contractor inbox when they have one). */
export async function notifyUser(
  userId: string,
  title: string,
  message: string,
  type: "success" | "warning" | "info" = "info",
  entityId?: string,
): Promise<void> {
  try {
    await supabase.from("notifications").insert({
      recipient_type: "user",
      recipient_id: userId,
      title,
      message,
      type,
      related_entity_type: "job_proposal",
      related_entity_id: entityId ?? null,
    } as never);
    const { data: contractor } = await supabase
      .from("contractors")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();
    if (contractor?.id) {
      await supabase.from("notifications").insert({
        recipient_type: "contractor",
        recipient_id: contractor.id,
        title,
        message,
        type,
        related_entity_type: "job_proposal",
        related_entity_id: entityId ?? null,
      } as never);
    }
  } catch {
    /* notifications are best-effort; statuses are the source of truth */
  }
}

/* ------------------------------ buyer side ------------------------------ */

export async function fetchMyJobs(userId: string): Promise<ProcJob[]> {
  const { data, error } = await supabase
    .from("job_postings")
    .select("*")
    .eq("business_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  const jobs = (data ?? []) as ProcJob[];
  if (jobs.length) {
    const { data: props } = await supabase
      .from("job_proposals")
      .select("job_id")
      .in("job_id", jobs.map((j) => j.id));
    const counts = new Map<string, number>();
    for (const p of (props ?? []) as Array<{ job_id: string }>) {
      counts.set(p.job_id, (counts.get(p.job_id) ?? 0) + 1);
    }
    for (const j of jobs) j.proposal_count = counts.get(j.id) ?? 0;
  }
  return jobs;
}

export async function fetchJobProposals(jobId: string): Promise<ProcProposal[]> {
  const { data, error } = await supabase
    .from("job_proposals")
    .select(`
      *,
      profiles!job_proposals_supplier_id_fkey ( first_name, last_name, company_name )
    `)
    .eq("job_id", jobId)
    .order("proposed_price", { ascending: true, nullsFirst: false });
  if (error) throw error;
  return (data ?? []) as unknown as ProcProposal[];
}

export async function setJobStatus(jobId: string, status: "open" | "closed"): Promise<void> {
  const { error } = await supabase.from("job_postings").update({ status }).eq("id", jobId);
  if (error) throw error;
}

async function setProposalStatus(proposal: ProcProposal, status: string): Promise<void> {
  const { error } = await supabase.from("job_proposals").update({ status }).eq("id", proposal.id);
  if (error) throw error;
}

export async function shortlistProposal(proposal: ProcProposal, job: ProcJob): Promise<void> {
  const next = proposal.status === "shortlisted" ? "pending" : "shortlisted";
  await setProposalStatus(proposal, next);
  if (next === "shortlisted") {
    await notifyUser(
      proposal.supplier_id,
      "Your bid was shortlisted",
      `Your proposal for "${job.title}" made the shortlist. The buyer is making a final decision.`,
      "info",
      proposal.id,
    );
  }
}

export async function rejectProposal(proposal: ProcProposal, job: ProcJob): Promise<void> {
  await setProposalStatus(proposal, "rejected");
  await notifyUser(
    proposal.supplier_id,
    "Bid update",
    `Your proposal for "${job.title}" was not selected this time.`,
    "warning",
    proposal.id,
  );
}

/**
 * Award a job to one proposal: winner → accepted, every other live proposal
 * → rejected, job → awarded, and both sides are notified.
 */
export async function awardProposal(job: ProcJob, winner: ProcProposal, all: ProcProposal[]): Promise<void> {
  const losers = all.filter(
    (p) => p.id !== winner.id && !["rejected", "withdrawn"].includes(p.status),
  );
  await setProposalStatus(winner, "accepted");
  for (const loser of losers) await setProposalStatus(loser, "rejected");
  const { error } = await supabase.from("job_postings").update({ status: "awarded" }).eq("id", job.id);
  if (error) throw error;
  await notifyUser(
    winner.supplier_id,
    "You won the job 🎉",
    `Your proposal for "${job.title}" was accepted${winner.proposed_price ? ` at $${Number(winner.proposed_price).toLocaleString()}` : ""}. Open Procurement → My Bids to coordinate next steps.`,
    "success",
    winner.id,
  );
  for (const loser of losers) {
    await notifyUser(
      loser.supplier_id,
      "Bid update",
      `The job "${job.title}" was awarded to another supplier. Thank you for bidding.`,
      "warning",
      loser.id,
    );
  }
  await notifyUser(
    job.business_id,
    "Job awarded",
    `"${job.title}" is awarded. The winning supplier has been notified.`,
    "success",
    winner.id,
  );
}

/* ------------------------------ bidder side ------------------------------ */

export async function fetchMyProposals(userId: string): Promise<Array<ProcProposal & { job: ProcJob | null }>> {
  const { data, error } = await supabase
    .from("job_proposals")
    .select("*")
    .eq("supplier_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  const proposals = (data ?? []) as unknown as ProcProposal[];
  const jobIds = [...new Set(proposals.map((p) => p.job_id))];
  const jobsById = new Map<string, ProcJob>();
  if (jobIds.length) {
    const { data: jobs } = await supabase.from("job_postings").select("*").in("id", jobIds);
    for (const j of (jobs ?? []) as ProcJob[]) jobsById.set(j.id, j);
  }
  return proposals.map((p) => ({ ...p, job: jobsById.get(p.job_id) ?? null }));
}

export async function withdrawProposal(proposal: ProcProposal, job: ProcJob | null): Promise<void> {
  await setProposalStatus(proposal, "withdrawn");
  if (job) {
    await notifyUser(
      job.business_id,
      "A bid was withdrawn",
      `A supplier withdrew their proposal for "${job.title}".`,
      "info",
      proposal.id,
    );
  }
}

/* ------------------------------ messaging ------------------------------ */
/* Threads are per (job, supplier): the buyer and one bidder talk privately. */
/* Backed by the job_messages table (migration 20261029120000). Until that   */
/* SQL is applied, reads return { ready: false } and the UI explains.        */

export interface JobMessage {
  id: string;
  job_id: string;
  supplier_id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

// job_messages is created by migration 20261029120000, so it is not in the
// generated Supabase types yet — use an untyped handle for this table only.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const jobMessages = () => (supabase as any).from("job_messages");

export async function fetchThread(jobId: string, supplierId: string): Promise<{ ready: boolean; messages: JobMessage[] }> {
  const { data, error } = await jobMessages()
    .select("*")
    .eq("job_id", jobId)
    .eq("supplier_id", supplierId)
    .order("created_at", { ascending: true })
    .limit(300);
  if (error) return { ready: false, messages: [] };
  return { ready: true, messages: (data ?? []) as JobMessage[] };
}

export async function sendThreadMessage(
  jobId: string,
  supplierId: string,
  senderId: string,
  body: string,
): Promise<boolean> {
  const { error } = await jobMessages()
    .insert({ job_id: jobId, supplier_id: supplierId, sender_id: senderId, body });
  return !error;
}
