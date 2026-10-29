/**
 * ProcurementSystem — the Wonderlands Procurement Exchange (/procurement).
 *
 * One home for the whole jobs marketplace, in the Wonderlands editorial
 * style: browse and bid (Marketplace), manage your postings and award bids
 * side by side (My Postings), track your proposals (My Bids), and talk to
 * the other side in private per-job threads (Messages).
 * Credits: Imagine Engine Studios Corp.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { PlusCircle, RefreshCw } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import EnhancedJobPostingForm from '@/components/procurement/EnhancedJobPostingForm';
import JobFeed from '@/components/procurement/JobFeed';
import JobDetailModal from '@/components/procurement/JobDetailModal';
import QuickProposalModal from '@/components/procurement/QuickProposalModal';
import UserProfileModal from '@/components/UserProfileModal';
import JobSearchEnhanced from '@/components/procurement/JobSearchEnhanced';
import { BidComparison } from '@/components/procurement/BidComparison';
import { ProcurementMessages } from '@/components/procurement/ProcurementMessages';
import { useProcurementData } from '@/hooks/useProcurementData';
import {
  fetchJobProposals,
  fetchMyJobs,
  fetchMyProposals,
  jobStatusLabel,
  proposalStatusLabel,
  setJobStatus,
  withdrawProposal,
  type ProcJob,
  type ProcProposal,
} from '@/lib/procurement/procurementService';

interface JobPosting {
  id: string;
  title: string;
  description: string;
  category: string;
  budget_min: number;
  budget_max: number;
  deadline: string;
  location: string;
  status: string;
  created_at: string;
  business_id: string;
  view_count?: number;
  proposal_count?: number;
  last_activity?: string;
  profiles: {
    first_name: string;
    last_name: string;
    company_name: string;
  };
}

type View = 'marketplace' | 'postings' | 'bids' | 'messages';

const money = (n?: number | null) => (n == null ? '—' : `$${Number(n).toLocaleString()}`);

const jobPill: Record<string, string> = {
  open: 'bg-emerald-50 text-emerald-800 ring-emerald-300',
  awarded: 'bg-amber-50 text-amber-800 ring-amber-300',
  closed: 'bg-neutral-100 text-neutral-500 ring-neutral-200',
  draft: 'bg-neutral-100 text-neutral-600 ring-neutral-200',
};
const propPill: Record<string, string> = {
  pending: 'bg-neutral-100 text-neutral-700 ring-neutral-200',
  shortlisted: 'bg-amber-50 text-amber-800 ring-amber-300',
  accepted: 'bg-emerald-50 text-emerald-800 ring-emerald-300',
  rejected: 'bg-red-50 text-red-700 ring-red-200',
  withdrawn: 'bg-neutral-100 text-neutral-400 ring-neutral-200',
};

const ProcurementSystem = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [view, setView] = useState<View>('marketplace');
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [showJobForm, setShowJobForm] = useState(false);
  const [showQuickProposal, setShowQuickProposal] = useState(false);
  const [quickProposalJob, setQuickProposalJob] = useState<JobPosting | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [searchFilters, setSearchFilters] = useState<any>({});

  const { jobs, loading, error, refetch, trackJobView } = useProcurementData(searchFilters);

  /* ------------------------------ my postings / my bids ------------------------------ */
  const [myJobs, setMyJobs] = useState<ProcJob[]>([]);
  const [myProps, setMyProps] = useState<Array<ProcProposal & { job: ProcJob | null }>>([]);
  const [mineLoading, setMineLoading] = useState(false);
  const [openJobId, setOpenJobId] = useState<string>('');
  const [openProposals, setOpenProposals] = useState<ProcProposal[]>([]);

  const loadMine = useCallback(async () => {
    if (!user) return;
    setMineLoading(true);
    try {
      const [j, p] = await Promise.all([fetchMyJobs(user.id), fetchMyProposals(user.id)]);
      setMyJobs(j);
      setMyProps(p);
    } catch {
      toast.error('Could not load your procurement activity.');
    } finally {
      setMineLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && (view === 'postings' || view === 'bids')) void loadMine();
  }, [user, view, loadMine]);

  const toggleJobProposals = async (job: ProcJob) => {
    if (openJobId === job.id) {
      setOpenJobId('');
      return;
    }
    setOpenJobId(job.id);
    setOpenProposals(await fetchJobProposals(job.id).catch(() => []));
  };

  const refreshOpenProposals = async (job: ProcJob) => {
    setOpenProposals(await fetchJobProposals(job.id).catch(() => []));
    void loadMine();
  };

  /* ------------------------------ marketplace filtering (unchanged behavior) ------------------------------ */
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = !searchFilters.searchTerm ||
      job.title.toLowerCase().includes(searchFilters.searchTerm.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchFilters.searchTerm.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchFilters.searchTerm.toLowerCase()) ||
      job.profiles?.company_name?.toLowerCase().includes(searchFilters.searchTerm.toLowerCase()) ||
      job.profiles?.first_name?.toLowerCase().includes(searchFilters.searchTerm.toLowerCase()) ||
      job.profiles?.last_name?.toLowerCase().includes(searchFilters.searchTerm.toLowerCase());
    const matchesCategory = !searchFilters.category ||
      searchFilters.category === 'all' ||
      job.category === searchFilters.category;
    const matchesLocation = !searchFilters.location ||
      job.location?.toLowerCase().includes(searchFilters.location.toLowerCase());
    const matchesBudget =
      (!searchFilters.budgetMin || job.budget_min >= searchFilters.budgetMin) &&
      (!searchFilters.budgetMax || job.budget_max <= searchFilters.budgetMax);
    const matchesDeadline = !searchFilters.deadline ||
      new Date(job.deadline) <= new Date(searchFilters.deadline);
    return matchesSearch && matchesCategory && matchesLocation && matchesBudget && matchesDeadline;
  }).sort((a, b) => {
    switch (searchFilters.sortBy) {
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'budget_high':
        return (b.budget_max || 0) - (a.budget_max || 0);
      case 'budget_low':
        return (a.budget_min || 0) - (b.budget_min || 0);
      case 'deadline':
        return new Date(a.deadline || '9999-12-31').getTime() -
          new Date(b.deadline || '9999-12-31').getTime();
      case 'most_proposals':
        return (b.proposal_count || 0) - (a.proposal_count || 0);
      case 'most_viewed':
        return (b.view_count || 0) - (a.view_count || 0);
      case 'newest':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  const requireAuth = (action: () => void, actionName: string) => {
    if (!user) {
      toast.error(`Please sign in to ${actionName}`);
      navigate('/auth');
      return;
    }
    action();
  };
  const handleJobCreated = () => {
    setShowJobForm(false);
    refetch();
    toast.success('Job posted successfully!');
  };
  const isCompanyProfileComplete = () => {
    if (!profile) return false;
    return profile.company_name && (profile.first_name || profile.last_name);
  };
  const handlePostJobClick = () => {
    requireAuth(() => {
      if (!isCompanyProfileComplete()) {
        toast.error('Please complete your company profile before posting jobs');
        return;
      }
      setShowJobForm(true);
    }, 'post jobs');
  };
  const handleQuickProposal = (jobId: string) => {
    requireAuth(() => {
      const job = filteredJobs.find(j => j.id === jobId);
      if (job) {
        setQuickProposalJob(job);
        setShowQuickProposal(true);
        trackJobView(jobId);
      }
    }, 'submit proposals');
  };
  const handleProfileClick = (userId: string) => {
    requireAuth(() => {
      setSelectedProfileId(userId);
      setShowProfile(true);
    }, 'view profiles');
  };

  const stats = [
    { label: 'Open opportunities', value: String(filteredJobs.length) },
    { label: 'Proposals on open jobs', value: String(filteredJobs.reduce((n, j) => n + (j.proposal_count || 0), 0)) },
    { label: 'Open budget (max)', value: `$${filteredJobs.reduce((n, j) => n + (j.budget_max || 0), 0).toLocaleString()}` },
    ...(user
      ? [
          { label: 'Your open postings', value: String(myJobs.filter(j => j.status === 'open').length) },
          { label: 'Your active bids', value: String(myProps.filter(p => ['pending', 'shortlisted'].includes(p.status)).length) },
          { label: 'Jobs you won', value: String(myProps.filter(p => p.status === 'accepted').length) },
        ]
      : []),
  ];

  const tabBtn = (v: View, label: string) => (
    <button
      key={v}
      onClick={() => setView(v)}
      className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${
        view === v ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-600 ring-1 ring-neutral-300 hover:text-neutral-900'
      }`}
    >
      {label}
    </button>
  );

  const signInPanel = (what: string) => (
    <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-10 text-center">
      <p className="font-serif text-2xl font-light">Sign in to see {what}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        Your postings, bids and messages live under your Wonderlands account.
      </p>
      <Button className="mt-5 bg-neutral-900 text-white hover:bg-neutral-800" onClick={() => navigate('/auth')}>
        Sign in
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-6 py-14 md:px-10 md:py-20">
        <p className="text-[10px] uppercase tracking-[0.42em] text-muted-foreground">
          Wonderlands — Procurement Exchange
        </p>
        <div className="mt-5 flex flex-wrap items-end justify-between gap-6">
          <h1 className="max-w-2xl font-serif text-4xl font-light leading-[1.05] tracking-tight text-foreground md:text-6xl">
            Every job, every bid, one table
          </h1>
          <div className="flex flex-wrap gap-3 pb-1">
            <Button onClick={handlePostJobClick} className="bg-neutral-900 text-white hover:bg-neutral-800">
              <PlusCircle className="mr-2 h-4 w-4" /> Post a requirement
            </Button>
            <Button variant="outline" onClick={() => refetch()} className="gap-2">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </Button>
          </div>
        </div>
        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
          Post what your project needs, receive proposals from approved contractors and
          suppliers, compare them side by side and award — with both sides notified at
          every step.
        </p>
        <div className="mt-8 h-px w-24 bg-foreground/30" />

        {/* Stats */}
        <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border lg:grid-cols-3 xl:grid-cols-6">
          {stats.map(s => (
            <div key={s.label} className="bg-card p-5">
              <div className="font-serif text-3xl font-light text-foreground">{s.value}</div>
              <div className="mt-1 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        {/* View tabs */}
        <div className="mt-10 flex flex-wrap gap-2">
          {tabBtn('marketplace', 'Marketplace')}
          {tabBtn('postings', 'My Postings')}
          {tabBtn('bids', 'My Bids')}
          {tabBtn('messages', 'Messages')}
        </div>

        <div className="mt-8">
          {view === 'marketplace' && (
            <>
              <div className="mb-8">
                <JobSearchEnhanced onFiltersChange={setSearchFilters} totalJobs={filteredJobs.length} />
              </div>
              {error ? (
                <p className="text-sm text-red-600">The marketplace could not load just now — try Refresh.</p>
              ) : (
                <JobFeed
                  jobs={filteredJobs}
                  loading={loading}
                  onJobClick={(job) => {
                    setSelectedJob(job);
                    trackJobView(job.id);
                  }}
                  onQuickProposal={handleQuickProposal}
                  onProfileClick={handleProfileClick}
                />
              )}
            </>
          )}

          {view === 'postings' && (!user ? signInPanel('your postings') : (
            <div className="space-y-4">
              {mineLoading && <p className="text-sm text-muted-foreground">Loading your postings…</p>}
              {!mineLoading && myJobs.length === 0 && (
                <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-10 text-center">
                  <p className="font-serif text-2xl font-light">No postings yet</p>
                  <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                    Post your first requirement and proposals from approved suppliers will land here.
                  </p>
                  <Button className="mt-5 bg-neutral-900 text-white hover:bg-neutral-800" onClick={handlePostJobClick}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Post a requirement
                  </Button>
                </div>
              )}
              {myJobs.map(job => (
                <div key={job.id} className="rounded-2xl border border-border bg-card p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="min-w-0 flex-1 truncate font-serif text-xl font-normal text-foreground">{job.title}</h3>
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ${jobPill[job.status] ?? jobPill.open}`}>
                      {jobStatusLabel[job.status] ?? job.status}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
                    <span>Budget {money(job.budget_min)} – {money(job.budget_max)}</span>
                    {job.location && <span>{job.location}</span>}
                    {job.deadline && <span>Deadline {new Date(job.deadline).toLocaleDateString()}</span>}
                    <span>{job.proposal_count ?? 0} proposals</span>
                    <span>{job.view_count ?? 0} views</span>
                  </div>
                  {job.description && <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-neutral-600">{job.description}</p>}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => void toggleJobProposals(job)}
                      className="rounded-full bg-neutral-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-neutral-700"
                    >
                      {openJobId === job.id ? 'Hide bids' : `Compare bids (${job.proposal_count ?? 0})`}
                    </button>
                    {job.status === 'open' && (
                      <button
                        onClick={() => void setJobStatus(job.id, 'closed').then(loadMine)}
                        className="rounded-full bg-white px-4 py-2 text-xs font-medium text-neutral-700 ring-1 ring-neutral-300 transition hover:bg-neutral-50"
                      >
                        Close job
                      </button>
                    )}
                    {job.status === 'closed' && (
                      <button
                        onClick={() => void setJobStatus(job.id, 'open').then(loadMine)}
                        className="rounded-full bg-white px-4 py-2 text-xs font-medium text-neutral-700 ring-1 ring-neutral-300 transition hover:bg-neutral-50"
                      >
                        Reopen job
                      </button>
                    )}
                  </div>
                  {openJobId === job.id && (
                    <div className="mt-4 border-t border-border pt-4">
                      <BidComparison job={job} proposals={openProposals} onChanged={() => void refreshOpenProposals(job)} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}

          {view === 'bids' && (!user ? signInPanel('your bids') : (
            <div className="space-y-4">
              {mineLoading && <p className="text-sm text-muted-foreground">Loading your bids…</p>}
              {!mineLoading && myProps.length === 0 && (
                <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-10 text-center">
                  <p className="font-serif text-2xl font-light">No bids yet</p>
                  <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                    Browse the marketplace and place your first proposal.
                  </p>
                  <Button className="mt-5 bg-neutral-900 text-white hover:bg-neutral-800" onClick={() => setView('marketplace')}>
                    Browse opportunities
                  </Button>
                </div>
              )}
              {myProps.map(p => (
                <div key={p.id} className="rounded-2xl border border-border bg-card p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="min-w-0 flex-1 truncate font-serif text-xl font-normal text-foreground">
                      {p.job?.title ?? 'Job'}
                    </h3>
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ${propPill[p.status] ?? propPill.pending}`}>
                      {proposalStatusLabel[p.status] ?? p.status}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
                    <span>Your bid <strong className="text-foreground">{money(p.proposed_price)}</strong></span>
                    {p.estimated_timeline && <span>Timeline {p.estimated_timeline}</span>}
                    {p.job?.location && <span>{p.job.location}</span>}
                    {p.job && <span>Job: {jobStatusLabel[p.job.status] ?? p.job.status}</span>}
                    <span>Sent {new Date(p.created_at).toLocaleDateString()}</span>
                  </div>
                  {p.proposal_text && <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-neutral-600">{p.proposal_text}</p>}
                  {['pending', 'shortlisted'].includes(p.status) && p.job?.status === 'open' && (
                    <button
                      onClick={() => void withdrawProposal(p, p.job).then(loadMine)}
                      className="mt-3 rounded-full bg-white px-4 py-2 text-xs font-medium text-red-700 ring-1 ring-red-200 transition hover:bg-red-50"
                    >
                      Withdraw bid
                    </button>
                  )}
                  {p.status === 'accepted' && (
                    <p className="mt-3 text-sm font-medium text-emerald-700">
                      You won this job — the buyer has your details and you've both been notified. Coordinate in Messages.
                    </p>
                  )}
                </div>
              ))}
            </div>
          ))}

          {view === 'messages' && (!user ? signInPanel('your messages') : <ProcurementMessages />)}
        </div>
      </main>
      <Footer />

      {/* Modals */}
      {user && isCompanyProfileComplete() && (
        <Dialog open={showJobForm} onOpenChange={setShowJobForm}>
          <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden">
            <EnhancedJobPostingForm onJobCreated={handleJobCreated} />
          </DialogContent>
        </Dialog>
      )}

      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          isOpen={!!selectedJob}
          onClose={() => setSelectedJob(null)}
          onProposalSubmitted={() => {
            setSelectedJob(null);
            refetch();
          }}
        />
      )}

      <QuickProposalModal
        job={quickProposalJob}
        isOpen={showQuickProposal}
        onClose={() => {
          setShowQuickProposal(false);
          setQuickProposalJob(null);
        }}
        onSubmit={() => {
          refetch();
        }}
      />

      <UserProfileModal
        isOpen={showProfile}
        onClose={() => {
          setShowProfile(false);
          setSelectedProfileId(null);
        }}
        userId={selectedProfileId || undefined}
        isOwnProfile={!selectedProfileId}
      />
    </div>
  );
};

export default ProcurementSystem;
