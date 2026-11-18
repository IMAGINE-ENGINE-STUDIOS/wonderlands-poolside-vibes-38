/**
 * ProcurementSystem — the Wonderlands Procurement Exchange (/procurement).
 *
 * THE one procurement page (founder ruling 2026-11-18): every job anyone
 * publishes — from the contractor dashboard console, from this page, from
 * the admin side — is one project + listings in the single system
 * (construction_projects / procurement_listings / procurement_proposals),
 * and this page reads only that system through
 * get_public_procurement_projects. There is no second feed and no copy.
 * Browse and bid (Marketplace), manage your postings and award bids side
 * by side (My Postings), track your proposals (My Bids), and talk to the
 * other side in private per-job threads (Messages).
 * Credits: Imagine Engine Studios Corp.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { PlusCircle, RefreshCw } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import EnhancedJobPostingForm from '@/components/procurement/EnhancedJobPostingForm';
import ProjectDetailModal, { formatDateColumn } from '@/components/procurement/ProjectDetailModal';
import ProcurementProposalForm from '@/components/contractor/ProcurementProposalForm';
import JobSearchEnhanced from '@/components/procurement/JobSearchEnhanced';
import { BidComparison } from '@/components/procurement/BidComparison';
import { ProcurementMessages } from '@/components/procurement/ProcurementMessages';
import {
  areaListingsOf,
  fetchJobProposals,
  fetchMyJobs,
  fetchMyProposals,
  fetchPublicProjects,
  jobStatusLabel,
  projectListingOf,
  projectProposalTotal,
  proposalCountLabel,
  proposalStatusLabel,
  setJobStatus,
  withdrawProposal,
  type ProcJob,
  type ProcProposal,
  type PublicProject,
  type PublicProjectListing,
} from '@/lib/procurement/procurementService';

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
  const [showJobForm, setShowJobForm] = useState(false);
  const [searchFilters, setSearchFilters] = useState<any>({});

  /* ------------------------------ my postings / my bids ------------------------------ */
  const [myJobs, setMyJobs] = useState<ProcJob[]>([]);
  const [myProps, setMyProps] = useState<Array<ProcProposal & { job: ProcJob | null }>>([]);
  const [mineLoading, setMineLoading] = useState(false);
  const [openJobId, setOpenJobId] = useState<string>('');
  const [openProposals, setOpenProposals] = useState<ProcProposal[]>([]);

  /* ------------------------------ bidder view ------------------------------ */
  // The main board is Wonderlands' procurement: Wonderlands (and businesses)
  // post, contractors bid. A signed-in contractor gets the bidder view —
  // project slides, bid features and chat, no posting tools and no sales
  // figures. Their own procurement lives in their dashboard's Procurement tab.
  const isMainAdmin = profile?.role === 'main_admin';
  const [contractorAccount, setContractorAccount] = useState(false);
  const [contractorRecord, setContractorRecord] = useState<{ id: string; status: string } | null>(null);
  // True once we know whether this account is a contractor — the publish
  // intent below must wait for it, so a bidder never gets the posting form.
  const [contractorChecked, setContractorChecked] = useState(false);
  useEffect(() => {
    if (!user) { setContractorAccount(false); setContractorRecord(null); setContractorChecked(true); return; }
    if (isMainAdmin) { setContractorChecked(true); return; }
    setContractorChecked(false);
    let on = true;
    (async () => {
      const byId = await supabase.from('contractors').select('id, status').eq('user_id', user.id).maybeSingle();
      let record = (byId.data as { id: string; status: string } | null) ?? null;
      if (!record && user.email) {
        const byEmail = await supabase.from('contractors').select('id, status').eq('email', user.email).maybeSingle();
        record = (byEmail.data as { id: string; status: string } | null) ?? null;
      }
      if (on) {
        setContractorAccount(!!record);
        setContractorRecord(record);
        setContractorChecked(true);
      }
    })();
    return () => { on = false; };
  }, [user, isMainAdmin]);
  const bidderView = !!user && !isMainAdmin && contractorAccount;
  const effectiveView: View = bidderView && view === 'postings' ? 'marketplace' : view;

  /* ------------- publish intent: /procurement?post=1 (carried through /auth) ------------- */
  // The homeowner campaign link and the page's own "Publish your project"
  // entry both land here with ?post=1 after signup/login. A signed-in
  // non-bidder gets the posting form open in front of them; the intent is
  // then stripped from the URL so a refresh does not reopen it. Contractors
  // in bidder view never get the form — their intent is stripped silently.
  const [searchParams, setSearchParams] = useSearchParams();
  const postIntentHandled = useRef(false);
  useEffect(() => {
    if (postIntentHandled.current) return;
    if (searchParams.get('post') !== '1') return;
    if (!user || !contractorChecked) return;
    postIntentHandled.current = true;
    if (!bidderView) setShowJobForm(true);
    const rest = new URLSearchParams(searchParams);
    rest.delete('post');
    setSearchParams(rest, { replace: true });
  }, [searchParams, user, contractorChecked, bidderView, setSearchParams]);

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
    if (user && (bidderView || view === 'postings' || view === 'bids')) void loadMine();
  }, [user, view, loadMine, bidderView]);

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

  /* ------------------------------ the board: projects of the single system ------------------------------ */
  // Every project with at least one open listing, from the
  // get_public_procurement_projects lookup — the same records the admin
  // Projects section, the client dashboard and the contractor procurement
  // tab read. This is the only feed on the page.
  const [publicProjects, setPublicProjects] = useState<PublicProject[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState(false);
  const [selectedProject, setSelectedProject] = useState<PublicProject | null>(null);
  const [bidListing, setBidListing] = useState<PublicProjectListing | null>(null);

  const loadProjects = useCallback(async () => {
    setProjectsLoading(true);
    try {
      setPublicProjects(await fetchPublicProjects());
      setProjectsError(false);
    } catch {
      setPublicProjects([]);
      setProjectsError(true);
    } finally {
      setProjectsLoading(false);
    }
  }, []);

  useEffect(() => { void loadProjects(); }, [loadProjects]);

  // Filters run against the projects and their listings. Projects carry no
  // category of their own, so choosing a category filters the board out;
  // search, location, budget and deadline all match on listing fields.
  const visibleProjects = publicProjects.filter((p) => {
    if (searchFilters.category && searchFilters.category !== 'all') return false;
    const listing = projectListingOf(p);
    const term = (searchFilters.searchTerm || '').toLowerCase();
    const matchesSearch = !term ||
      (listing?.title || '').toLowerCase().includes(term) ||
      p.project_name.toLowerCase().includes(term) ||
      (listing?.description || '').toLowerCase().includes(term) ||
      (listing?.location || '').toLowerCase().includes(term) ||
      areaListingsOf(p).some((a) => a.title.toLowerCase().includes(term));
    const matchesLocation = !searchFilters.location ||
      p.listings.some((l) => (l.location || '').toLowerCase().includes(searchFilters.location.toLowerCase()));
    const budgetMin = searchFilters.budgetMin ?? 0;
    const budgetMax = searchFilters.budgetMax;
    const matchesBudget =
      (!budgetMin || p.listings.some((l) => (l.budget_max ?? 0) >= budgetMin)) &&
      (!budgetMax || budgetMax >= 100000 || p.listings.some((l) => (l.budget_min ?? 0) <= budgetMax));
    const matchesDeadline = !searchFilters.deadline ||
      p.listings.some((l) => l.deadline && new Date(l.deadline) <= new Date(searchFilters.deadline));
    return matchesSearch && matchesLocation && matchesBudget && matchesDeadline;
  }).sort((a, b) => {
    const maxBudget = (p: PublicProject) => Math.max(0, ...p.listings.map((l) => l.budget_max ?? 0));
    const minBudget = (p: PublicProject) => Math.min(...p.listings.map((l) => l.budget_min ?? 0), 0);
    const earliestDeadline = (p: PublicProject) =>
      Math.min(...p.listings.map((l) => (l.deadline ? new Date(l.deadline).getTime() : Infinity)), Infinity);
    const latestListing = (p: PublicProject) =>
      Math.max(0, ...p.listings.map((l) => new Date(l.created_at).getTime()));
    switch (searchFilters.sortBy) {
      case 'oldest':
        return latestListing(a) - latestListing(b);
      case 'budget_high':
        return maxBudget(b) - maxBudget(a);
      case 'budget_low':
        return minBudget(a) - minBudget(b);
      case 'deadline':
        return earliestDeadline(a) - earliestDeadline(b);
      case 'newest':
      default:
        return latestListing(b) - latestListing(a);
    }
  });

  const handleProjectBid = (listing: PublicProjectListing) => {
    if (!user) {
      requireAuth(() => undefined, 'place bids');
      return;
    }
    if (contractorRecord) {
      setBidListing(listing);
      return;
    }
    toast.info('Bids on project areas are placed from an approved contractor account. Your contractor dashboard shows the same projects with the bid form on each area.');
  };

  const requireAuth = (action: () => void, actionName: string, returnTo = '/procurement') => {
    if (!user) {
      toast.error(`Please sign in to ${actionName}`);
      // Carry the destination through /auth (?next=) so signup/login lands
      // the visitor right back here — with the publish intent when posting.
      navigate(`/auth?next=${encodeURIComponent(returnTo)}`);
      return;
    }
    action();
  };
  const handleJobCreated = () => {
    setShowJobForm(false);
    void loadProjects();
    void loadMine();
    toast.success('Job posted successfully!');
  };
  const handlePostJobClick = () => {
    requireAuth(() => {
      setShowJobForm(true);
    }, 'post jobs', '/procurement?post=1');
  };
  const handleRefresh = () => {
    void loadProjects();
    if (user) void loadMine();
  };


  const openListingCount = visibleProjects.reduce((n, p) => n + p.listings.length, 0);
  const stats = [
    { label: 'Open projects', value: String(visibleProjects.length) },
    { label: 'Open opportunities', value: String(openListingCount) },
    ...(!bidderView
      ? [{ label: 'Open budget (max)', value: `$${visibleProjects.reduce((n, p) => n + p.listings.reduce((m, l) => m + (l.budget_max || 0), 0), 0).toLocaleString()}` }]
      : []),
    ...(user && !bidderView
      ? [{ label: 'Your open postings', value: String(myJobs.filter(j => j.status === 'open').length) }]
      : []),
    ...(user
      ? [
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
      <Button className="mt-5 bg-neutral-900 text-white hover:bg-neutral-800" onClick={() => navigate(`/auth?next=${encodeURIComponent('/procurement')}`)}>
        Sign in
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:px-10 md:py-20">
        <p className="text-[10px] uppercase tracking-[0.42em] text-muted-foreground">
          Wonderlands — Procurement Exchange
        </p>
        <div className="mt-5 flex flex-wrap items-end justify-between gap-6">
          <h1 className="max-w-2xl font-serif text-4xl font-light leading-[1.05] tracking-tight text-foreground md:text-6xl">
            Every job, every bid, one table
          </h1>
          <div className="flex flex-wrap gap-3 pb-1">
            {!bidderView && (
              <Button onClick={handlePostJobClick} className="bg-neutral-900 text-white hover:bg-neutral-800">
                <PlusCircle className="mr-2 h-4 w-4" /> Publish your project — free
              </Button>
            )}
            <Button variant="outline" onClick={handleRefresh} className="gap-2">
              <RefreshCw className={`h-4 w-4 ${projectsLoading ? 'animate-spin' : ''}`} /> Refresh
            </Button>
          </div>
        </div>
        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
          {bidderView
            ? 'Wonderlands posts its projects here. Open a project to see its slides, scope and requirements, place your bid, and coordinate with the team in chat.'
            : 'Post what your project needs, receive proposals from approved contractors and suppliers, compare them side by side and award — with both sides notified at every step.'}
        </p>
        {!user && (
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-foreground">
            Are you a homeowner?{' '}
            <button onClick={handlePostJobClick} className="font-semibold underline underline-offset-4 hover:text-neutral-600">
              Publish your project for free
            </button>{' '}
            — create a free account and approved contractors will bid on your project.
          </p>
        )}
        <div className="mt-8 h-px w-24 bg-foreground/30" />

        {/* Stats */}
        <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border lg:grid-cols-3 xl:grid-cols-6">
          {stats.map(s => (
            <div key={s.label} className="bg-card p-4 sm:p-5">
              <div className="break-words font-serif text-2xl font-light text-foreground min-[420px]:text-3xl">{s.value}</div>
              <div className="mt-1 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        {/* View tabs */}
        <div className="mt-10 flex flex-wrap gap-2">
          {tabBtn('marketplace', 'Marketplace')}
          {!bidderView && tabBtn('postings', 'My Postings')}
          {tabBtn('bids', 'My Bids')}
          {tabBtn('messages', 'Messages')}
        </div>

        <div className="mt-8">
          {effectiveView === 'marketplace' && (
            <>
              <div className="mb-8">
                <JobSearchEnhanced onFiltersChange={setSearchFilters} totalJobs={visibleProjects.length} />
              </div>
              {projectsError ? (
                <p className="text-sm text-red-600">The marketplace could not load just now — try Refresh.</p>
              ) : projectsLoading ? (
                <p className="text-sm text-muted-foreground">Loading projects…</p>
              ) : visibleProjects.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-10 text-center">
                  <p className="font-serif text-2xl font-light">No open projects right now</p>
                  <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                    When a project is published — by Wonderlands or by any business on the platform — it appears here, divided into areas that each take their own bids.
                  </p>
                </div>
              ) : (
                <div className="mb-10">
                  <h2 className="font-serif text-2xl font-light text-foreground">Projects open for bids</h2>
                  <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                    Wonderlands posts its own projects here. Every project is divided into areas and each area takes its own bids. Open a project to see its plans, renders and documents, then bid on the area that matches your trade.
                  </p>
                  <div className="mt-5 space-y-6">
                    {visibleProjects.map((p) => {
                      const listing = projectListingOf(p);
                      const areas = areaListingsOf(p);
                      const start = formatDateColumn(listing?.start_date || areas[0]?.start_date);
                      return (
                        <div key={p.project_id} className="overflow-hidden rounded-2xl border border-border bg-card">
                          {p.cover_image_url && (
                            <button onClick={() => setSelectedProject(p)} className="block w-full" aria-label={listing?.title || p.project_name}>
                              <img src={p.cover_image_url} alt={listing?.title || p.project_name} className="h-52 w-full object-cover" loading="lazy" />
                            </button>
                          )}
                          <div className="p-5">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="min-w-0 flex-1 break-words font-serif text-2xl font-normal text-foreground">
                                {listing?.title || p.project_name}
                              </h3>
                              <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ${jobPill.open}`}>
                                Open for bids
                              </span>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
                              {listing?.location && <span>{listing.location}</span>}
                              {start && <span>Work starts {start}</span>}
                              <span>{areas.length} areas open for bids</span>
                              <span>{p.documents.length} documents</span>
                              <span>{proposalCountLabel(projectProposalTotal(p))}</span>
                            </div>
                            {listing?.description && (
                              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-neutral-600">{listing.description}</p>
                            )}
                            <div className="mt-4">
                              <button
                                onClick={() => setSelectedProject(p)}
                                className="rounded-full bg-neutral-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-neutral-700"
                              >
                                View project and bid
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {effectiveView === 'postings' && (!user ? signInPanel('your postings') : (
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
                  </div>
                  {job.status === 'awarded' && job.management_fee_amount != null && (
                    <p className="mt-2 text-sm text-neutral-600">
                      Management fee ({job.management_fee_percent ?? 10}%):{' '}
                      <strong className="text-neutral-900">{money(job.management_fee_amount)}</strong> — due with first payment
                    </p>
                  )}
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

          {effectiveView === 'bids' && (!user ? signInPanel('your bids') : (
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
                  {p.status === 'accepted' && p.contractor_fee_amount != null && (
                    <p className="mt-1 text-sm text-neutral-600">
                      A platform fee of {p.contractor_fee_percent}% ({money(p.contractor_fee_amount)}) applies to this contract, payable to Wonderlands.
                    </p>
                  )}
                </div>
              ))}
            </div>
          ))}

          {effectiveView === 'messages' && (!user ? signInPanel('your messages') : <ProcurementMessages />)}
        </div>
      </main>
      <Footer />

      {/* Modals */}
      {user && (
        <Dialog open={showJobForm} onOpenChange={setShowJobForm}>
          <DialogContent className="w-[calc(100vw-2rem)] max-w-7xl max-h-[95vh] overflow-hidden p-4 sm:p-6 [&>*]:min-w-0">
            <EnhancedJobPostingForm onJobCreated={handleJobCreated} />
          </DialogContent>
        </Dialog>
      )}

      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          isOpen={!!selectedProject}
          onClose={() => setSelectedProject(null)}
          onBid={handleProjectBid}
        />
      )}

      {bidListing && contractorRecord && (
        <ProcurementProposalForm
          open={!!bidListing}
          onOpenChange={(open) => { if (!open) setBidListing(null); }}
          listing={bidListing}
          contractorId={contractorRecord.id}
          onSubmitted={() => setBidListing(null)}
        />
      )}

    </div>
  );
};

export default ProcurementSystem;
