import React, { useState, useEffect } from 'react';
import { Mail, MessageSquare, Phone, PhoneCall, Plus, Edit, Trash2, Save, X, Eye, Send } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import MilanOfferCampaign from './MilanOfferCampaign';
import PatioArrivalsCampaign from './PatioArrivalsCampaign';
import SolarCampaign from './SolarCampaign';
import KitchenCampaign from './KitchenCampaign';
import DailyCampaignSchedule from './DailyCampaignSchedule';

interface MessageTemplate {
  id: string;
  name: string;
  channel: 'email' | 'sms' | 'whatsapp' | 'voice';
  subject: string | null;
  body: string;
  html_content: string | null;
  template_type: string;
  variables: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const channelIcons = {
  email: Mail,
  sms: MessageSquare,
  whatsapp: Phone,
  voice: PhoneCall
};

const channelColors = {
  email: 'bg-neutral-100 text-black border-neutral-200',
  sms: 'bg-green-500/20 text-black border-green-500/30',
  whatsapp: 'bg-emerald-500/20 text-black border-emerald-500/30',
  voice: 'bg-purple-500/20 text-black border-purple-500/30'
};

export default function AutomationTemplatesManager({ embedded = false }: { embedded?: boolean }) {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<MessageTemplate | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    channel: 'email' as 'email' | 'sms' | 'whatsapp' | 'voice',
    subject: '',
    body: '',
    html_content: '',
    template_type: 'general',
    is_active: true
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('message_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load templates');
      console.error(error);
    } else {
      setTemplates((data || []).map(t => ({
        ...t,
        variables: Array.isArray(t.variables) ? t.variables : []
      })) as MessageTemplate[]);
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.body) {
      toast.error('Name and body are required');
      return;
    }

    const templateData = {
      name: formData.name,
      channel: formData.channel,
      subject: formData.channel === 'email' ? formData.subject : null,
      body: formData.body,
      html_content: formData.channel === 'email' ? formData.html_content : null,
      template_type: formData.template_type,
      is_active: formData.is_active
    };

    let error;
    if (editingTemplate) {
      const result = await supabase
        .from('message_templates')
        .update(templateData)
        .eq('id', editingTemplate.id);
      error = result.error;
    } else {
      const result = await supabase
        .from('message_templates')
        .insert(templateData);
      error = result.error;
    }

