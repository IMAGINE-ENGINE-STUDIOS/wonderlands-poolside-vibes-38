import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  CheckCircle, XCircle, Eye, Building2, User, Mail, Phone,
  DollarSign, Clock, Calendar, FileText, ExternalLink, ChevronDown, ChevronRight,
  Loader2, Search,
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
    } | null;
  } | null;
}

const AdminApplicationsPanel: React.FC = () => {
  const { toast } = useToast();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
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
      .select('*, contractors(id, company_name, contact_name, email, phone, years_experience, address_city, address_state), procurement_listings(id, title, phase_item_id, project_id, construction_projects(project_name))')
      .order('created_at', { ascending: false }) as any;

    if (!error) setProposals(data || []);
    setLoading(false);
  };

  const createNotification = async (
    recipientType: string,
    recipientId: string,
    title: string,
    message: string,
    type: string,
    relatedType?: string,
    relatedId?: string
  ) => {
    await supabase.from('notifications').insert({
      recipient_type: recipientType,
      recipient_id: recipientId,
      title,
      message,
      type,
      related_entity_type: relatedType,
      related_entity_id: relatedId,
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
      // Update proposal status
      await supabase.from('procurement_proposals').update({ status: 'accepted' } as any).eq('id', proposal.id);
      
      // Reject other pending proposals for same listing
      await supabase.from('procurement_proposals')
        .update({ status: 'rejected' } as any)
        .eq('listing_id', proposal.listing_id)
        .neq('id', proposal.id)
        .eq('status', 'pending');

      // Update listing
      await supabase.from('procurement_listings').update({
        status: 'assigned',
        assigned_contractor_id: proposal.contractor_id,
        start_date: listingDates.start,
        deadline: listingDates.due,
      } as any).eq('id', proposal.listing_id);

      // Create contractor project task
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

      // Send acceptance email
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

      // Create notification for contractor
      await createNotification(
        'contractor',
        proposal.contractor_id,
        'Application Accepted! 🎉',
        `Your application for "${proposal.procurement_listings?.title}" on project "${proposal.procurement_listings?.construction_projects?.project_name}" has been approved.`,
        'success',
        'proposal',
        proposal.id
      );

      // Notify other rejected contractors
      const otherProposals = proposals.filter(
        p => p.listing_id === proposal.listing_id && p.id !== proposal.id && p.status === 'pending'
      );
      for (const op of otherProposals) {
        await createNotification(
          'contractor',
          op.contractor_id,
          'Application Update',
          `Your application for "${proposal.procurement_listings?.title}" was not selected this time.`,
          'info',
          'proposal',
          op.id
        );
        // Send rejection email for auto-rejected proposals
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

      // Admin notification
      await createNotification(
        'admin',
        'system',
        'Contractor Assigned',
        `${proposal.contractors?.company_name} assigned to "${proposal.procurement_listings?.title}".`,
        'success',
        'proposal',
        proposal.id
      );

      toast({ title: 'Application Accepted', description: 'Contractor assigned and notifications sent.' });
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
        'contractor',
        proposal.contractor_id,
        'Application Update',
        `Your application for "${proposal.procurement_listings?.title}" on project "${proposal.procurement_listings?.construction_projects?.project_name}" was not selected.`,
        'warning',
        'proposal',
        proposal.id
      );

      toast({ title: 'Proposal rejected' });
      fetchProposals();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setRejecting(null);
    }
  };

  const filtered = proposals.filter(p => {
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
  });

  const pendingCount = proposals.filter(p => p.status === 'pending').length;
  const acceptedCount = proposals.filter(p => p.status === 'accepted').length;
  const rejectedCount = proposals.filter(p => p.status === 'rejected').length;

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
            <FileText className="h-5 w-5 text-cyan-400" />
            Contractor Applications
          </CardTitle>
          <CardDescription className="text-cyan-400/60 font-mono">
            Review and manage all contractor proposals and applications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-3">
            <div className="holographic-panel rounded-lg border border-cyan-500/20 p-3 text-center cursor-pointer hover:bg-cyan-500/5"
              onClick={() => setFilter('all')}>
              <div className="text-lg font-bold text-cyan-300 font-mono">{proposals.length}</div>
              <div className="text-[10px] text-cyan-400/60 font-mono uppercase">Total</div>
            </div>
            <div className="holographic-panel rounded-lg border border-yellow-500/20 p-3 text-center cursor-pointer hover:bg-yellow-500/5"
              onClick={() => setFilter('pending')}>
              <div className="text-lg font-bold text-yellow-400 font-mono">{pendingCount}</div>
              <div className="text-[10px] text-yellow-400/60 font-mono uppercase">Pending</div>
            </div>
            <div className="holographic-panel rounded-lg border border-green-500/20 p-3 text-center cursor-pointer hover:bg-green-500/5"
              onClick={() => setFilter('accepted')}>
              <div className="text-lg font-bold text-green-400 font-mono">{acceptedCount}</div>
              <div className="text-[10px] text-green-400/60 font-mono uppercase">Accepted</div>
            </div>
            <div className="holographic-panel rounded-lg border border-red-500/20 p-3 text-center cursor-pointer hover:bg-red-500/5"
              onClick={() => setFilter('rejected')}>
              <div className="text-lg font-bold text-red-400 font-mono">{rejectedCount}</div>
              <div className="text-[10px] text-red-400/60 font-mono uppercase">Rejected</div>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-400/40" />
            <Input
              placeholder="Search by contractor, project, or task..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-9 text-xs bg-cyan-500/5 border-cyan-500/20 text-cyan-300 placeholder:text-cyan-500/30 font-mono"
            />
          </div>

          {/* Filter badges */}
          <div className="flex items-center gap-2">
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

          {/* Applications list */}
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-cyan-400 mx-auto" />
              <p className="text-[10px] text-cyan-400/40 font-mono mt-2">Loading applications...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-10 w-10 text-cyan-400/20 mx-auto mb-2" />
              <p className="text-xs text-cyan-400/40 font-mono">No applications found.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((p) => {
                const isExpanded = expandedId === p.id;
                return (
                  <div
                    key={p.id}
                    className="holographic-panel rounded-lg border border-cyan-500/15 overflow-hidden"
                  >
                    {/* Row header */}
                    <div
                      className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-cyan-500/5 transition-colors"
                      onClick={() => setExpandedId(isExpanded ? null : p.id)}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-3 w-3 text-cyan-400 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="h-3 w-3 text-cyan-400 flex-shrink-0" />
                      )}
                      <Building2 className="h-4 w-4 text-cyan-400/60 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-cyan-300 font-mono truncate">
                            {p.contractors?.company_name || 'Unknown'}
                          </span>
                          <span className="text-[10px] text-cyan-400/40 font-mono">
                            — {p.contractors?.contact_name}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-cyan-400/50 font-mono mt-0.5">
                          <span>Project: {p.procurement_listings?.construction_projects?.project_name || '—'}</span>
                          <span>Task: {p.procurement_listings?.title || '—'}</span>
                          <span>{new Date(p.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {p.proposed_price && (
                          <span className="text-xs text-cyan-300 font-mono font-semibold">
                            ${p.proposed_price.toLocaleString()}
                          </span>
                        )}
                        {getStatusBadge(p.status)}
                      </div>
                    </div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-cyan-500/10 pt-3 space-y-3">
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

                        {/* Actions for pending */}
                        {p.status === 'pending' && (
                          <div className="space-y-3">
                            {/* Date inputs */}
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label className="text-[10px] font-mono text-cyan-400/40 flex items-center gap-1">
                                  <Calendar className="h-3 w-3" /> Start Date
                                </Label>
                                <Input
                                  type="date"
                                  value={dates[p.listing_id]?.start || ''}
                                  onChange={(e) =>
                                    setDates((prev) => ({
                                      ...prev,
                                      [p.listing_id]: {
                                        ...prev[p.listing_id],
                                        start: e.target.value,
                                        due: prev[p.listing_id]?.due || '',
                                      },
                                    }))
                                  }
                                  className="h-7 text-[10px] bg-cyan-500/5 border-cyan-500/20 text-cyan-300 font-mono"
                                />
                              </div>
                              <div>
                                <Label className="text-[10px] font-mono text-cyan-400/40 flex items-center gap-1">
                                  <Calendar className="h-3 w-3" /> Due Date
                                </Label>
                                <Input
                                  type="date"
                                  value={dates[p.listing_id]?.due || ''}
                                  onChange={(e) =>
                                    setDates((prev) => ({
                                      ...prev,
                                      [p.listing_id]: {
                                        start: prev[p.listing_id]?.start || '',
                                        due: e.target.value,
                                      },
                                    }))
                                  }
                                  className="h-7 text-[10px] bg-cyan-500/5 border-cyan-500/20 text-cyan-300 font-mono"
                                />
                              </div>
                            </div>

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
                          </div>
                        )}
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

export default AdminApplicationsPanel;
