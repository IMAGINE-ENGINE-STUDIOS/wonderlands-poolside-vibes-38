import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DollarSign, Clock, CheckCircle, XCircle, User } from 'lucide-react';

interface Proposal {
  id: string;
  proposal_type: string;
  proposed_price: number | null;
  proposal_text: string | null;
  estimated_timeline: string | null;
  status: string;
  created_at: string;
  contractors: {
    company_name: string;
    contact_name: string;
  } | null;
}

interface ProcurementProposalsListProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingId: string;
  listingTitle: string;
}

const ProcurementProposalsList: React.FC<ProcurementProposalsListProps> = ({
  open, onOpenChange, listingId, listingTitle
}) => {
  const { toast } = useToast();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && listingId) fetchProposals();
  }, [open, listingId]);

  const fetchProposals = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('procurement_proposals')
      .select('*, contractors(company_name, contact_name)')
      .eq('listing_id', listingId)
      .order('created_at', { ascending: false }) as any;
    if (!error) setProposals(data || []);
    setLoading(false);
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
                {p.status === 'pending' && (
                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      onClick={() => updateProposalStatus(p.id, 'accepted')}
                      className="bg-green-600 hover:bg-green-500 text-[10px] font-mono h-6"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" /> Accept
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
