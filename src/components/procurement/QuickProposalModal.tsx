import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Clock, 
  DollarSign, 
  MapPin, 
  Calendar, 
  Paperclip,
  Send,
  Building2,
  Upload,
  X,
  FileText,
  Image as ImageIcon
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

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
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  
  const [formData, setFormData] = useState({
    proposalText: '',
    price: '',
    timeline: '',
    contactEmail: user?.email || '',
    contactPhone: ''
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    const validFiles = files.filter(file => {
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: `${file.name} is not a supported file type.`,
          variant: "destructive",
        });
        return false;
      }
      
      if (file.size > maxSize) {
        toast({
          title: "File Too Large",
          description: `${file.name} is larger than 10MB.`,
          variant: "destructive",
        });
        return false;
      }
      
      return true;
    });

    setUploadedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFilesToSupabase = async (files: File[]) => {
    const uploadedUrls: string[] = [];
    
    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `proposals/${fileName}`;

      setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));

      const { data, error } = await supabase.storage
        .from('proposal-attachments')
        .upload(filePath, file);

      if (error) {
        console.error('Error uploading file:', error);
        toast({
          title: "Upload Error",
          description: `Failed to upload ${file.name}`,
          variant: "destructive",
        });
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('proposal-attachments')
        .getPublicUrl(filePath);

      uploadedUrls.push(publicUrl);
      setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
    }
    
    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.proposalText.trim() || !formData.price) {
      toast({
        title: "Missing Information",
        description: "Please fill in the proposal text and price.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to submit proposals.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Upload files if any
      let attachmentUrls: string[] = [];
      if (uploadedFiles.length > 0) {
        attachmentUrls = await uploadFilesToSupabase(uploadedFiles);
      }

      // Submit proposal to database
      const { data, error } = await supabase
        .from('job_proposals')
        .insert({
          job_id: job?.id,
          supplier_id: user.id,
          proposal_text: formData.proposalText,
          proposed_price: parseFloat(formData.price),
          estimated_timeline: formData.timeline,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Insert attachments if any
      if (attachmentUrls.length > 0 && data) {
        const attachments = attachmentUrls.map((url, index) => ({
          proposal_id: data.id,
          file_url: url,
          file_name: uploadedFiles[index].name,
          file_type: uploadedFiles[index].type,
          file_size: uploadedFiles[index].size
        }));

        await supabase
          .from('proposal_attachments')
          .insert(attachments);
      }
      
      onSubmit({
        ...formData,
        jobId: job?.id || '',
        submittedAt: new Date().toISOString(),
        attachments: attachmentUrls
      });
      
      toast({
        title: "Proposal Submitted",
        description: "Your proposal has been sent to the client successfully.",
      });
      
      // Reset form
      setFormData({
        proposalText: '',
        price: '',
        timeline: '',
        contactEmail: user?.email || '',
        contactPhone: ''
      });
      setUploadedFiles([]);
      setUploadProgress({});
      
      onClose();
    } catch (error) {
      console.error('Error submitting proposal:', error);
      toast({
        title: "Error",
        description: "Failed to submit proposal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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
                value={formData.proposalText}
                onChange={(e) => setFormData(prev => ({ ...prev, proposalText: e.target.value }))}
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
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
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
                    value={formData.timeline}
                    onChange={(e) => setFormData(prev => ({ ...prev, timeline: e.target.value }))}
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
                  value={formData.contactEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="attachments">Attachments</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <Label
                      htmlFor="file-upload"
                      className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg cursor-pointer hover:bg-accent transition-colors"
                    >
                      <Upload className="h-4 w-4" />
                      Upload Files
                    </Label>
                    <span className="text-sm text-muted-foreground">
                      PDF, DOC, DOCX, JPG, PNG (Max 10MB each)
                    </span>
                  </div>
                  
                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-accent/50 rounded-lg">
                          <div className="flex items-center gap-2 flex-1">
                            {file.type.startsWith('image/') ? (
                              <ImageIcon className="h-4 w-4 text-blue-500" />
                            ) : (
                              <FileText className="h-4 w-4 text-green-500" />
                            )}
                            <span className="text-sm font-medium">{file.name}</span>
                            <span className="text-xs text-muted-foreground">
                              ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          </div>
                          {uploadProgress[file.name] !== undefined && uploadProgress[file.name] < 100 && (
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress[file.name]}%` }}
                              />
                            </div>
                          )}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !formData.proposalText.trim() || !formData.contactEmail.trim()}
                className="flex-1 bg-gradient-to-r from-primary to-teal text-white"
              >
                {isSubmitting ? 'Submitting...' : (
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