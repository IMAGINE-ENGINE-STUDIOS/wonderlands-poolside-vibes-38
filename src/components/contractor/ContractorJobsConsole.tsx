/**
 * ContractorJobsConsole — the contractor's own procurement console, inside
 * their dashboard's Procurement tab. Same engine as the main Wonderlands
 * board: post a project, receive bids, compare side by side, award, and
 * chat per project — scoped to the jobs THEY posted (business_id = user).
 * Bidding on Wonderlands' own projects happens on the main board and in the
 * opportunities list below this console.
 * Credits: Imagine Engine Studios Corp.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ChevronDown, ChevronUp, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import EnhancedJobPostingForm from '@/components/procurement/EnhancedJobPostingForm';
import { BidComparison } from '@/components/procurement/BidComparison';
import { ProcurementMessages } from '@/components/procurement/ProcurementMessages';
import {
  fetchJobProposals,
  fetchMyJobs,
  jobStatusLabel,
  setJobStatus,
  type ProcJob,
  type ProcProposal,
} from '@/lib/procurement/procurementService';

const money = (n?: number | null) => (n == null ? '—' : `$${Number(n).toLocaleString()}`);

export default function ContractorJobsConsole() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<ProcJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [proposals, setProposals] = useState<Record<string, ProcProposal[]>>({});

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      setJobs(await fetchMyJobs(user.id));
    } catch {
      toast.error('Your postings could not load just now.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { void load(); }, [load]);

  const toggle = async (job: ProcJob) => {
    if (expanded === job.id) { setExpanded(null); return; }
    setExpanded(job.id);
    if (!proposals[job.id]) {
      try {
        const fresh = await fetchJobProposals(job.id);
        setProposals(prev => ({ ...prev, [job.id]: fresh }));
      } catch {
        toast.error('Bids could not load just now.');
      }
    }
  };

  const refreshJob = async (job: ProcJob) => {
    await load();
    try {
      const fresh = await fetchJobProposals(job.id);
      setProposals(prev => ({ ...prev, [job.id]: fresh }));
    } catch { /* jobs list already refreshed */ }
  };

  const flipStatus = async (job: ProcJob) => {
    try {
      await setJobStatus(job.id, job.status === 'open' ? 'closed' : 'open');
      toast.success(job.status === 'open' ? 'Posting closed.' : 'Posting reopened.');
      await load();
    } catch {
      toast.error('That change failed — please try again.');
    }
  };

  if (!user) return null;

  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-neutral-900">Procure your own projects</h3>
          <p className="mt-0.5 text-sm text-neutral-500">
            Post a project, receive bids from contractors and suppliers, compare them side by side and award — the same tools as the main board, for your own work.
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-neutral-900 text-white hover:bg-neutral-800">
          <PlusCircle className="mr-2 h-4 w-4" /> Post a project
        </Button>
      </div>

      <div className="mt-5 space-y-3">
        {loading ? (
          <p className="text-sm text-neutral-500">Loading your postings…</p>
        ) : jobs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-300 p-6 text-center">
            <p className="text-sm font-medium text-neutral-800">No projects posted yet</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-neutral-500">Post your first project and bids from approved contractors and suppliers will land here.</p>
          </div>
        ) : jobs.map(job => (
          <div key={job.id} className="rounded-xl border border-neutral-200">
            <div className="flex flex-wrap items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-neutral-900">{job.title}</p>
                <p className="text-xs text-neutral-500">
                  {job.category} · {jobStatusLabel[job.status] ?? job.status} · Budget {money(job.budget_min)} – {money(job.budget_max)} · {job.proposal_count ?? 0} bids
                </p>
              </div>
              {(job.status === 'open' || job.status === 'closed') && (
                <Button variant="outline" size="sm" onClick={() => void flipStatus(job)}>
                  {job.status === 'open' ? 'Close' : 'Reopen'}
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => void toggle(job)}>
                {expanded === job.id ? <><ChevronUp className="mr-1 h-4 w-4" /> Hide bids</> : <><ChevronDown className="mr-1 h-4 w-4" /> Compare bids</>}
              </Button>
            </div>
            {expanded === job.id && (
              <div className="border-t border-neutral-100 p-4">
                {proposals[job.id] ? (
                  <BidComparison job={job} proposals={proposals[job.id]} onChanged={() => void refreshJob(job)} />
                ) : (
                  <p className="text-sm text-neutral-500">Loading bids…</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 border-t border-neutral-100 pt-5">
        <h4 className="text-sm font-semibold text-neutral-900">Project chat</h4>
        <p className="mb-3 mt-0.5 text-sm text-neutral-500">Private per-project threads with your bidders.</p>
        <ProcurementMessages />
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <EnhancedJobPostingForm onJobCreated={() => { setShowForm(false); void load(); }} />
        </DialogContent>
      </Dialog>
    </section>
  );
}
