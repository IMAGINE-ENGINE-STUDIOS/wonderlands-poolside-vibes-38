import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DollarSign, Clock, CheckCircle, XCircle, User, Calendar, FileText, ExternalLink } from 'lucide-react';

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
  } | null;
}

interface ProcurementProposalsListProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingId: string;
  listingTitle: string;
  listing?: any;
  onListingUpdated?: () => void;
}

const ProcurementProposalsList: React.FC<ProcurementProposalsListProps> = ({
  open, onOpenChange, listingId, listingTitle, listing, onListingUpdated
}) => {
  const { toast } = useToast();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    if (open && listingId) fetchProposals();
  }, [open, listingId]);

  const fetchProposals = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('procurement_proposals')
      .select('*, contractors(id, company_name, contact_name, email)')
      .eq('listing_id', listingId)
      .order('created_at', { ascending: false }) as any;
    if (!error) setProposals(data || []);
    setLoading(false);
  };

  const handleAccept = async (proposal: Proposal) => {
    if (!startDate || !dueDate) {
      toast({ title: 'Dates required', description: 'Please set start and due dates before accepting.', variant: 'destructive' });
      return;
    }

    setAccepting(proposal.id);
    try {
      // 1. Update proposal status
      await supabase.from('procurement_proposals').update({ status: 'accepted' } as any).eq('id', proposal.id);

      // 2. Reject other pending proposals
      await supabase.from('procurement_proposals')
        .update({ status: 'rejected' } as any)
        .eq('listing_id', listingId)
        .neq('id', proposal.id)
        .eq('status', 'pending');

      // 3. Update listing with assigned contractor and status
      await supabase.from('procurement_listings').update({
        status: 'assigned',
        assigned_contractor_id: proposal.contractor_id,
        start_date: startDate,
        deadline: dueDate,
      } as any).eq('id', listingId);

      // 4. Create contractor_project_tasks entry
      await supabase.from('contractor_project_tasks').insert({
        listing_id: listingId,
        proposal_id: proposal.id,
        contractor_id: proposal.contractor_id,
        project_id: listing?.project_id,
        task_name: listingTitle,
        description: listing?.description || null,
        location: listing?.location || null,
        start_date: startDate,
        due_date: dueDate,
        proposed_price: proposal.proposed_price,
        status: 'assigned',
      } as any);

      // 5. Send acceptance email via edge function
      try {
        await supabase.functions.invoke('procurement-acceptance-email', {
          body: {
            contractorEmail: proposal.contractors?.email,
            contractorName: proposal.contractors?.contact_name || proposal.contractors?.company_name,
            taskName: listingTitle,
            startDate,
            dueDate,
            proposedPrice: proposal.proposed_price,
            location: listing?.location,
          },
        });
      } catch (emailErr) {
        console.error('Email send failed:', emailErr);
      }

      toast({ title: 'Contractor Accepted', description: 'Task assigned and email notification sent.' });
      fetchProposals();
      onListingUpdated?.();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setAccepting(null);
    }
  };

  const updateProposalStatus = async (proposalId: string, status: string) => {
    const { error } = await supabase
      .from('procurement_proposals')
      .update({ status } as any)
      .eq('id', proposalId);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: `Proposal ${status}` });
      fetchProposals();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl bg-[#0d0d15] border-cyan-500/30 max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-cyan-300 font-mono text-sm">
            Proposals — {listingTitle}
          </DialogTitle>
        </DialogHeader>

        {/* Date Assignment Section */}
        <div className="rounded-lg border border-cyan-500/20 p-3 space-y-2">
          <Label className="text-[10px] font-mono text-cyan-400/50 uppercase tracking-wider">
            Assign Dates (required before accepting)
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[10px] font-mono text-cyan-400/40 flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Start Date
              </Label>
              <Input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="h-7 text-[10px] bg-cyan-500/5 border-cyan-500/20 text-cyan-300 font-mono"
              />
            </div>
            <div>
              <Label className="text-[10px] font-mono text-cyan-400/40 flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Due Date
              </Label>
              <Input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="h-7 text-[10px] bg-cyan-500/5 border-cyan-500/20 text-cyan-300 font-mono"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-cyan-400/50 font-mono text-xs">Loading...</div>
        ) : proposals.length === 0 ? (
          <div className="text-center py-8 text-cyan-400/50 font-mono text-xs">No proposals yet.</div>
        ) : (
          <div className="space-y-3">
            {proposals.map(p => (
              <div key={p.id} className="rounded-lg border border-cyan-500/20 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3 text-cyan-400/60" />
                    <span className="text-xs font-mono text-cyan-300">
                      {p.contractors?.company_name || 'Unknown'}
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400/40">
                      ({p.contractors?.contact_name})
                    </span>
                  </div>
                  <Badge className={
                    p.status === 'accepted' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                    p.status === 'rejected' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                    'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                  }>
                    {p.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-mono text-cyan-400/60">
                  {p.proposed_price && (
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />${p.proposed_price.toLocaleString()}
                    </span>
                  )}
                  {p.estimated_timeline && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />{p.estimated_timeline}
                    </span>
                  )}
                  <span className="capitalize">{p.proposal_type}</span>
                </div>
                {p.proposal_text && (
                  <p className="text-[10px] font-mono text-cyan-400/50">{p.proposal_text}</p>
                )}
                {/* Quotation file link */}
                {(p as any).quotation_url && (
                  <a
                    href={(p as any).quotation_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[10px] font-mono text-cyan-400 hover:text-cyan-300"
                  >
                    <FileText className="h-3 w-3" />
                    {(p as any).quotation_file_name || 'View Quotation'}
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
                      onClick={() => updateProposalStatus(p.id, 'rejected')}
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
      </DialogContent>
    </Dialog>
  );
};

export default ProcurementProposalsList;
