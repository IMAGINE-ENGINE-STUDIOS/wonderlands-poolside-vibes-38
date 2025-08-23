import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Send, Upload, X, DollarSign, Calendar, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface JobFormData {
  title: string;
  description: string;
  category: string;
  location: string;
  budget_min: number;
  budget_max: number;
  deadline: string;
}

interface JobRequirement {
  requirement_text: string;
  is_mandatory: boolean;
}

interface JobAttachment {
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
}

const categories = [
  'Pool Installation',
  'Pool Maintenance',
  'Pool Repair',
  'Spa Installation',
  'Spa Repair',
  'Paver Installation',
  'Landscaping',
  'Electrical Work',
  'Plumbing',
  'Concrete Work',
  'Other'
];

export const ProcurementPostLauncher = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    description: '',
    category: '',
    location: '',
    budget_min: 0,
    budget_max: 0,
    deadline: ''
  });
  const [requirements, setRequirements] = useState<JobRequirement[]>([
    { requirement_text: '', is_mandatory: true }
  ]);
  const [attachments, setAttachments] = useState<JobAttachment[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();

  const handleInputChange = (field: keyof JobFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRequirementChange = (index: number, field: keyof JobRequirement, value: any) => {
    setRequirements(prev => prev.map((req, i) => 
      i === index ? { ...req, [field]: value } : req
    ));
  };

  const addRequirement = () => {
    setRequirements(prev => [...prev, { requirement_text: '', is_mandatory: true }]);
  };

  const removeRequirement = (index: number) => {
    if (requirements.length > 1) {
      setRequirements(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadingFiles(true);
    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('job-attachments')
          .upload(fileName, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('job-attachments')
          .getPublicUrl(fileName);

        setAttachments(prev => [...prev, {
          file_name: file.name,
          file_url: publicUrl,
          file_type: file.type,
          file_size: file.size
        }]);
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: "Upload Error",
        description: "Failed to upload some files",
        variant: "destructive"
      });
    } finally {
      setUploadingFiles(false);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      location: '',
      budget_min: 0,
      budget_max: 0,
      deadline: ''
    });
    setRequirements([{ requirement_text: '', is_mandatory: true }]);
    setAttachments([]);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to post a job",
        variant: "destructive"
      });
      return;
    }

    if (!formData.title || !formData.description || !formData.category) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Create job posting
      const { data: jobData, error: jobError } = await supabase
        .from('job_postings')
        .insert({
          business_id: user.id,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          location: formData.location,
          budget_min: formData.budget_min || null,
          budget_max: formData.budget_max || null,
          deadline: formData.deadline || null,
          status: 'open'
        })
        .select()
        .single();

      if (jobError) throw jobError;

      // Add requirements
      if (requirements.some(req => req.requirement_text.trim())) {
        const validRequirements = requirements
          .filter(req => req.requirement_text.trim())
          .map((req, index) => ({
            job_id: jobData.id,
            requirement_text: req.requirement_text,
            is_mandatory: req.is_mandatory,
            order_index: index
          }));

        const { error: reqError } = await supabase
          .from('job_requirements')
          .insert(validRequirements);

        if (reqError) console.error('Requirements error:', reqError);
      }

      // Add attachments
      if (attachments.length > 0) {
        const attachmentData = attachments.map(att => ({
          job_id: jobData.id,
          file_name: att.file_name,
          file_url: att.file_url,
          file_type: att.file_type,
          file_size: att.file_size
        }));

        const { error: attError } = await supabase
          .from('job_attachments')
          .insert(attachmentData);

        if (attError) console.error('Attachments error:', attError);
      }

      toast({
        title: "Job Posted Successfully",
        description: "Your job posting is now live and visible to suppliers",
        duration: 5000
      });

      resetForm();
      setIsOpen(false);
    } catch (error) {
      console.error('Error creating job posting:', error);
      toast({
        title: "Error",
        description: "Failed to create job posting. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatBudget = (min: number, max: number) => {
    if (min > 0 && max > 0) {
      return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    } else if (min > 0) {
      return `Starting at $${min.toLocaleString()}`;
    } else if (max > 0) {
      return `Up to $${max.toLocaleString()}`;
    }
    return 'Budget negotiable';
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Post New Job
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Job Posting</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form */}
          <div className="space-y-4">
            <div className="space-y-3">
              <div>
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Pool Installation for New Home"
                />
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="e.g., Miami, FL"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="budget_min">Min Budget ($)</Label>
                  <Input
                    id="budget_min"
                    type="number"
                    value={formData.budget_min || ''}
                    onChange={(e) => handleInputChange('budget_min', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label htmlFor="budget_max">Max Budget ($)</Label>
                  <Input
                    id="budget_max"
                    type="number"
                    value={formData.budget_max || ''}
                    onChange={(e) => handleInputChange('budget_max', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="deadline">Project Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => handleInputChange('deadline', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your project requirements, timeline, and any specific details..."
                />
              </div>
            </div>

            {/* Requirements */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Requirements</Label>
                <Button type="button" variant="outline" size="sm" onClick={addRequirement}>
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </div>
              
              {requirements.map((req, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <Input
                    placeholder="Enter requirement"
                    value={req.requirement_text}
                    onChange={(e) => handleRequirementChange(index, 'requirement_text', e.target.value)}
                    className="flex-1"
                  />
                  {requirements.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRequirement(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* File Attachments */}
            <div className="space-y-3">
              <Label htmlFor="attachments">Attachments</Label>
              <Input
                id="attachments"
                type="file"
                multiple
                onChange={handleFileUpload}
                disabled={uploadingFiles}
              />
              {attachments.length > 0 && (
                <div className="space-y-1">
                  {attachments.map((att, index) => (
                    <div key={index} className="flex items-center justify-between text-sm bg-muted p-2 rounded">
                      <span>{att.file_name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={resetForm} variant="outline" className="flex-1">
                Reset
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1">
                {isSubmitting ? 'Posting...' : 'Post Job'}
                <Send className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>

          {/* Live Preview */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Live Preview</h3>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <CardTitle className="text-lg">
                      {formData.title || 'Job Title'}
                    </CardTitle>
                    <div className="flex items-center gap-2 flex-wrap">
                      {formData.category && (
                        <Badge variant="secondary">{formData.category}</Badge>
                      )}
                      {formData.location && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {formData.location}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {formData.description || 'Job description will appear here...'}
                </p>
                
                {(formData.budget_min > 0 || formData.budget_max > 0) && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-600">
                      {formatBudget(formData.budget_min, formData.budget_max)}
                    </span>
                  </div>
                )}
                
                {formData.deadline && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-orange-600" />
                    <span className="text-sm">
                      Deadline: {new Date(formData.deadline).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {requirements.some(req => req.requirement_text.trim()) && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Requirements:</h4>
                    <ul className="text-sm space-y-1">
                      {requirements
                        .filter(req => req.requirement_text.trim())
                        .map((req, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                            {req.requirement_text}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}

                {attachments.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Attachments:</h4>
                    <div className="flex gap-2 flex-wrap">
                      {attachments.map((att, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          <Upload className="h-3 w-3 mr-1" />
                          {att.file_name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProcurementPostLauncher;