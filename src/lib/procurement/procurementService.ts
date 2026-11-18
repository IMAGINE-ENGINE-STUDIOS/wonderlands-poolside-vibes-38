/**
 * Procurement service — the data layer for the ONE procurement system
 * (founder ruling 2026-11-18: one procurement page, one set of records).
 * Everything reads and writes construction_projects + procurement_listings
 * + procurement_proposals: posting a job creates one project with one
 * project-level listing (phase_item_id NULL), bids are procurement
 * proposals on that listing, and the public board reads the same records
 * through get_public_procurement_projects (see fetchPublicProjects below).
 * The legacy job_postings / job_proposals tables are no longer written or
 * read here. Per-thread messaging still uses job_messages (see the
 * messaging section below).
 * Credits: Imagine Engine Studios Corp.
 */
import { supabase } from "@/integrations/supabase/client";

/**
 * A "job" in the single system is a project-level procurement listing.
 * `id` is the listing id; `business_id` is the poster's auth user id
 * (construction_projects.created_by). Listing status 'assigned' (the
 * vocabulary the admin award flow uses) is presented as 'awarded'.
 * Listings carry no category, so `category` is null for these jobs.
 */
export interface ProcJob {
  id: string;
  project_id?: string;
  title: string;
  description: string | null;
  category: string | null;
  budget_min: number | null;
  budget_max: number | null;
  deadline: string | null;
  location: string | null;
  status: string; // open | closed | awarded
  created_at: string;
  business_id: string;
  view_count?: number | null;
  proposal_count?: number | null;
  last_activity?: string | null;
  profiles?: { first_name: string | null; last_name: string | null; company_name: string | null } | null;
}

