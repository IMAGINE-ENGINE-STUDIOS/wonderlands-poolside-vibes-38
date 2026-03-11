import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  CheckCircle, XCircle, Building2, User, Mail, Phone,
  DollarSign, Clock, Calendar, FileText, ExternalLink, ChevronDown, ChevronRight,
  Loader2, Search, HardHat, Briefcase, ClipboardList,
} from 'lucide-react';

interface Proposal {
  id: string;
  proposal_type: string;
  proposed_price: number | null;
  proposal_text: string | null;
  estimated_timeline: string | null;
  quotation_url: string | null;
  quotation_file_name: string | null;
  status: string;
  created_at: string;
  listing_id: string;
  contractor_id: string;
  contractors: {
    id: string;
    company_name: string;
    contact_name: string;
    email: string;
    phone: string | null;
    years_experience: number | null;
    address_city: string | null;
    address_state: string | null;
  } | null;
  procurement_listings: {
    id: string;
    title: string;
    phase_item_id: string | null;
    project_id: string;
    construction_projects: {
      project_name: string;
      status: string;
    } | null;
  } | null;
}

interface ProjectGroup {
  projectId: string;
  projectName: string;
  projectStatus: string;
  listings: Record<string, {
    listingId: string;
    title: string;
    isTask: boolean;
    proposals: Proposal[];
  }>;
  totalProposals: number;
  pendingCount: number;
  acceptedCount: number;
}

