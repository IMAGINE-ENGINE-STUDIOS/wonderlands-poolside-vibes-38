import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, DollarSign, Calendar, Briefcase, Send, Clock } from 'lucide-react';
import ProcurementProposalForm from './ProcurementProposalForm';

interface Listing {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  budget_min: number | null;
  budget_max: number | null;
  deadline: string | null;
  status: string;
  created_at: string;
}

interface MyProposal {
  id: string;
  proposed_price: number | null;
  proposal_text: string | null;
  estimated_timeline: string | null;
  status: string;
  proposal_type: string;
  created_at: string;
  procurement_listings: Listing | null;
}

interface ContractorProcurementTabProps {
  contractorId: string;
  contractorStatus: string;
}

const ContractorProcurementTab: React.FC<ContractorProcurementTabProps> = ({
  contractorId, contractorStatus
}) => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [myProposals, setMyProposals] = useState<MyProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyingTo, setApplyingTo] = useState<Listing | null>(null);

  useEffect(() => {
    fetchData();
  }, [contractorId]);

  const fetchData = async () => {
    setLoading(true);
    const [listingsRes, proposalsRes] = await Promise.all([
      supabase.from('procurement_listings').select('*').eq('status', 'open').order('created_at', { ascending: false }) as any,
      supabase.from('procurement_proposals').select('*, procurement_listings(*)').eq('contractor_id', contractorId).order('created_at', { ascending: false }) as any,
    ]);
    setListings(listingsRes.data || []);
    setMyProposals(proposalsRes.data || []);
    setLoading(false);
  };

  const appliedListingIds = new Set(myProposals.map(p => (p.procurement_listings as any)?.id).filter(Boolean));

  if (contractorStatus !== 'approved') {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-2">Account Not Approved</h3>
          <p className="text-sm text-muted-foreground">
            Your account must be approved before you can access procurement listings.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  return (
    <>
      <Tabs defaultValue="listings" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="listings">Available Listings ({listings.length})</TabsTrigger>
          <TabsTrigger value="proposals">My Proposals ({myProposals.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="listings" className="space-y-4">
          {listings.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground text-sm">
                No open procurement listings at this time.
              </CardContent>
            </Card>
          ) : listings.map(listing => (
            <Card key={listing.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <h3 className="font-semibold">{listing.title}</h3>
                    {listing.description && (
                      <p className="text-sm text-muted-foreground">{listing.description}</p>
                    )}
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      {listing.location && (
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{listing.location}</span>
                      )}
                      {(listing.budget_min || listing.budget_max) && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {listing.budget_min ? `$${listing.budget_min.toLocaleString()}` : '$0'}
                          {' - '}
                          {listing.budget_max ? `$${listing.budget_max.toLocaleString()}` : 'Open'}
                        </span>
                      )}
                      {listing.deadline && (
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(listing.deadline).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <div>
                    {appliedListingIds.has(listing.id) ? (
                      <Badge className="bg-green-500/20 text-green-600 border-green-500/30">Applied</Badge>
                    ) : (
                      <Button size="sm" onClick={() => setApplyingTo(listing)}>
                        <Send className="h-3 w-3 mr-1" /> Apply
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="proposals" className="space-y-4">
          {myProposals.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground text-sm">
                You haven't submitted any proposals yet.
              </CardContent>
            </Card>
          ) : myProposals.map(p => (
            <Card key={p.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-sm">{(p.procurement_listings as any)?.title || 'Listing'}</h3>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {p.proposed_price && <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />${p.proposed_price.toLocaleString()}</span>}
                      {p.estimated_timeline && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{p.estimated_timeline}</span>}
                      <span className="capitalize">{p.proposal_type}</span>
                    </div>
                    {p.proposal_text && <p className="text-xs text-muted-foreground mt-1">{p.proposal_text}</p>}
                  </div>
                  <Badge className={
                    p.status === 'accepted' ? 'bg-green-500/20 text-green-600 border-green-500/30' :
                    p.status === 'rejected' ? 'bg-red-500/20 text-red-600 border-red-500/30' :
                    'bg-yellow-500/20 text-yellow-600 border-yellow-500/30'
                  }>
                    {p.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {applyingTo && (
        <ProcurementProposalForm
          open={!!applyingTo}
          onOpenChange={(open) => !open && setApplyingTo(null)}
          listing={applyingTo}
          contractorId={contractorId}
          onSubmitted={() => { setApplyingTo(null); fetchData(); }}
        />
      )}
    </>
  );
};

export default ContractorProcurementTab;
