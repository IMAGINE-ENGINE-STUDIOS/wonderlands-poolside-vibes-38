import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MapPin, Calendar, DollarSign, Clock, Users, FileText, Image, Video } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface LivePreviewProps {
  formData: {
    title: string;
    description: string;
    category: string;
    budget_min: string;
    budget_max: string;
    deadline: string;
    location: string;
  };
  requirements: Array<{
    id: string;
    text: string;
    mandatory: boolean;
  }>;
  attachments: Array<{
    id: string;
    file: File;
    type: 'image' | 'video' | 'document';
    preview?: string;
  }>;
  customFields: Array<{
    id: string;
    type: 'text' | 'select' | 'checkbox' | 'textarea';
    title: string;
    options?: string[];
    required: boolean;
  }>;
}

const LivePreview = ({ formData, requirements, attachments, customFields }: LivePreviewProps) => {
  const { profile } = useAuth();

  const getCategoryColor = (category: string) => {
    const colors = {
      pools: 'bg-blue-500/10 text-blue-700 border-blue-200',
      outdoors: 'bg-green-500/10 text-green-700 border-green-200',
      patios: 'bg-orange-500/10 text-orange-700 border-orange-200',
      improvements: 'bg-purple-500/10 text-purple-700 border-purple-200',
      construction: 'bg-red-500/10 text-red-700 border-red-200'
    };
    return colors[category as keyof typeof colors] || 'bg-muted text-muted-foreground';
  };

  const formatBudget = () => {
    if (formData.budget_min && formData.budget_max) {
      return `$${parseInt(formData.budget_min).toLocaleString()} - $${parseInt(formData.budget_max).toLocaleString()}`;
    }
    if (formData.budget_min) return `$${parseInt(formData.budget_min).toLocaleString()}+`;
    if (formData.budget_max) return `Up to $${parseInt(formData.budget_max).toLocaleString()}`;
    return 'Budget TBD';
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-muted-foreground mb-2">Live Preview</h3>
        <div className="w-12 h-0.5 bg-gradient-to-r from-primary to-teal mx-auto"></div>
      </div>

      <Card className="glass-card procurement-slide-up border-border/50 shadow-xl">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            <Avatar className="h-12 w-12 procurement-pulse">
              <AvatarFallback className="bg-gradient-to-br from-primary to-teal text-white font-semibold">
                {profile?.first_name?.[0] || profile?.company_name?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h4 className="font-semibold text-foreground">
                  {profile?.company_name || `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'Your Company'}
                </h4>
                <Badge variant="outline" className={getCategoryColor(formData.category)}>
                  {formData.category || 'Category'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Just now
              </p>
            </div>
          </div>

          {/* Job Title & Description */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-foreground mb-3 min-h-[1.5rem]">
              {formData.title || 'Your Job Title Here'}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed min-h-[3rem]">
              {formData.description || 'Add a detailed description of your project requirements, timeline, and expectations...'}
            </p>
          </div>

          {/* Project Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">{formData.location || 'Location TBD'}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground font-medium">{formatBudget()}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">
                {formData.deadline ? new Date(formData.deadline).toLocaleDateString() : 'Deadline TBD'}
              </span>
            </div>
          </div>

          {/* Attachments Preview */}
          {attachments.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Attachments ({attachments.length})
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {attachments.map((attachment) => (
                  <div key={attachment.id} className="relative group">
                    {attachment.type === 'image' && attachment.preview ? (
                      <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                        <img 
                          src={attachment.preview} 
                          alt="Preview" 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                    ) : (
                      <div className="aspect-square rounded-lg bg-muted flex items-center justify-center">
                        {attachment.type === 'video' ? (
                          <Video className="h-8 w-8 text-muted-foreground" />
                        ) : (
                          <FileText className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Requirements */}
          {requirements.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-foreground mb-3">Requirements & Checklist</h4>
              <div className="space-y-2">
                {requirements.map((req) => (
                  <div key={req.id} className="flex items-center gap-2 text-sm">
                    <div className={`w-2 h-2 rounded-full ${req.mandatory ? 'bg-red-500' : 'bg-blue-500'}`} />
                    <span className="text-foreground">{req.text}</span>
                    <Badge variant="secondary" className="text-xs">
                      {req.mandatory ? 'Required' : 'Optional'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Custom Fields */}
          {customFields.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-foreground mb-3">Additional Information Required</h4>
              <div className="space-y-3">
                {customFields.map((field) => (
                  <div key={field.id} className="border border-border/30 rounded-lg p-3 bg-muted/30">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{field.title || 'Custom Field'}</span>
                      {field.required && <span className="text-red-500 text-xs">*</span>}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {field.type === 'text' && 'Text input field'}
                      {field.type === 'textarea' && 'Long text area'}
                      {field.type === 'select' && `Options: ${field.options?.join(', ') || 'None'}`}
                      {field.type === 'checkbox' && 'Checkbox field'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-border/30">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                0 proposals
              </span>
            </div>
            
            <div className="flex gap-2">
              <button className="px-4 py-2 text-sm bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors">
                View Details
              </button>
              <button className="px-4 py-2 text-sm bg-gradient-to-r from-primary to-teal text-white rounded-lg hover:scale-105 transition-transform">
                Submit Proposal
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LivePreview;