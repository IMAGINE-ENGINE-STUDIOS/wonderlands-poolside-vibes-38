import React, { useState, useEffect } from 'react';
import { Play, Pause, Settings, Plus, Edit, Trash2, Clock, Mail, MessageSquare, Phone, PhoneCall, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AutomationSequence {
  id: string;
  name: string;
  description: string | null;
  trigger_event: string;
  is_active: boolean;
  created_at: string;
}

interface AutomationStep {
  id: string;
  sequence_id: string;
  step_order: number;
  channels: string[];
  template_id: string | null;
  delay_hours: number;
  is_active: boolean;
  template?: {
    id: string;
    name: string;
    channel: string;
  };
}

interface MessageTemplate {
  id: string;
  name: string;
  channel: string;
}

const channelIcons: Record<string, React.ElementType> = {
  email: Mail,
  sms: MessageSquare,
  whatsapp: Phone,
  voice: PhoneCall
};

const channelColors: Record<string, string> = {
  email: 'bg-blue-500/20 text-blue-400',
  sms: 'bg-green-500/20 text-green-400',
  whatsapp: 'bg-emerald-500/20 text-emerald-400',
  voice: 'bg-purple-500/20 text-purple-400'
};

export default function AutomationSequencesManager() {
  const [sequences, setSequences] = useState<AutomationSequence[]>([]);
  const [steps, setSteps] = useState<Record<string, AutomationStep[]>>({});
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSequence, setExpandedSequence] = useState<string | null>(null);
  const [isSequenceDialogOpen, setIsSequenceDialogOpen] = useState(false);
  const [isStepDialogOpen, setIsStepDialogOpen] = useState(false);
  const [editingSequence, setEditingSequence] = useState<AutomationSequence | null>(null);
  const [editingStep, setEditingStep] = useState<AutomationStep | null>(null);
  const [currentSequenceId, setCurrentSequenceId] = useState<string | null>(null);

  const [sequenceForm, setSequenceForm] = useState({
    name: '',
    description: '',
    trigger_event: 'new_client',
    is_active: true
  });

  const [stepForm, setStepForm] = useState({
    step_order: 1,
    channels: ['email'] as ('email' | 'sms' | 'whatsapp' | 'voice')[],
    template_id: '',
    delay_hours: 0,
    is_active: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    
    // Fetch sequences
    const { data: seqData, error: seqError } = await supabase
      .from('automation_sequences')
      .select('*')
      .order('created_at', { ascending: false });

    if (seqError) {
      toast.error('Failed to load sequences');
      console.error(seqError);
    } else {
      setSequences(seqData || []);
      
      // Fetch steps for each sequence
      for (const seq of seqData || []) {
        fetchSteps(seq.id);
      }
    }

    // Fetch templates
    const { data: templateData } = await supabase
      .from('message_templates')
      .select('id, name, channel')
      .eq('is_active', true);
    
    setTemplates(templateData || []);
    setIsLoading(false);
  };

  const fetchSteps = async (sequenceId: string) => {
    const { data, error } = await supabase
      .from('automation_steps')
      .select(`
        *,
        template:message_templates(id, name, channel)
      `)
      .eq('sequence_id', sequenceId)
      .order('step_order', { ascending: true });

    if (!error && data) {
      setSteps(prev => ({ ...prev, [sequenceId]: data }));
    }
  };

  const handleSaveSequence = async () => {
    if (!sequenceForm.name) {
      toast.error('Name is required');
      return;
    }

    let error;
    if (editingSequence) {
      const result = await supabase
        .from('automation_sequences')
        .update(sequenceForm)
        .eq('id', editingSequence.id);
      error = result.error;
    } else {
      const result = await supabase
        .from('automation_sequences')
        .insert(sequenceForm);
      error = result.error;
    }

    if (error) {
      toast.error('Failed to save sequence');
    } else {
      toast.success(editingSequence ? 'Sequence updated' : 'Sequence created');
      setIsSequenceDialogOpen(false);
      resetSequenceForm();
      fetchData();
    }
  };

  const handleSaveStep = async () => {
    if (!currentSequenceId || !stepForm.template_id) {
      toast.error('Template is required');
      return;
    }

    const stepData = {
      sequence_id: currentSequenceId,
      step_order: stepForm.step_order,
      channels: stepForm.channels,
      template_id: stepForm.template_id,
      delay_hours: stepForm.delay_hours,
      is_active: stepForm.is_active
    };

    let error;
    if (editingStep) {
      const result = await supabase
        .from('automation_steps')
        .update(stepData)
        .eq('id', editingStep.id);
      error = result.error;
    } else {
      const result = await supabase
        .from('automation_steps')
        .insert(stepData);
      error = result.error;
    }

    if (error) {
      toast.error('Failed to save step');
      console.error(error);
    } else {
      toast.success(editingStep ? 'Step updated' : 'Step created');
      setIsStepDialogOpen(false);
      resetStepForm();
      fetchSteps(currentSequenceId);
    }
  };

  const handleDeleteSequence = async (id: string) => {
    if (!confirm('Delete this sequence and all its steps?')) return;

    const { error } = await supabase
      .from('automation_sequences')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete sequence');
    } else {
      toast.success('Sequence deleted');
      fetchData();
    }
  };

  const handleDeleteStep = async (stepId: string, sequenceId: string) => {
    if (!confirm('Delete this step?')) return;

    const { error } = await supabase
      .from('automation_steps')
      .delete()
      .eq('id', stepId);

    if (error) {
      toast.error('Failed to delete step');
    } else {
      toast.success('Step deleted');
      fetchSteps(sequenceId);
    }
  };

  const toggleSequenceActive = async (sequence: AutomationSequence) => {
    const { error } = await supabase
      .from('automation_sequences')
      .update({ is_active: !sequence.is_active })
      .eq('id', sequence.id);

    if (!error) {
      fetchData();
    }
  };

  const resetSequenceForm = () => {
    setEditingSequence(null);
    setSequenceForm({
      name: '',
      description: '',
      trigger_event: 'new_client',
      is_active: true
    });
  };

  const resetStepForm = () => {
    setEditingStep(null);
    setStepForm({
      step_order: 1,
      channels: ['email'],
      template_id: '',
      delay_hours: 0,
      is_active: true
    });
  };

  const formatDelay = (hours: number) => {
    if (hours === 0) return 'Immediate';
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''}`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-cyan-300">Automation Sequences</h2>
          <p className="text-cyan-400/60 text-sm">Configure automated outreach workflows</p>
        </div>
        <Dialog open={isSequenceDialogOpen} onOpenChange={(open) => {
          setIsSequenceDialogOpen(open);
          if (!open) resetSequenceForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-cyan-600 hover:bg-cyan-700">
              <Plus className="h-4 w-4 mr-2" />
              New Sequence
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-cyan-500/30">
            <DialogHeader>
              <DialogTitle className="text-cyan-300">
                {editingSequence ? 'Edit Sequence' : 'Create New Sequence'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="text-cyan-300">Sequence Name</Label>
                <Input
                  value={sequenceForm.name}
                  onChange={(e) => setSequenceForm({ ...sequenceForm, name: e.target.value })}
                  placeholder="e.g., Welcome Sequence"
                  className="bg-gray-800 border-cyan-500/30"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-cyan-300">Description</Label>
                <Textarea
                  value={sequenceForm.description}
                  onChange={(e) => setSequenceForm({ ...sequenceForm, description: e.target.value })}
                  placeholder="Describe this automation sequence..."
                  className="bg-gray-800 border-cyan-500/30"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-cyan-300">Trigger Event</Label>
                <Select
                  value={sequenceForm.trigger_event}
                  onValueChange={(value) => setSequenceForm({ ...sequenceForm, trigger_event: value })}
                >
                  <SelectTrigger className="bg-gray-800 border-cyan-500/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new_client">New Client Added</SelectItem>
                    <SelectItem value="status_change">Status Change</SelectItem>
                    <SelectItem value="manual">Manual Trigger</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-cyan-300">Active</Label>
                <Switch
                  checked={sequenceForm.is_active}
                  onCheckedChange={(checked) => setSequenceForm({ ...sequenceForm, is_active: checked })}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsSequenceDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveSequence} className="bg-cyan-600 hover:bg-cyan-700">
                  {editingSequence ? 'Update' : 'Create'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-cyan-400/60">Loading sequences...</div>
      ) : sequences.length === 0 ? (
        <Card className="bg-gray-900/50 border-cyan-500/20">
          <CardContent className="py-12 text-center">
            <Settings className="h-12 w-12 text-cyan-400/40 mx-auto mb-4" />
            <p className="text-cyan-400/60">No sequences yet. Create your first automation sequence.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sequences.map((sequence) => (
            <Collapsible
              key={sequence.id}
              open={expandedSequence === sequence.id}
              onOpenChange={(open) => setExpandedSequence(open ? sequence.id : null)}
            >
              <Card className="bg-gray-900/50 border-cyan-500/20">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="icon" className="hover:bg-cyan-500/10">
                          {expandedSequence === sequence.id ? (
                            <ChevronUp className="h-4 w-4 text-cyan-400" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-cyan-400" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                      <div>
                        <CardTitle className="text-cyan-300 flex items-center gap-2">
                          {sequence.name}
                          <Badge variant="outline" className={sequence.is_active ? 'text-green-400 border-green-500/30' : 'text-gray-400 border-gray-500/30'}>
                            {sequence.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </CardTitle>
                        <CardDescription className="text-cyan-400/60">
                          Trigger: {sequence.trigger_event.replace('_', ' ')} • {steps[sequence.id]?.length || 0} steps
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleSequenceActive(sequence)}
                        className="hover:bg-cyan-500/10"
                      >
                        {sequence.is_active ? (
                          <Pause className="h-4 w-4 text-yellow-400" />
                        ) : (
                          <Play className="h-4 w-4 text-green-400" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingSequence(sequence);
                          setSequenceForm({
                            name: sequence.name,
                            description: sequence.description || '',
                            trigger_event: sequence.trigger_event,
                            is_active: sequence.is_active
                          });
                          setIsSequenceDialogOpen(true);
                        }}
                        className="hover:bg-cyan-500/10"
                      >
                        <Edit className="h-4 w-4 text-cyan-400" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteSequence(sequence.id)}
                        className="hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CollapsibleContent>
                  <CardContent className="pt-4">
                    {sequence.description && (
                      <p className="text-sm text-cyan-400/80 mb-4">{sequence.description}</p>
                    )}

                    {/* Steps Timeline */}
                    <div className="space-y-3">
                      {(steps[sequence.id] || []).map((step, index) => {
                        const Icon = channelIcons[step.channels[0]] || Mail;
                        return (
                          <div key={step.id} className="flex items-center gap-4">
                            <div className="flex flex-col items-center">
                              <div className={`p-2 rounded-full ${channelColors[step.channels[0]] || 'bg-gray-500/20 text-gray-400'}`}>
                                <Icon className="h-4 w-4" />
                              </div>
                              {index < (steps[sequence.id]?.length || 0) - 1 && (
                                <div className="w-px h-8 bg-cyan-500/20 my-1" />
                              )}
                            </div>
                            <div className="flex-1 bg-gray-800/50 rounded-lg p-3 border border-cyan-500/10">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-cyan-300">
                                    Step {step.step_order}: {step.template?.name || 'No template'}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Clock className="h-3 w-3 text-cyan-400/60" />
                                    <span className="text-xs text-cyan-400/60">{formatDelay(step.delay_hours)}</span>
                                    {step.channels.map(ch => (
                                      <Badge key={ch} variant="outline" className="text-xs">
                                        {ch}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 hover:bg-cyan-500/10"
                                    onClick={() => {
                                      setCurrentSequenceId(sequence.id);
                                      setEditingStep(step);
                                      setStepForm({
                                        step_order: step.step_order,
                                        channels: step.channels as ('email' | 'sms' | 'whatsapp' | 'voice')[],
                                        template_id: step.template_id || '',
                                        delay_hours: step.delay_hours,
                                        is_active: step.is_active
                                      });
                                      setIsStepDialogOpen(true);
                                    }}
                                  >
                                    <Edit className="h-3 w-3 text-cyan-400" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 hover:bg-red-500/10"
                                    onClick={() => handleDeleteStep(step.id, sequence.id)}
                                  >
                                    <Trash2 className="h-3 w-3 text-red-400" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-12 border-dashed border-cyan-500/30 text-cyan-400"
                        onClick={() => {
                          setCurrentSequenceId(sequence.id);
                          setStepForm({
                            ...stepForm,
                            step_order: (steps[sequence.id]?.length || 0) + 1
                          });
                          setIsStepDialogOpen(true);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Step
                      </Button>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))}
        </div>
      )}

      {/* Step Dialog */}
      <Dialog open={isStepDialogOpen} onOpenChange={(open) => {
        setIsStepDialogOpen(open);
        if (!open) resetStepForm();
      }}>
        <DialogContent className="bg-gray-900 border-cyan-500/30">
          <DialogHeader>
            <DialogTitle className="text-cyan-300">
              {editingStep ? 'Edit Step' : 'Add Step'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-cyan-300">Step Order</Label>
                <Input
                  type="number"
                  min={1}
                  value={stepForm.step_order}
                  onChange={(e) => setStepForm({ ...stepForm, step_order: parseInt(e.target.value) })}
                  className="bg-gray-800 border-cyan-500/30"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-cyan-300">Delay (hours)</Label>
                <Input
                  type="number"
                  min={0}
                  value={stepForm.delay_hours}
                  onChange={(e) => setStepForm({ ...stepForm, delay_hours: parseInt(e.target.value) })}
                  className="bg-gray-800 border-cyan-500/30"
                />
                <p className="text-xs text-cyan-400/40">0 = immediate</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-cyan-300">Channel</Label>
              <Select
                value={stepForm.channels[0]}
                onValueChange={(value: 'email' | 'sms' | 'whatsapp' | 'voice') => setStepForm({ ...stepForm, channels: [value] })}
              >
                <SelectTrigger className="bg-gray-800 border-cyan-500/30">
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

            <div className="space-y-2">
              <Label className="text-cyan-300">Template</Label>
              <Select
                value={stepForm.template_id}
                onValueChange={(value) => setStepForm({ ...stepForm, template_id: value })}
              >
                <SelectTrigger className="bg-gray-800 border-cyan-500/30">
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {templates
                    .filter(t => t.channel === stepForm.channels[0])
                    .map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-cyan-300">Active</Label>
              <Switch
                checked={stepForm.is_active}
                onCheckedChange={(checked) => setStepForm({ ...stepForm, is_active: checked })}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsStepDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveStep} className="bg-cyan-600 hover:bg-cyan-700">
                {editingStep ? 'Update' : 'Add Step'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
