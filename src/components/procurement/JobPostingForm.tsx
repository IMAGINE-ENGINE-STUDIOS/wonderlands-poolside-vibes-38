import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Upload, X, Plus, FileText, Image, Video, Paperclip } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface JobRequirement {
  id: string;
  text: string;
  mandatory: boolean;
}

interface FileAttachment {
  id: string;
  file: File;
  type: 'image' | 'video' | 'document';
  preview?: string;
}

interface JobPostingFormProps {
  onJobCreated: () => void;
}

const JobPostingForm = ({ onJobCreated }: JobPostingFormProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    budget_min: '',
    budget_max: '',
    deadline: '',
    location: ''
  });
  const [requirements, setRequirements] = useState<JobRequirement[]>([]);
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [newRequirement, setNewRequirement] = useState('');

  const categories = [
    { value: 'pools', label: 'Pools' },
    { value: 'outdoors', label: 'Outdoors' },
    { value: 'patios', label: 'Patios' },
    { value: 'improvements', label: 'Improvements' },
    { value: 'construction', label: 'Construction' }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
      const requirement: JobRequirement = {
        id: Date.now().toString(),
        text: newRequirement.trim(),
        mandatory: true
      };
      setRequirements(prev => [...prev, requirement]);
      setNewRequirement('');
    }
  };

  const removeRequirement = (id: string) => {
    setRequirements(prev => prev.filter(req => req.id !== id));
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;

    Array.from(files).forEach(file => {
      const fileType = file.type.startsWith('image/') ? 'image' :
                      file.type.startsWith('video/') ? 'video' : 'document';
      
      const attachment: FileAttachment = {
        id: Date.now().toString() + Math.random(),
        file,
        type: fileType
      };

      if (fileType === 'image') {
        const reader = new FileReader();
        reader.onload = (e) => {
          attachment.preview = e.target?.result as string;
          setAttachments(prev => [...prev, attachment]);
        };
        reader.readAsDataURL(file);
      } else {
        setAttachments(prev => [...prev, attachment]);
      }
    });
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

  const uploadFile = async (file: File, jobId: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${jobId}/${Date.now()}.${fileExt}`;
    
    // For now, we'll store a placeholder URL
    // In a real implementation, you'd upload to Supabase Storage
    return {
      file_url: `/uploads/${fileName}`,
      file_name: file.name,
      file_type: file.type,
      file_size: file.size
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in to post a job');
      return;
    }

    setLoading(true);
    try {
      // Create job posting
      const { data: jobData, error: jobError } = await supabase
        .from('job_postings')
        .insert({
          business_id: user.id,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          budget_min: formData.budget_min ? parseFloat(formData.budget_min) : null,
          budget_max: formData.budget_max ? parseFloat(formData.budget_max) : null,
          deadline: formData.deadline || null,
          location: formData.location
        })
        .select()
        .single();

      if (jobError) throw jobError;

      // Add requirements
      if (requirements.length > 0) {
        const requirementsData = requirements.map((req, index) => ({
          job_id: jobData.id,
          requirement_text: req.text,
          is_mandatory: req.mandatory,
          order_index: index
        }));

        const { error: reqError } = await supabase
          .from('job_requirements')
          .insert(requirementsData);

        if (reqError) throw reqError;
      }

      // Upload attachments
      if (attachments.length > 0) {
        const attachmentPromises = attachments.map(async (attachment) => {
          const fileData = await uploadFile(attachment.file, jobData.id);
          return {
            job_id: jobData.id,
            ...fileData
          };
        });

        const attachmentData = await Promise.all(attachmentPromises);
        
        const { error: attachError } = await supabase
          .from('job_attachments')
          .insert(attachmentData);

        if (attachError) throw attachError;
      }

      onJobCreated();
    } catch (error) {
      console.error('Error creating job:', error);
      toast.error('Failed to create job posting');
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (type: string) => {
    if (type === 'image') return <Image className="h-4 w-4" />;
    if (type === 'video') return <Video className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Job Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Pool Installation Project"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your project requirements, timeline, and expectations..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="City, State"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="budget_min">Min Budget ($)</Label>
              <Input
                id="budget_min"
                type="number"
                value={formData.budget_min}
                onChange={(e) => handleInputChange('budget_min', e.target.value)}
                placeholder="5000"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="budget_max">Max Budget ($)</Label>
              <Input
                id="budget_max"
                type="number"
                value={formData.budget_max}
                onChange={(e) => handleInputChange('budget_max', e.target.value)}
                placeholder="15000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Project Deadline</Label>
            <Input
              id="deadline"
              type="date"
              value={formData.deadline}
              onChange={(e) => handleInputChange('deadline', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Requirements Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Requirements & Checklist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newRequirement}
              onChange={(e) => setNewRequirement(e.target.value)}
              placeholder="Add requirement or checklist item..."
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
            />
            <Button type="button" onClick={addRequirement} variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {requirements.length > 0 && (
            <div className="space-y-2">
              {requirements.map((requirement) => (
                <div key={requirement.id} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                  <Badge variant={requirement.mandatory ? "default" : "secondary"}>
                    {requirement.mandatory ? 'Required' : 'Optional'}
                  </Badge>
                  <span className="flex-1">{requirement.text}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRequirement(requirement.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* File Attachments */}
      <Card>
        <CardHeader>
          <CardTitle>Attachments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">
              Drag and drop files here, or click to select
            </p>
            <input
              type="file"
              multiple
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
              id="file-upload"
              accept="image/*,video/*,.pdf,.doc,.docx,.txt"
            />
            <Button type="button" variant="outline" onClick={() => document.getElementById('file-upload')?.click()}>
              <Paperclip className="h-4 w-4 mr-2" />
              Choose Files
            </Button>
          </div>

          {attachments.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {attachments.map((attachment) => (
                <div key={attachment.id} className="relative p-3 border border-border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    {getFileIcon(attachment.type)}
                    <span className="text-sm truncate">{attachment.file.name}</span>
                  </div>
                  
                  {attachment.preview && (
                    <img
                      src={attachment.preview}
                      alt="Preview"
                      className="w-full h-20 object-cover rounded"
                    />
                  )}
                  
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground"
                    onClick={() => removeAttachment(attachment.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <Button type="submit" disabled={loading} className="bg-gradient-to-r from-primary to-teal text-white">
          {loading ? 'Posting...' : 'Post Job'}
        </Button>
      </div>
    </form>
  );
};

export default JobPostingForm;