const AdminApplicationsPanel: React.FC = () => {
  const { toast } = useToast();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [expandedListings, setExpandedListings] = useState<Set<string>>(new Set());
  const [expandedProposals, setExpandedProposals] = useState<Set<string>>(new Set());
  const [dates, setDates] = useState<Record<string, { start: string; due: string }>>({});
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('procurement_proposals')
      .select('*, contractors(id, company_name, contact_name, email, phone, years_experience, address_city, address_state), procurement_listings(id, title, phase_item_id, project_id, construction_projects(project_name, status))')
      .order('created_at', { ascending: false }) as any;

    if (!error) setProposals(data || []);
    setLoading(false);
  };

  const createNotification = async (
    recipientType: string, recipientId: string, title: string,
    message: string, type: string, relatedType?: string, relatedId?: string
  ) => {
    await supabase.from('notifications').insert({
      recipient_type: recipientType, recipient_id: recipientId,
      title, message, type,
      related_entity_type: relatedType, related_entity_id: relatedId,
    } as any);
  };

  const handleAccept = async (proposal: Proposal) => {
    const listingDates = dates[proposal.listing_id];
    if (!listingDates?.start || !listingDates?.due) {
      toast({ title: 'Dates required', description: 'Set start and due dates before accepting.', variant: 'destructive' });
      return;
    }

    setAccepting(proposal.id);
    try {
      // 1. Accept this proposal
      await supabase.from('procurement_proposals').update({ status: 'accepted' } as any).eq('id', proposal.id);

      // 2. Auto-reject other pending proposals for same listing
      const otherPending = proposals.filter(
        p => p.listing_id === proposal.listing_id && p.id !== proposal.id && p.status === 'pending'
      );
      if (otherPending.length > 0) {
        await supabase.from('procurement_proposals')
          .update({ status: 'rejected' } as any)
          .eq('listing_id', proposal.listing_id)
          .neq('id', proposal.id)
          .eq('status', 'pending');
      }

      // 3. Update listing status
      await supabase.from('procurement_listings').update({
        status: 'assigned',
        assigned_contractor_id: proposal.contractor_id,
        start_date: listingDates.start,
        deadline: listingDates.due,
      } as any).eq('id', proposal.listing_id);

      // 4. Create contractor project task (syncs to contractor dashboard)
      await supabase.from('contractor_project_tasks').insert({
        listing_id: proposal.listing_id,
        proposal_id: proposal.id,
        contractor_id: proposal.contractor_id,
        project_id: proposal.procurement_listings?.project_id,
        task_name: proposal.procurement_listings?.title || 'Project Task',
        start_date: listingDates.start,
        due_date: listingDates.due,
        proposed_price: proposal.proposed_price,
        status: 'assigned',
      } as any);

      // 5. Send acceptance email
      try {
        await supabase.functions.invoke('procurement-acceptance-email', {
          body: {
            contractorEmail: proposal.contractors?.email,
            contractorName: proposal.contractors?.contact_name || proposal.contractors?.company_name,
            taskName: proposal.procurement_listings?.title || 'Project',
            startDate: listingDates.start,
            dueDate: listingDates.due,
            proposedPrice: proposal.proposed_price,
            location: proposal.procurement_listings?.construction_projects?.project_name,
          },
        });
      } catch (e) { console.error('Acceptance email failed:', e); }

      // 6. Notify accepted contractor
      await createNotification(
        'contractor', proposal.contractor_id,
        'Application Accepted! 🎉',
        `Your application for "${proposal.procurement_listings?.title}" on project "${proposal.procurement_listings?.construction_projects?.project_name}" has been approved. Check your Current Projects.`,
        'success', 'proposal', proposal.id
      );

      // 7. Notify & email rejected contractors
      for (const op of otherPending) {
        await createNotification(
          'contractor', op.contractor_id,
          'Application Update',
          `Your application for "${proposal.procurement_listings?.title}" was not selected.`,
          'info', 'proposal', op.id
        );
        try {
          await supabase.functions.invoke('procurement-rejection-email', {
            body: {
              contractorEmail: op.contractors?.email,
              contractorName: op.contractors?.contact_name || op.contractors?.company_name,
              projectName: proposal.procurement_listings?.construction_projects?.project_name || 'Project',
              taskName: proposal.procurement_listings?.title || 'Task',
            },
          });
        } catch (e) { console.error('Rejection email failed:', e); }
      }

      // 8. Admin system notification
      await createNotification(
        'admin', 'system',
        'Contractor Assigned',
        `${proposal.contractors?.company_name} assigned to "${proposal.procurement_listings?.title}" on project "${proposal.procurement_listings?.construction_projects?.project_name}".`,
        'success', 'proposal', proposal.id
      );

      toast({ title: 'Application Accepted', description: 'Contractor assigned, task created, and notifications sent across all dashboards.' });
      fetchProposals();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setAccepting(null);
    }
  };

  const handleReject = async (proposal: Proposal) => {
    setRejecting(proposal.id);
    try {
      await supabase.from('procurement_proposals').update({ status: 'rejected' } as any).eq('id', proposal.id);

      // Send rejection email
      try {
        await supabase.functions.invoke('procurement-rejection-email', {
          body: {
            contractorEmail: proposal.contractors?.email,
            contractorName: proposal.contractors?.contact_name || proposal.contractors?.company_name,
            projectName: proposal.procurement_listings?.construction_projects?.project_name || 'Project',
            taskName: proposal.procurement_listings?.title || 'Task',
          },
        });
      } catch (e) { console.error('Rejection email failed:', e); }

      // Notification
      await createNotification(
        'contractor', proposal.contractor_id,
        'Application Update',
        `Your application for "${proposal.procurement_listings?.title}" on project "${proposal.procurement_listings?.construction_projects?.project_name}" was not selected.`,
        'warning', 'proposal', proposal.id
      );

      toast({ title: 'Application Rejected', description: 'Contractor notified via email and dashboard.' });
      fetchProposals();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setRejecting(null);
    }
  };

  // Filter proposals
  const filtered = useMemo(() => proposals.filter(p => {
    if (filter !== 'all' && p.status !== filter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        p.contractors?.company_name?.toLowerCase().includes(term) ||
        p.contractors?.contact_name?.toLowerCase().includes(term) ||
        p.procurement_listings?.title?.toLowerCase().includes(term) ||
        p.procurement_listings?.construction_projects?.project_name?.toLowerCase().includes(term)
      );
    }
    return true;
  }), [proposals, filter, searchTerm]);

  // Group by project → listing → proposals
  const projectGroups = useMemo(() => {
    const groups: Record<string, ProjectGroup> = {};
    for (const p of filtered) {
      const pid = p.procurement_listings?.project_id || 'unknown';
      const pName = p.procurement_listings?.construction_projects?.project_name || 'Unknown Project';
      const pStatus = (p.procurement_listings?.construction_projects as any)?.status || 'active';

      if (!groups[pid]) {
        groups[pid] = {
          projectId: pid, projectName: pName, projectStatus: pStatus,
          listings: {}, totalProposals: 0, pendingCount: 0, acceptedCount: 0,
        };
      }

      const lid = p.listing_id;
      if (!groups[pid].listings[lid]) {
        groups[pid].listings[lid] = {
          listingId: lid,
          title: p.procurement_listings?.title || 'Unknown',
          isTask: !!p.procurement_listings?.phase_item_id,
          proposals: [],
        };
      }
      groups[pid].listings[lid].proposals.push(p);
      groups[pid].totalProposals++;
      if (p.status === 'pending') groups[pid].pendingCount++;
      if (p.status === 'accepted') groups[pid].acceptedCount++;
    }
    return Object.values(groups);
  }, [filtered]);

  const totalCount = proposals.length;
  const pendingCount = proposals.filter(p => p.status === 'pending').length;
  const acceptedCount = proposals.filter(p => p.status === 'accepted').length;
  const rejectedCount = proposals.filter(p => p.status === 'rejected').length;

  const toggleProject = (id: string) => {
    setExpandedProjects(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleListing = (id: string) => {
    setExpandedListings(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleProposal = (id: string) => {
    setExpandedProposals(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-[10px] font-mono">Pending</Badge>;
      case 'accepted':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-[10px] font-mono">Accepted</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-[10px] font-mono">Rejected</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px] font-mono">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in bg-[#0a0a0f] -m-6 p-6 min-h-screen">
      <Card className="holographic-panel border-cyan-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cyan-300 font-mono">
            <ClipboardList className="h-5 w-5 text-cyan-400" />
            Application Management Center
          </CardTitle>
          <CardDescription className="text-cyan-400/60 font-mono">
            Review, accept, and reject contractor applications — organized by project
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Total', count: totalCount, color: 'cyan', f: 'all' as const },
              { label: 'Pending', count: pendingCount, color: 'yellow', f: 'pending' as const },
              { label: 'Accepted', count: acceptedCount, color: 'green', f: 'accepted' as const },
              { label: 'Rejected', count: rejectedCount, color: 'red', f: 'rejected' as const },
            ].map(s => (
              <div
                key={s.f}
                className={`holographic-panel rounded-lg border border-${s.color}-500/20 p-3 text-center cursor-pointer hover:bg-${s.color}-500/5 transition-colors ${filter === s.f ? `bg-${s.color}-500/10` : ''}`}
                onClick={() => setFilter(s.f)}
              >
                <div className={`text-lg font-bold text-${s.color}-${s.color === 'cyan' ? '300' : '400'} font-mono`}>{s.count}</div>
                <div className={`text-[10px] text-${s.color}-400/60 font-mono uppercase`}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Search & Filter */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-400/40" />
              <Input
                placeholder="Search by contractor, project, or task..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-9 text-xs bg-cyan-500/5 border-cyan-500/20 text-cyan-300 placeholder:text-cyan-500/30 font-mono"
              />
            </div>
            <div className="flex items-center gap-1">
              {(['all', 'pending', 'accepted', 'rejected'] as const).map((f) => (
                <Badge
                  key={f}
                  variant={filter === f ? 'default' : 'outline'}
                  className={`cursor-pointer text-[10px] font-mono ${
                    filter === f
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                      : 'border-cyan-500/15 text-cyan-400/50 hover:text-cyan-300'
                  }`}
                  onClick={() => setFilter(f)}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </Badge>
              ))}
            </div>
          </div>

          {/* Project-grouped applications */}
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-cyan-400 mx-auto" />
              <p className="text-[10px] text-cyan-400/40 font-mono mt-2">Loading applications...</p>
            </div>
          ) : projectGroups.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-10 w-10 text-cyan-400/20 mx-auto mb-2" />
              <p className="text-xs text-cyan-400/40 font-mono">No applications found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {projectGroups.map(group => {
                const isProjectExpanded = expandedProjects.has(group.projectId);
                return (
                  <div key={group.projectId} className="holographic-panel rounded-lg border border-cyan-500/20 overflow-hidden">
                    {/* Project Header */}
                    <div
                      className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-cyan-500/5 transition-colors"
                      onClick={() => toggleProject(group.projectId)}
                    >
                      {isProjectExpanded
                        ? <ChevronDown className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                        : <ChevronRight className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                      }
                      <HardHat className="h-4 w-4 text-cyan-400/70 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-semibold text-cyan-300 font-mono">
                          {group.projectName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge className="bg-cyan-500/15 text-cyan-400/70 border-cyan-500/20 text-[10px] font-mono">
                          {group.totalProposals} application{group.totalProposals !== 1 ? 's' : ''}
                        </Badge>
                        {group.pendingCount > 0 && (
                          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-[10px] font-mono animate-pulse">
                            {group.pendingCount} pending
                          </Badge>
                        )}
                        {group.acceptedCount > 0 && (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-[10px] font-mono">
                            {group.acceptedCount} assigned
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Listings under this project */}
                    {isProjectExpanded && (
                      <div className="px-4 pb-4 space-y-2 border-t border-cyan-500/10 pt-3">
                        {Object.values(group.listings).map(listing => {
                          const isListingExpanded = expandedListings.has(listing.listingId);
                          const listingPending = listing.proposals.filter(p => p.status === 'pending').length;
                          return (
                            <div key={listing.listingId} className="rounded-lg border border-cyan-500/15 overflow-hidden">
                              {/* Listing Header */}
                              <div
                                className="flex items-center gap-2 px-3 py-2 bg-cyan-500/5 cursor-pointer hover:bg-cyan-500/10 transition-colors"
                                onClick={() => toggleListing(listing.listingId)}
                              >
                                {isListingExpanded
                                  ? <ChevronDown className="h-3 w-3 text-cyan-400" />
                                  : <ChevronRight className="h-3 w-3 text-cyan-400" />
                                }
                                <Briefcase className="h-3 w-3 text-cyan-400/60" />
                                <span className="text-xs font-mono text-cyan-300 flex-1">{listing.title}</span>
                                <Badge variant="outline" className="text-[10px] font-mono border-cyan-500/20 text-cyan-400/60">
                                  {listing.isTask ? 'Task' : 'Full Project'}
                                </Badge>
                                <span className="text-[10px] font-mono text-cyan-400/50">
                                  {listing.proposals.length} bid{listing.proposals.length !== 1 ? 's' : ''}
                                </span>
                                {listingPending > 0 && (
                                  <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                                )}
                              </div>

                              {/* Proposals under this listing */}
                              {isListingExpanded && (
                                <div className="p-3 space-y-3">
                                  {/* Date assignment for this listing */}
                                  {listing.proposals.some(p => p.status === 'pending') && (
                                    <div className="grid grid-cols-2 gap-2 p-2 rounded border border-cyan-500/10 bg-cyan-500/5">
                                      <div>
                                        <Label className="text-[10px] font-mono text-cyan-400/40 flex items-center gap-1">
                                          <Calendar className="h-3 w-3" /> Start Date
                                        </Label>
                                        <Input
                                          type="date"
                                          value={dates[listing.listingId]?.start || ''}
                                          onChange={e => setDates(prev => ({
                                            ...prev,
                                            [listing.listingId]: { ...prev[listing.listingId], start: e.target.value, due: prev[listing.listingId]?.due || '' },
                                          }))}
                                          className="h-7 text-[10px] bg-cyan-500/5 border-cyan-500/20 text-cyan-300 font-mono"
                                        />
                                      </div>
                                      <div>
                                        <Label className="text-[10px] font-mono text-cyan-400/40 flex items-center gap-1">
                                          <Calendar className="h-3 w-3" /> Due Date
                                        </Label>
                                        <Input
                                          type="date"
                                          value={dates[listing.listingId]?.due || ''}
                                          onChange={e => setDates(prev => ({
                                            ...prev,
                                            [listing.listingId]: { start: prev[listing.listingId]?.start || '', due: e.target.value },
                                          }))}
                                          className="h-7 text-[10px] bg-cyan-500/5 border-cyan-500/20 text-cyan-300 font-mono"
                                        />
                                      </div>
                                    </div>
                                  )}

                                  {/* Individual proposals */}
                                  {listing.proposals.map(p => {
                                    const isProposalExpanded = expandedProposals.has(p.id);
                                    return (
                                      <div key={p.id} className="rounded-lg border border-cyan-500/15 overflow-hidden">
                                        {/* Proposal summary row */}
                                        <div
                                          className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-cyan-500/5 transition-colors"
                                          onClick={() => toggleProposal(p.id)}
                                        >
                                          {isProposalExpanded
                                            ? <ChevronDown className="h-3 w-3 text-cyan-400" />
                                            : <ChevronRight className="h-3 w-3 text-cyan-400" />
                                          }
                                          <Building2 className="h-3.5 w-3.5 text-cyan-400/60" />
                                          <div className="flex-1 min-w-0">
                                            <span className="text-xs font-mono font-semibold text-cyan-300">
                                              {p.contractors?.company_name || 'Unknown'}
                                            </span>
                                            <span className="text-[10px] text-cyan-400/40 font-mono ml-2">
                                              {p.contractors?.contact_name}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-2 flex-shrink-0">
                                            {p.proposed_price && (
                                              <span className="text-xs text-cyan-300 font-mono font-semibold">
                                                ${p.proposed_price.toLocaleString()}
                                              </span>
                                            )}
                                            <span className="text-[10px] text-cyan-400/40 font-mono">
                                              {new Date(p.created_at).toLocaleDateString()}
                                            </span>
                                            {getStatusBadge(p.status)}
                                          </div>
                                        </div>

                                        {/* Expanded proposal details */}
                                        {isProposalExpanded && (
                                          <div className="px-3 pb-3 border-t border-cyan-500/10 pt-3 space-y-3">
                                            {/* Contractor profile */}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                              <div>
                                                <Label className="text-[10px] text-cyan-400/40 font-mono">Contact</Label>
                                                <p className="text-xs text-cyan-300 font-mono flex items-center gap-1">
                                                  <User className="h-3 w-3" /> {p.contractors?.contact_name}
                                                </p>
                                              </div>
                                              <div>
                                                <Label className="text-[10px] text-cyan-400/40 font-mono">Email</Label>
                                                <p className="text-xs text-cyan-300 font-mono flex items-center gap-1">
                                                  <Mail className="h-3 w-3" /> {p.contractors?.email}
                                                </p>
                                              </div>
                                              {p.contractors?.phone && (
                                                <div>
                                                  <Label className="text-[10px] text-cyan-400/40 font-mono">Phone</Label>
                                                  <p className="text-xs text-cyan-300 font-mono flex items-center gap-1">
                                                    <Phone className="h-3 w-3" /> {p.contractors.phone}
                                                  </p>
                                                </div>
                                              )}
                                              {p.contractors?.years_experience && (
                                                <div>
                                                  <Label className="text-[10px] text-cyan-400/40 font-mono">Experience</Label>
                                                  <p className="text-xs text-cyan-300 font-mono">
                                                    {p.contractors.years_experience} years
                                                  </p>
                                                </div>
                                              )}
                                              {p.contractors?.address_city && (
                                                <div>
                                                  <Label className="text-[10px] text-cyan-400/40 font-mono">Location</Label>
                                                  <p className="text-xs text-cyan-300 font-mono">
                                                    {p.contractors.address_city}, {p.contractors.address_state}
                                                  </p>
                                                </div>
                                              )}
                                            </div>

                                            {/* Proposal details */}
                                            <div className="holographic-panel rounded p-3 border border-cyan-500/10 space-y-2">
                                              <div className="flex items-center gap-4 text-[10px] font-mono text-cyan-400/60">
                                                {p.proposed_price && (
                                                  <span className="flex items-center gap-1 text-cyan-300">
                                                    <DollarSign className="h-3 w-3" />${p.proposed_price.toLocaleString()}
                                                  </span>
                                                )}
                                                {p.estimated_timeline && (
                                                  <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />{p.estimated_timeline}
                                                  </span>
                                                )}
                                                <span className="capitalize">{p.proposal_type.replace('_', ' ')}</span>
                                              </div>
                                              {p.proposal_text && (
                                                <p className="text-[11px] font-mono text-cyan-400/50 bg-cyan-500/5 rounded p-2">
                                                  {p.proposal_text}
                                                </p>
                                              )}
                                              {p.quotation_url && (
                                                <a
                                                  href={p.quotation_url}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="flex items-center gap-1 text-[10px] font-mono text-cyan-400 hover:text-cyan-300"
                                                >
                                                  <FileText className="h-3 w-3" />
                                                  {p.quotation_file_name || 'View Quotation'}
                                                  <ExternalLink className="h-2.5 w-2.5" />
                                                </a>
                                              )}
                                            </div>

                                            {/* Actions */}
                                            {p.status === 'pending' && (
                                              <div className="flex gap-2">
                                                <Button
                                                  size="sm"
                                                  onClick={() => handleAccept(p)}
                                                  disabled={accepting === p.id}
                                                  className="bg-green-600 hover:bg-green-500 text-[10px] font-mono h-7"
                                                >
                                                  {accepting === p.id ? (
                                                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                                  ) : (
                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                  )}
                                                  {accepting === p.id ? 'Accepting...' : 'Accept & Assign'}
                                                </Button>
                                                <Button
                                                  size="sm"
                                                  variant="ghost"
                                                  onClick={() => handleReject(p)}
                                                  disabled={rejecting === p.id}
                                                  className="text-red-400 hover:text-red-300 text-[10px] font-mono h-7"
                                                >
                                                  {rejecting === p.id ? (
                                                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                                  ) : (
                                                    <XCircle className="h-3 w-3 mr-1" />
                                                  )}
                                                  Reject
                                                </Button>
                                              </div>
                                            )}

                                            {/* Status sync info */}
                                            {p.status === 'accepted' && (
                                              <div className="text-[10px] font-mono text-green-400/60 bg-green-500/5 rounded p-2 border border-green-500/10">
                                                ✓ Contractor assigned · Task created in Current Projects · Email sent · Dashboards synced
                                              </div>
                                            )}
                                            {p.status === 'rejected' && (
                                              <div className="text-[10px] font-mono text-red-400/60 bg-red-500/5 rounded p-2 border border-red-500/10">
                                                ✗ Rejected · Contractor notified via email & dashboard
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Need to import this for the header icon
import { ClipboardList } from 'lucide-react';

export default AdminApplicationsPanel;