    if (error) {
      toast.error('Failed to save template');
      console.error(error);
    } else {
      toast.success(editingTemplate ? 'Template updated' : 'Template created');
      setIsDialogOpen(false);
      resetForm();
      fetchTemplates();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    const { error } = await supabase
      .from('message_templates')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete template');
    } else {
      toast.success('Template deleted');
      fetchTemplates();
    }
  };

  const handleEdit = (template: MessageTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      channel: template.channel,
      subject: template.subject || '',
      body: template.body,
      html_content: template.html_content || '',
      template_type: template.template_type,
      is_active: template.is_active
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingTemplate(null);
    setFormData({
      name: '',
      channel: 'email',
      subject: '',
      body: '',
      html_content: '',
      template_type: 'general',
      is_active: true
    });
  };

  const toggleActive = async (template: MessageTemplate) => {
    const { error } = await supabase
      .from('message_templates')
      .update({ is_active: !template.is_active })
      .eq('id', template.id);

    if (error) {
      toast.error('Failed to update template');
    } else {
      fetchTemplates();
    }
  };

  return (
    <div className="space-y-6">
      {/* Command Center — full social posting hub on its own page */}
      {!embedded && <a
        href="/socialite"
        className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-4 hover:border-neutral-200 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Send className="h-5 w-5 text-black" />
          <div>
            <div className="font-semibold text-black">SOCIALITE</div>
            <div className="text-xs text-neutral-600">Social posting, email, SMS & calls — one command center</div>
          </div>
        </div>
        <span className="text-sm text-black">Open →</span>
      </a>}
      {/* Featured campaign — Milan Collection premium offer email */}
      <DailyCampaignSchedule />
      <KitchenCampaign />
      <SolarCampaign />
      <PatioArrivalsCampaign />
      <MilanOfferCampaign />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-black">Message Templates</h2>
          <p className="text-neutral-600 text-sm">Create and manage message templates for automations</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-cyan-600 hover:bg-cyan-700">
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-neutral-200">
            <DialogHeader>
              <DialogTitle className="text-black">
                {editingTemplate ? 'Edit Template' : 'Create New Template'}
              </DialogTitle>
              <DialogDescription className="text-neutral-600">
                Configure your message template with variables like {'{first_name}'}, {'{last_name}'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-black">Template Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Welcome Email"
                    className="bg-white border-neutral-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-black">Channel</Label>
                  <Select
                    value={formData.channel}
                    onValueChange={(value: any) => setFormData({ ...formData, channel: value })}
                  >
                    <SelectTrigger className="bg-white border-neutral-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="voice">Voice Call</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-black">Template Type</Label>
                  <Select
                    value={formData.template_type}
                    onValueChange={(value) => setFormData({ ...formData, template_type: value })}
                  >
                    <SelectTrigger className="bg-white border-neutral-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="welcome">Welcome</SelectItem>
                      <SelectItem value="follow_up">Follow Up</SelectItem>
                      <SelectItem value="check_in">Check In</SelectItem>
                      <SelectItem value="consultation">Consultation</SelectItem>
                      <SelectItem value="reminder">Reminder</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between pt-6">
                  <Label className="text-black">Active</Label>
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                </div>
              </div>

              {formData.channel === 'email' && (
                <div className="space-y-2">
                  <Label className="text-black">Subject Line</Label>
                  <Input
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g., Welcome to Gala Pools, {first_name}!"
                    className="bg-white border-neutral-200"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-black">Message Body</Label>
                <Textarea
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  placeholder="Hi {first_name}, thank you for..."
                  rows={6}
                  className="bg-white border-neutral-200"
                />
                <p className="text-xs text-neutral-600">
                  Available variables: {'{first_name}'}, {'{last_name}'}, {'{full_name}'}, {'{email}'}, {'{sales_rep_name}'}, {'{sales_rep_email}'}
                </p>
              </div>

              {formData.channel === 'email' && (
                <div className="space-y-2">
                  <Label className="text-black">HTML Content (optional)</Label>
                  <Textarea
                    value={formData.html_content}
                    onChange={(e) => setFormData({ ...formData, html_content: e.target.value })}
                    placeholder="<div>...</div>"
                    rows={6}
                    className="bg-white border-neutral-200  text-xs"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} className="bg-cyan-600 hover:bg-cyan-700">
                  <Save className="h-4 w-4 mr-2" />
                  {editingTemplate ? 'Update' : 'Create'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-neutral-600">Loading templates...</div>
      ) : templates.length === 0 ? (
        <Card className="bg-white border-neutral-200">
          <CardContent className="py-12 text-center">
            <Mail className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
            <p className="text-neutral-600">No templates yet. Create your first template to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {templates.map((template) => {
            const Icon = channelIcons[template.channel];
            return (
              <Card key={template.id} className="bg-white border-neutral-200 hover:border-neutral-200 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg border ${channelColors[template.channel]}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-black">{template.name}</h3>
                          <Badge variant="outline" className={template.is_active ? 'text-black border-green-500/30' : 'text-black border-gray-500/30'}>
                            {template.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge variant="outline" className="text-neutral-600 border-neutral-200">
                            {template.template_type}
                          </Badge>
                        </div>
                        {template.subject && (
                          <p className="text-sm text-black">Subject: {template.subject}</p>
                        )}
                        <p className="text-sm text-neutral-600 line-clamp-2">{template.body}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setPreviewTemplate(template)}
                        className="hover:bg-neutral-100"
                      >
                        <Eye className="h-4 w-4 text-black" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(template)}
                        className="hover:bg-neutral-100"
                      >
                        <Edit className="h-4 w-4 text-black" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(template.id)}
                        className="hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4 text-black" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-2xl bg-white border-neutral-200">
          <DialogHeader>
            <DialogTitle className="text-black">Preview: {previewTemplate?.name}</DialogTitle>
          </DialogHeader>
          {previewTemplate && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={channelColors[previewTemplate.channel]}>
                  {previewTemplate.channel.toUpperCase()}
                </Badge>
                <Badge variant="outline" className="text-neutral-600">
                  {previewTemplate.template_type}
                </Badge>
              </div>
              {previewTemplate.subject && (
                <div>
                  <Label className="text-neutral-600 text-xs">Subject</Label>
                  <p className="text-black">{previewTemplate.subject.replace(/{first_name}/g, 'John')}</p>
                </div>
              )}
              <div>
                <Label className="text-neutral-600 text-xs">Message</Label>
                <div className="bg-white p-4 rounded-lg border border-neutral-200 whitespace-pre-wrap text-black">
                  {previewTemplate.body
                    .replace(/{first_name}/g, 'John')
                    .replace(/{last_name}/g, 'Doe')
                    .replace(/{full_name}/g, 'John Doe')
                    .replace(/{email}/g, 'john@example.com')
                    .replace(/{sales_rep_name}/g, 'Sarah Johnson')
                    .replace(/{sales_rep_email}/g, 'sarah@wonderlandsworld.com')}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
