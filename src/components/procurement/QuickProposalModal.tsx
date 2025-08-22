import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  Clock, 
  Send, 
  Paperclip,
  MapPin,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';

interface JobPosting {
  id: string;
  title: string;
  description: string;
  category: string;
  budget_min: number;
  budget_max: number;
  deadline: string;
  location: string;
  profiles: {
    first_name: string;
    last_name: string;
    company_name: string;
  };
}

interface QuickProposalModalProps {
  job: JobPosting | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (proposalData: any) => void;
}

const QuickProposalModal = ({ job, isOpen, onClose, onSubmit }: QuickProposalModalProps) => {
  const [formData, setFormData] = useState({
    proposal_text: '',
    proposed_price: '',
    estimated_timeline: '',
    contact_email: '',
    phone_number: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;

    setSubmitting(true);
    try {
      // Simulate proposal submission
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      onSubmit({
        jobId: job.id,
        ...formData
      });
      
      toast.success('Quick proposal submitted successfully!');
      setFormData({
        proposal_text: '',
        proposed_price: '',
        estimated_timeline: '',
        contact_email: '',
        phone_number: ''
      });
      onClose();
    } catch (error) {
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

  if (!job) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Quick Proposal</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Job Summary */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                <h3 className="font-semibold text-lg line-clamp-2">{job.title}</h3>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    <span className="font-medium text-primary">
                      {formatBudget(job.budget_min, job.budget_max)}
                    </span>
                  </div>
                  
                  {job.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {job.location}
                    </div>
                  )}
                  
                  {job.deadline && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(job.deadline).toLocaleDateString()}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{job.category}</Badge>
                  <span className="text-sm text-muted-foreground">
                    by {job.profiles?.company_name || 
                        `${job.profiles?.first_name} ${job.profiles?.last_name}`.trim() || 
                        'Anonymous'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Proposal Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="proposal_text">Your Proposal *</Label>
              <Textarea
                id="proposal_text"
                value={formData.proposal_text}
                onChange={(e) => setFormData(prev => ({ ...prev, proposal_text: e.target.value }))}
                placeholder="Briefly describe your approach, experience, and why you're the best fit for this project..."
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="proposed_price">Your Price ($)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="proposed_price"
                    type="number"
                    value={formData.proposed_price}
                    onChange={(e) => setFormData(prev => ({ ...prev, proposed_price: e.target.value }))}
                    placeholder="25000"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimated_timeline">Timeline</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="estimated_timeline"
                    value={formData.estimated_timeline}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimated_timeline: e.target.value }))}
                    placeholder="2-3 weeks"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact_email">Contact Email *</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            <div className="bg-muted/30 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Paperclip className="h-4 w-4" />
                <span>Attachments (Coming Soon)</span>
              </div>
              <p className="text-xs text-muted-foreground">
                You'll be able to attach portfolio images, certifications, and project documents in the full proposal form.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={submitting || !formData.proposal_text.trim() || !formData.contact_email.trim()}
                className="flex-1 bg-gradient-to-r from-primary to-teal text-white"
              >
                {submitting ? 'Submitting...' : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Quick Proposal
                  </>
                )}
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground text-center">
              This is a quick proposal. You can submit a detailed proposal with attachments from the job details page.
            </p>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickProposalModal;