import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  DollarSign, Clock, CheckCircle, XCircle, User, Calendar,
  FileText, ExternalLink, ChevronDown, ChevronRight, Building2,
  Mail, Phone,
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
  } | null;
}

interface ProjectQuotationsPanelProps {
  projectId: string;
  projectName: string;
  onListingUpdated?: () => void;
}

const ProjectQuotationsPanel: React.FC<ProjectQuotationsPanelProps> = ({
  projectId, projectName, onListingUpdated
}) => {
  const { toast } = useToast();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(true);
  const [expandedListings, setExpandedListings] = useState<Set<string>>(new Set());
  const [accepting, setAccepting] = useState<string | null>(null);
  const [dates, setDates] = useState<Record<string, { start: string; due: string }>>({});

  useEffect(() => {
    fetchProposals();
  }, [projectId]);

  const fetchProposals = async () => {
    setLoading(true);
    // Get all listings for this project, then all proposals for those listings
    const { data: listings } = await supabase
      .from('procurement_listings')
      .select('id')
      .eq('project_id', projectId) as any;

    if (!listings?.length) {
      setProposals([]);
      setLoading(false);
      return;
    }

    const listingIds = listings.map((l: any) => l.id);
    const { data, error } = await supabase
      .from('procurement_proposals')
      .select('*, contractors(id, company_name, contact_name, email, phone, years_experience, address_city, address_state), procurement_listings(id, title, phase_item_id)')
      .in('listing_id', listingIds)
      .order('created_at', { ascending: false }) as any;

    if (!error) setProposals(data || []);
    setLoading(false);
  };

  const handleAccept = async (proposal: Proposal) => {
    const listingDates = dates[proposal.listing_id];
    if (!listingDates?.start || !listingDates?.due) {
      toast({ title: 'Dates required', description: 'Set start and due dates for this listing before accepting.', variant: 'destructive' });
      return;
    }

    setAccepting(proposal.id);
    try {
      await supabase.from('procurement_proposals').update({ status: 'accepted' } as any).eq('id', proposal.id);
      await supabase.from('procurement_proposals')
        .update({ status: 'rejected' } as any)
        .eq('listing_id', proposal.listing_id)
        .neq('id', proposal.id)
        .eq('status', 'pending');
      await supabase.from('procurement_listings').update({
        status: 'assigned',
        assigned_contractor_id: proposal.contractor_id,
        start_date: listingDates.start,
        deadline: listingDates.due,
      } as any).eq('id', proposal.listing_id);
      await supabase.from('contractor_project_tasks').insert({
        listing_id: proposal.listing_id,
        proposal_id: proposal.id,
        contractor_id: proposal.contractor_id,
        project_id: projectId,
        task_name: proposal.procurement_listings?.title || projectName,
        start_date: listingDates.start,
        due_date: listingDates.due,
        proposed_price: proposal.proposed_price,
        status: 'assigned',
      } as any);

      try {
        await supabase.functions.invoke('procurement-acceptance-email', {
          body: {
            contractorEmail: proposal.contractors?.email,
            contractorName: proposal.contractors?.contact_name || proposal.contractors?.company_name,
            taskName: proposal.procurement_listings?.title || projectName,
            startDate: listingDates.start,
            dueDate: listingDates.due,
            proposedPrice: proposal.proposed_price,
          },
        });
      } catch (e) { console.error('Email failed:', e); }

      // Notification for accepted contractor
      await supabase.from('notifications').insert({
        recipient_type: 'contractor',
        recipient_id: proposal.contractor_id,
        title: 'Application Accepted! 🎉',
        message: `Your application for "${proposal.procurement_listings?.title || projectName}" has been approved.`,
        type: 'success',
        related_entity_type: 'proposal',
        related_entity_id: proposal.id,
      } as any);

      toast({ title: 'Contractor Accepted', description: 'Task assigned and notification sent.' });
      fetchProposals();
      onListingUpdated?.();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setAccepting(null);
    }
  };

  const handleReject = async (proposalId: string, contractorId?: string) => {
    await supabase.from('procurement_proposals').update({ status: 'rejected' } as any).eq('id', proposalId);
    
    // Notification for rejected contractor
    if (contractorId) {
      await supabase.from('notifications').insert({
        recipient_type: 'contractor',
        recipient_id: contractorId,
        title: 'Application Update',
        message: `Your application was not selected this time.`,
        type: 'warning',
        related_entity_type: 'proposal',
        related_entity_id: proposalId,
      } as any);
    }

    toast({ title: 'Proposal rejected' });
    fetchProposals();
  };

  // Group proposals by listing
  const grouped = proposals.reduce<Record<string, { title: string; isTask: boolean; proposals: Proposal[] }>>((acc, p) => {
    const lid = p.listing_id;
    if (!acc[lid]) {
      acc[lid] = {
        title: p.procurement_listings?.title || 'Unknown Listing',
        isTask: !!p.procurement_listings?.phase_item_id,
        proposals: [],
      };
    }
    acc[lid].proposals.push(p);
    return acc;
  }, {});

  const toggleListing = (lid: string) => {
    setExpandedListings(prev => {
      const next = new Set(prev);
      next.has(lid) ? next.delete(lid) : next.add(lid);
      return next;
    });
  };

  const totalProposals = proposals.length;
  const pendingCount = proposals.filter(p => p.status === 'pending').length;

  return (
    <div className="holographic-panel rounded-lg border border-cyan-500/20 overflow-hidden">
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-cyan-500/5 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          {expanded ? <ChevronDown className="h-4 w-4 text-cyan-400" /> : <ChevronRight className="h-4 w-4 text-cyan-400" />}
          <h3 className="text-sm font-mono text-cyan-300 uppercase tracking-wider">
            Quotations & Proposals
          </h3>
          {totalProposals > 0 && (
            <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-[10px] font-mono">
              {totalProposals} total
            </Badge>
          )}
          {pendingCount > 0 && (
            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-[10px] font-mono">
              {pendingCount} pending
            </Badge>
          )}
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {loading ? (
            <p className="text-[10px] font-mono text-cyan-400/40 text-center py-4">Loading proposals...</p>
          ) : totalProposals === 0 ? (
            <p className="text-[10px] font-mono text-cyan-400/40 text-center py-4">
              No proposals received yet. Contractors will submit bids through the procurement marketplace.
            </p>
          ) : (
            Object.entries(grouped).map(([lid, group]) => (
              <div key={lid} className="rounded-lg border border-cyan-500/15 overflow-hidden">
                <div
                  className="flex items-center justify-between px-3 py-2 bg-cyan-500/5 cursor-pointer hover:bg-cyan-500/10 transition-colors"
                  onClick={() => toggleListing(lid)}
                >
                  <div className="flex items-center gap-2">
                    {expandedListings.has(lid) ? <ChevronDown className="h-3 w-3 text-cyan-400" /> : <ChevronRight className="h-3 w-3 text-cyan-400" />}
                    <span className="text-xs font-mono text-cyan-300">{group.title}</span>
                    <Badge variant="outline" className="text-[10px] font-mono border-cyan-500/20 text-cyan-400/60">
                      {group.isTask ? 'Task' : 'Full Project'}
                    </Badge>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400/50">
                    {group.proposals.length} proposal{group.proposals.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {expandedListings.has(lid) && (
                  <div className="p-3 space-y-3">
                    {/* Date assignment for this listing */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-[10px] font-mono text-cyan-400/40 flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> Start Date
                        </Label>
                        <Input
                          type="date"
                          value={dates[lid]?.start || ''}
                          onChange={e => setDates(prev => ({ ...prev, [lid]: { ...prev[lid], start: e.target.value, due: prev[lid]?.due || '' } }))}
                          className="h-7 text-[10px] bg-cyan-500/5 border-cyan-500/20 text-cyan-300 font-mono"
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] font-mono text-cyan-400/40 flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> Due Date
                        </Label>
                        <Input
                          type="date"
                          value={dates[lid]?.due || ''}
                          onChange={e => setDates(prev => ({ ...prev, [lid]: { start: prev[lid]?.start || '', due: e.target.value } }))}
                          className="h-7 text-[10px] bg-cyan-500/5 border-cyan-500/20 text-cyan-300 font-mono"
                        />
                      </div>
                    </div>

                    {/* Proposals */}
                    {group.proposals.map(p => (
                      <div key={p.id} className="rounded-lg border border-cyan-500/15 p-3 space-y-2">
                        {/* Contractor profile */}
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Building2 className="h-3.5 w-3.5 text-cyan-400/60" />
                              <span className="text-xs font-mono font-semibold text-cyan-300">
                                {p.contractors?.company_name || 'Unknown'}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-[10px] font-mono text-cyan-400/50">
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />{p.contractors?.contact_name}
                              </span>
                              {p.contractors?.email && (
                                <span className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />{p.contractors.email}
                                </span>
                              )}
                              {p.contractors?.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />{p.contractors.phone}
                                </span>
                              )}
                            </div>
                            {(p.contractors?.address_city || p.contractors?.years_experience) && (
                              <div className="flex items-center gap-3 text-[10px] font-mono text-cyan-400/40">
                                {p.contractors?.address_city && (
                                  <span>{p.contractors.address_city}, {p.contractors.address_state}</span>
                                )}
                                {p.contractors?.years_experience && (
                                  <span>{p.contractors.years_experience} yrs experience</span>
                                )}
                              </div>
                            )}
                          </div>
                          <Badge className={
                            p.status === 'accepted' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                            p.status === 'rejected' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                            'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                          }>
                            {p.status}
                          </Badge>
                        </div>

                        {/* Proposal details */}
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
                          <span>{new Date(p.created_at).toLocaleDateString()}</span>
                        </div>

                        {p.proposal_text && (
                          <p className="text-[10px] font-mono text-cyan-400/50 bg-cyan-500/5 rounded p-2">
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

                        {p.status === 'pending' && (
                          <div className="flex gap-2 pt-1">
                            <Button
                              size="sm"
                              onClick={() => handleAccept(p)}
                              disabled={accepting === p.id}
                              className="bg-green-600 hover:bg-green-500 text-[10px] font-mono h-6"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {accepting === p.id ? 'Assigning...' : 'Accept & Assign'}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleReject(p.id)}
                              className="text-red-400 hover:text-red-300 text-[10px] font-mono h-6"
                            >
                              <XCircle className="h-3 w-3 mr-1" /> Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectQuotationsPanel;
