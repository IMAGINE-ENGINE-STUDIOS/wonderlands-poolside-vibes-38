import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  DollarSign, 
  MapPin, 
  Building2, 
  CheckCircle, 
  Clock,
  Send,
  Paperclip,
  User
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

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
  profiles: {
    first_name: string;
    last_name: string;
    company_name: string;
  };
}

interface JobRequirement {
  id: string;
  requirement_text: string;
  is_mandatory: boolean;
  order_index: number;
}

interface JobAttachment {
  id: string;
  file_name: string;
  file_type: string;
  file_url: string;
  file_size: number;
}

interface JobProposal {
  id: string;
  proposal_text: string;
  proposed_price: number;
  estimated_timeline: string;
  status: string;
  created_at: string;
  profiles: {
    first_name: string;
    last_name: string;
    company_name: string;
  };
}

interface JobDetailModalProps {
  job: JobPosting;
  isOpen: boolean;
  onClose: () => void;
  onProposalSubmitted: () => void;
}

const JobDetailModal = ({ job, isOpen, onClose, onProposalSubmitted }: JobDetailModalProps) => {
  const { user, profile } = useAuth();
  const [requirements, setRequirements] = useState<JobRequirement[]>([]);
  const [attachments, setAttachments] = useState<JobAttachment[]>([]);
  const [proposals, setProposals] = useState<JobProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [proposalForm, setProposalForm] = useState({
    proposal_text: '',
    proposed_price: '',
    estimated_timeline: ''
  });

  const fetchJobDetails = async () => {
    try {
      // Fetch requirements
      const { data: reqData } = await supabase
        .from('job_requirements')
        .select('*')
        .eq('job_id', job.id)
        .order('order_index');

      // Fetch attachments
      const { data: attData } = await supabase
        .from('job_attachments')
        .select('*')
        .eq('job_id', job.id);

      // Fetch proposals
      const { data: propData } = await supabase
        .from('job_proposals')
        .select(`
          *,
          profiles!job_proposals_supplier_id_fkey (
            first_name,
            last_name,
            company_name
          )
        `)
        .eq('job_id', job.id)
        .order('created_at', { ascending: false });

      setRequirements(reqData || []);
      setAttachments(attData || []);
      setProposals(propData || []);
    } catch (error) {
      console.error('Error fetching job details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && job) {
      fetchJobDetails();
    }
  }, [isOpen, job]);

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in to submit a proposal');
      return;
    }

    if (user.id === job.business_id) {
      toast.error('You cannot submit a proposal to your own job posting');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('job_proposals')
        .insert({
          job_id: job.id,
          supplier_id: user.id,
          proposal_text: proposalForm.proposal_text,
          proposed_price: proposalForm.proposed_price ? parseFloat(proposalForm.proposed_price) : null,
          estimated_timeline: proposalForm.estimated_timeline
        });

      if (error) throw error;

      toast.success('Proposal submitted successfully!');
      setProposalForm({
        proposal_text: '',
        proposed_price: '',
        estimated_timeline: ''
      });
      fetchJobDetails();
      onProposalSubmitted();
    } catch (error) {
      console.error('Error submitting proposal:', error);
      toast.error('Failed to submit proposal');
    } finally {
      setSubmitting(false);
    }
  };

  const formatBudget = (min: number, max: number) => {
    if (min && max) {
      return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    } else if (min) {
      return `From $${min.toLocaleString()}`;
    } else if (max) {
      return `Up to $${max.toLocaleString()}`;
    }
    return 'Budget TBD';
  };

  const getInitials = (firstName: string, lastName: string, companyName: string) => {
    if (companyName) {
      return companyName.substring(0, 2).toUpperCase();
    }
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase() || 'U';
  };

  const canSubmitProposal = user && user.id !== job.business_id;
  const hasSubmittedProposal = proposals.some(p => p.profiles && user && p.profiles.first_name === profile?.first_name);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{job.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Job Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-12 w-12 border-2 border-primary/20">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-teal text-white font-semibold">
                      {getInitials(
                        job.profiles?.first_name || '',
                        job.profiles?.last_name || '',
                        job.profiles?.company_name || ''
                      )}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <h3 className="font-semibold text-lg">
                      {job.profiles?.company_name || 
                       `${job.profiles?.first_name} ${job.profiles?.last_name}`.trim() || 
                       'Anonymous'}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Posted {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                    </div>
                  </div>
                </div>
                
                <Badge className="bg-primary/10 text-primary">
                  {job.category.charAt(0).toUpperCase() + job.category.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{formatBudget(job.budget_min, job.budget_max)}</span>
                </div>
                
                {job.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{job.location}</span>
                  </div>
                )}
                
                {job.deadline && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Due {new Date(job.deadline).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
              
              {job.description && (
                <p className="text-muted-foreground">{job.description}</p>
              )}
            </CardContent>
          </Card>

          <Tabs defaultValue="details" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Project Details</TabsTrigger>
              <TabsTrigger value="proposals">Proposals ({proposals.length})</TabsTrigger>
              {canSubmitProposal && <TabsTrigger value="submit">Submit Proposal</TabsTrigger>}
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              {/* Requirements */}
              {requirements.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Requirements & Checklist</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {requirements.map((requirement) => (
                        <div key={requirement.id} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <span className="text-sm">{requirement.requirement_text}</span>
                            {requirement.is_mandatory && (
                              <Badge variant="secondary" className="ml-2 text-xs">Required</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Attachments */}
              {attachments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Attachments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {attachments.map((attachment) => (
                        <div key={attachment.id} className="flex items-center gap-2 p-2 border rounded">
                          <Paperclip className="h-4 w-4 text-muted-foreground" />
                          <span className="flex-1">{attachment.file_name}</span>
                          <Button variant="outline" size="sm">Download</Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="proposals">
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {proposals.length === 0 ? (
                    <div className="text-center py-8">
                      <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No proposals yet</p>
                    </div>
                  ) : (
                    proposals.map((proposal) => (
                      <Card key={proposal.id}>
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                  {getInitials(
                                    proposal.profiles?.first_name || '',
                                    proposal.profiles?.last_name || '',
                                    proposal.profiles?.company_name || ''
                                  )}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-medium">
                                  {proposal.profiles?.company_name || 
                                   `${proposal.profiles?.first_name} ${proposal.profiles?.last_name}`.trim() || 
                                   'Anonymous'}
                                </h4>
                                <span className="text-sm text-muted-foreground">
                                  {formatDistanceToNow(new Date(proposal.created_at), { addSuffix: true })}
                                </span>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              {proposal.proposed_price && (
                                <div className="font-semibold text-primary">
                                  ${proposal.proposed_price.toLocaleString()}
                                </div>
                              )}
                              {proposal.estimated_timeline && (
                                <div className="text-sm text-muted-foreground">
                                  {proposal.estimated_timeline}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <p className="text-sm text-muted-foreground">{proposal.proposal_text}</p>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            {canSubmitProposal && (
              <TabsContent value="submit">
                {hasSubmittedProposal ? (
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Proposal Already Submitted</h3>
                      <p className="text-muted-foreground">
                        You have already submitted a proposal for this job. You can view it in the Proposals tab.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <form onSubmit={handleSubmitProposal} className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Submit Your Proposal</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="proposal_text">Proposal Description *</Label>
                          <Textarea
                            id="proposal_text"
                            value={proposalForm.proposal_text}
                            onChange={(e) => setProposalForm(prev => ({ ...prev, proposal_text: e.target.value }))}
                            placeholder="Describe your approach, experience, and why you're the right fit for this project..."
                            rows={6}
                            required
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="proposed_price">Your Price ($)</Label>
                            <Input
                              id="proposed_price"
                              type="number"
                              value={proposalForm.proposed_price}
                              onChange={(e) => setProposalForm(prev => ({ ...prev, proposed_price: e.target.value }))}
                              placeholder="Enter your proposed price"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="estimated_timeline">Estimated Timeline</Label>
                            <Input
                              id="estimated_timeline"
                              value={proposalForm.estimated_timeline}
                              onChange={(e) => setProposalForm(prev => ({ ...prev, estimated_timeline: e.target.value }))}
                              placeholder="e.g., 2-3 weeks, 1 month"
                            />
                          </div>
                        </div>

                        <Button 
                          type="submit" 
                          disabled={submitting || !proposalForm.proposal_text.trim()}
                          className="w-full bg-gradient-to-r from-primary to-teal text-white"
                        >
                          {submitting ? 'Submitting...' : (
                            <>
                              <Send className="mr-2 h-4 w-4" />
                              Submit Proposal
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  </form>
                )}
              </TabsContent>
            )}
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JobDetailModal;