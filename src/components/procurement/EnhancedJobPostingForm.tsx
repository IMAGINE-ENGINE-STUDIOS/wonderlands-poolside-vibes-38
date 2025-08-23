import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, X, Plus, Eye, Settings, Wand2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import LivePreview from './LivePreview';
import FormBuilder from './FormBuilder';

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

interface CustomField {
  id: string;
  type: 'text' | 'select' | 'checkbox' | 'textarea';
  title: string;
  options?: string[];
  required: boolean;
}

interface EnhancedJobPostingFormProps {
  onJobCreated: () => void;
}

const EnhancedJobPostingForm = ({ onJobCreated }: EnhancedJobPostingFormProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  
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
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [newRequirement, setNewRequirement] = useState('');

  const categories = [
    { value: 'pools', label: 'Pools', color: 'bg-blue-500' },
    { value: 'outdoors', label: 'Outdoors', color: 'bg-green-500' },
    { value: 'patios', label: 'Patios', color: 'bg-orange-500' },
    { value: 'improvements', label: 'Improvements', color: 'bg-purple-500' },
    { value: 'construction', label: 'Construction', color: 'bg-red-500' }
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
      toast.success('Job posted successfully!');
    } catch (error) {
      console.error('Error creating job:', error);
      toast.error('Failed to create job posting');
    } finally {
      setLoading(false);
    }
  };

  const progressSteps = [
    { id: 'details', label: 'Job Details', completed: formData.title && formData.category },
    { id: 'requirements', label: 'Requirements', completed: true },
    { id: 'attachments', label: 'Attachments', completed: true },
    { id: 'preview', label: 'Preview', completed: false }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      {/* Left Side - Form */}
      <div className="space-y-6">
        {/* Progress Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-teal bg-clip-text text-transparent">
            Create Job Posting
          </h2>
          <div className="flex items-center gap-2">
            {progressSteps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 ${
                    activeTab === step.id 
                      ? 'bg-primary text-white scale-110' 
                      : step.completed 
                      ? 'bg-green-500 text-white' 
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {index + 1}
                </div>
                {index < progressSteps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-1 ${step.completed ? 'bg-green-500' : 'bg-muted'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 glass-card">
            <TabsTrigger value="details" className="flex items-center gap-1 text-xs">
              <Settings className="h-3 w-3" />
              Details
            </TabsTrigger>
            <TabsTrigger value="requirements" className="flex items-center gap-1 text-xs">
              Requirements
            </TabsTrigger>
            <TabsTrigger value="attachments" className="flex items-center gap-1 text-xs">
              <Upload className="h-3 w-3" />
              Files
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-1 text-xs">
              <Eye className="h-3 w-3" />
              Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <Card className="glass-card procurement-slide-up">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="h-5 w-5" />
                  Project Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Job Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="e.g., Luxury Pool Installation"
                      className="procurement-shimmer"
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
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${category.color}`} />
                              {category.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Project Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe your project in detail..."
                    rows={4}
                    className="resize-none"
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
          </TabsContent>

          <TabsContent value="requirements">
            <div className="space-y-6">
              <Card className="glass-card procurement-slide-up">
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
                    <Button onClick={addRequirement} variant="outline" className="procurement-pulse">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {requirements.length > 0 && (
                    <div className="space-y-2">
                      {requirements.map((requirement) => (
                        <div key={requirement.id} className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                          <Badge variant={requirement.mandatory ? "default" : "secondary"}>
                            {requirement.mandatory ? 'Required' : 'Optional'}
                          </Badge>
                          <span className="flex-1">{requirement.text}</span>
                          <Button
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

              <FormBuilder 
                onSave={(fields) => setCustomFields(fields)}
                initialFields={customFields}
              />
            </div>
          </TabsContent>

          <TabsContent value="attachments">
            <Card className="glass-card procurement-slide-up">
              <CardHeader>
                <CardTitle>Media & Documents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border-2 border-dashed border-border/30 rounded-xl p-8 text-center procurement-float">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Upload Files</h3>
                  <p className="text-muted-foreground mb-4">
                    Drag and drop images, videos, or documents
                  </p>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="hidden"
                    id="file-upload"
                    accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => document.getElementById('file-upload')?.click()}
                    className="glass-button"
                  >
                    Choose Files
                  </Button>
                </div>

                {attachments.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {attachments.map((attachment) => (
                      <div key={attachment.id} className="relative group">
                        <Card className="border-border/30 overflow-hidden">
                          <CardContent className="p-3">
                            {attachment.preview ? (
                              <img
                                src={attachment.preview}
                                alt="Preview"
                                className="w-full h-32 object-cover rounded-lg mb-2"
                              />
                            ) : (
                              <div className="w-full h-32 bg-muted rounded-lg flex items-center justify-center mb-2">
                                <Upload className="h-8 w-8 text-muted-foreground" />
                              </div>
                            )}
                            <p className="text-sm font-medium truncate">{attachment.file.name}</p>
                            <Badge variant="outline" className="text-xs">
                              {attachment.type}
                            </Badge>
                          </CardContent>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeAttachment(attachment.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Card>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview">
            <LivePreview 
              formData={formData}
              requirements={requirements}
              attachments={attachments}
              customFields={customFields}
            />
          </TabsContent>
        </Tabs>

        {/* Submit Button */}
        <div className="flex justify-between items-center">
          <Button 
            variant="outline" 
            onClick={() => {
              const currentIndex = progressSteps.findIndex(step => step.id === activeTab);
              if (currentIndex > 0) {
                setActiveTab(progressSteps[currentIndex - 1].id);
              }
            }}
            disabled={activeTab === 'details'}
          >
            Previous
          </Button>
          
          <div className="flex gap-2">
            {activeTab !== 'preview' ? (
              <Button 
                onClick={() => {
                  const currentIndex = progressSteps.findIndex(step => step.id === activeTab);
                  if (currentIndex < progressSteps.length - 1) {
                    setActiveTab(progressSteps[currentIndex + 1].id);
                  }
                }}
                className="bg-gradient-to-r from-primary to-teal text-white"
              >
                Next
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit} 
                disabled={loading} 
                className="bg-gradient-to-r from-primary to-teal text-white procurement-pulse"
              >
                {loading ? 'Posting...' : 'Post Job'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Right Side - Live Preview (always visible) */}
      <div className="lg:sticky lg:top-6 lg:self-start">
        <LivePreview 
          formData={formData}
          requirements={requirements}
          attachments={attachments}
          customFields={customFields}
        />
      </div>
    </div>
  );
};

export default EnhancedJobPostingForm;