export interface ProcProposal {
  id: string;
  job_id: string; // procurement_listings.id
  supplier_id: string; // bidder's auth user id when known (contractors.user_id), else the contractor row id
  contractor_id?: string; // procurement_proposals.contractor_id
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
/* Own postings = the project-level listings (phase_item_id NULL) of the   */
/* projects this user created. Area listings of a project belong to the    */
/* project/areas model and are managed from the project itself, not here.  */

type ListingRow = {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  location: string | null;
  budget_min: number | null;
  budget_max: number | null;
  deadline: string | null;
  status: string;
  created_at: string;
};

type ContractorLite = {
  id: string;
  company_name: string;
  contact_name: string;
  user_id: string | null;
};

const listingStatusToJob = (status: string): string =>
  status === "assigned" ? "awarded" : status;

function mapListing(l: ListingRow, businessId: string): ProcJob {
  return {
    id: l.id,
    project_id: l.project_id,
    title: l.title,
    description: l.description,
    category: null,
    budget_min: l.budget_min,
    budget_max: l.budget_max,
    deadline: l.deadline,
    location: l.location,
    status: listingStatusToJob(l.status),
    created_at: l.created_at,
    business_id: businessId,
    view_count: null,
    proposal_count: 0,
  };
}

function mapProposal(
  r: {
    id: string;
    listing_id: string;
    contractor_id: string;
    proposal_text: string | null;
    proposed_price: number | null;
    estimated_timeline: string | null;
    status: string;
    created_at: string;
  },
  contractor?: ContractorLite | null,
): ProcProposal {
  return {
    id: r.id,
    job_id: r.listing_id,
    supplier_id: contractor?.user_id ?? r.contractor_id,
    contractor_id: r.contractor_id,
    proposal_text: r.proposal_text,
    proposed_price: r.proposed_price,
    estimated_timeline: r.estimated_timeline,
    status: r.status,
    created_at: r.created_at,
    profiles: contractor
      ? { first_name: contractor.contact_name || null, last_name: null, company_name: contractor.company_name || null }
      : null,
  };
}

async function contractorsById(ids: string[]): Promise<Map<string, ContractorLite>> {
  const map = new Map<string, ContractorLite>();
  if (!ids.length) return map;
  const { data } = await supabase
    .from("contractors")
    .select("id, company_name, contact_name, user_id")
    .in("id", ids);
  for (const c of (data ?? []) as ContractorLite[]) map.set(c.id, c);
  return map;
}

export async function fetchMyJobs(userId: string): Promise<ProcJob[]> {
  const { data: projects, error } = await supabase
    .from("construction_projects")
    .select("id")
    .eq("created_by", userId);
  if (error) throw error;
  const projectIds = (projects ?? []).map((p) => p.id);
  if (!projectIds.length) return [];
  const { data: listings, error: listingError } = await supabase
    .from("procurement_listings")
    .select("*")
    .in("project_id", projectIds)
    .is("phase_item_id", null)
    .order("created_at", { ascending: false });
  if (listingError) throw listingError;
  const jobs = ((listings ?? []) as ListingRow[]).map((l) => mapListing(l, userId));
  if (jobs.length) {
    const { data: props } = await supabase
      .from("procurement_proposals")
      .select("listing_id")
      .in("listing_id", jobs.map((j) => j.id));
    const counts = new Map<string, number>();
    for (const p of (props ?? []) as Array<{ listing_id: string }>) {
      counts.set(p.listing_id, (counts.get(p.listing_id) ?? 0) + 1);
    }
    for (const j of jobs) j.proposal_count = counts.get(j.id) ?? 0;
  }
  return jobs;
}

export async function fetchJobProposals(jobId: string): Promise<ProcProposal[]> {
  const { data, error } = await supabase
    .from("procurement_proposals")
    .select("*")
    .eq("listing_id", jobId)
    .order("proposed_price", { ascending: true, nullsFirst: false });
  if (error) throw error;
  const rows = data ?? [];
  const byId = await contractorsById([...new Set(rows.map((r) => r.contractor_id))]);
  return rows.map((r) => mapProposal(r, byId.get(r.contractor_id)));
}

export async function setJobStatus(jobId: string, status: "open" | "closed"): Promise<void> {
  const { error } = await supabase.from("procurement_listings").update({ status }).eq("id", jobId);
  if (error) throw error;
}

async function setProposalStatus(proposal: ProcProposal, status: string): Promise<void> {
  const { error } = await supabase.from("procurement_proposals").update({ status }).eq("id", proposal.id);
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
 * → rejected, the listing → assigned to the winning contractor (the status
 * vocabulary the single system already uses), and both sides are notified.
 */
export async function awardProposal(job: ProcJob, winner: ProcProposal, all: ProcProposal[]): Promise<void> {
  const losers = all.filter(
    (p) => p.id !== winner.id && !["rejected", "withdrawn"].includes(p.status),
  );
  await setProposalStatus(winner, "accepted");
  for (const loser of losers) await setProposalStatus(loser, "rejected");
  const { error } = await supabase
    .from("procurement_listings")
    .update({
      status: "assigned",
      ...(winner.contractor_id ? { assigned_contractor_id: winner.contractor_id } : {}),
    })
    .eq("id", job.id);
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
  // Bids in the single system belong to the user's contractor record(s),
  // not to the auth user directly.
  const { data: mine, error: contractorError } = await supabase
    .from("contractors")
    .select("id, company_name, contact_name, user_id")
    .eq("user_id", userId);
  if (contractorError) throw contractorError;
  const myContractors = (mine ?? []) as ContractorLite[];
  if (!myContractors.length) return [];
  const byId = new Map(myContractors.map((c) => [c.id, c]));
  const { data, error } = await supabase
    .from("procurement_proposals")
    .select("*")
    .in("contractor_id", myContractors.map((c) => c.id))
    .order("created_at", { ascending: false });
  if (error) throw error;
  const rows = data ?? [];
  const listingIds = [...new Set(rows.map((r) => r.listing_id))];
  const jobsById = new Map<string, ProcJob>();
  if (listingIds.length) {
    const { data: listings } = await supabase
      .from("procurement_listings")
      .select("*")
      .in("id", listingIds);
    const listingRows = (listings ?? []) as ListingRow[];
    const projectIds = [...new Set(listingRows.map((l) => l.project_id))];
    const owners = new Map<string, string>();
    if (projectIds.length) {
      const { data: projects } = await supabase
        .from("construction_projects")
        .select("id, created_by")
        .in("id", projectIds);
      for (const p of (projects ?? []) as Array<{ id: string; created_by: string | null }>) {
        if (p.created_by) owners.set(p.id, p.created_by);
      }
    }
    for (const l of listingRows) {
      jobsById.set(l.id, mapListing(l, owners.get(l.project_id) ?? ""));
    }
  }
  return rows.map((r) => ({
    ...mapProposal(r, byId.get(r.contractor_id)),
    job: jobsById.get(r.listing_id) ?? null,
  }));
}

export async function withdrawProposal(proposal: ProcProposal, job: ProcJob | null): Promise<void> {
  // The single system's RLS lets a contractor delete their own proposal but
  // only ever keep its status at 'pending', so withdrawing removes the row.
  const { error } = await supabase.from("procurement_proposals").delete().eq("id", proposal.id);
  if (error) throw error;
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
/* Backed by the legacy job_messages table (migration 20261029120000),      */
/* keyed by job id — for single-system jobs that id is now the listing id,  */
/* so threads for new jobs simply start empty; legacy threads keep reading  */
/* the same table. Until that SQL is applied, reads return                  */
/* { ready: false } and the UI explains.                                    */

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

/* -------------------- public project exchange -------------------- */
/* Wonderlands projects live in construction_projects, procurement_listings
 * and procurement_documents. Those tables are not readable by signed out
 * visitors, so the public exchange reads them through the
 * get_public_procurement_projects lookup (migration 20261117220000), which
 * returns the public fields of every project with at least one open
 * listing. It is the same single source of truth the admin Projects
 * section, the client dashboard and the contractor procurement tab use. */

export interface PublicProjectListing {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  budget_min: number | null;
  budget_max: number | null;
  deadline: string | null;
  start_date: string | null;
  status: string;
  phase_item_id: string | null;
  item_order: number | null;
  created_at: string;
  /** Documents attached to the phase item behind this listing (item_documents). */
  documents: PublicProjectDocument[];
}

export interface PublicProjectDocument {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
}

export interface PublicProject {
  project_id: string;
  project_name: string;
  cover_image_url: string | null;
  project_status: string;
  listings: PublicProjectListing[];
  documents: PublicProjectDocument[];
}

export const projectListingOf = (p: PublicProject): PublicProjectListing | null =>
  p.listings.find((l) => !l.phase_item_id) ?? null;

export const areaListingsOf = (p: PublicProject): PublicProjectListing[] =>
  p.listings.filter((l) => l.phase_item_id);

// The lookup is created by migration 20261117220000, so it is not in the
// generated Supabase types yet — use an untyped handle, like job_messages.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const publicProjectsRpc = () => (supabase as any).rpc("get_public_procurement_projects");

export async function fetchPublicProjects(): Promise<PublicProject[]> {
  const { data, error } = await publicProjectsRpc();
  if (error) throw error;
  return (data ?? []) as PublicProject[];
}
