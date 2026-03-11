import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, DollarSign, Calendar, FileText } from 'lucide-react';

interface ProcurementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectName: string;
  phaseItemId?: string;
  itemName?: string;
  onCreated: () => void;
}

const ProcurementDialog: React.FC<ProcurementDialogProps> = ({
  open, onOpenChange, projectId, projectName, phaseItemId, itemName, onCreated
}) => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: itemName || projectName,
    description: '',
    location: '',
    budget_min: '',
    budget_max: '',
    start_date: '',
    deadline: '',
  });

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.location.trim()) {
      toast({ title: 'Missing fields', description: 'Title and location are required.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.from('procurement_listings').insert({
        project_id: projectId,
        phase_item_id: phaseItemId || null,
        title: form.title.trim(),
        description: form.description.trim() || null,
        location: form.location.trim(),
        budget_min: form.budget_min ? parseFloat(form.budget_min) : null,
        budget_max: form.budget_max ? parseFloat(form.budget_max) : null,
        deadline: form.deadline || null,
        status: 'open',
      } as any);
      if (error) throw error;
      toast({ title: 'Listing Created', description: 'Procurement listing is now open for contractor bids.' });
      onCreated();
      onOpenChange(false);
      setForm({ title: '', description: '', location: '', budget_min: '', budget_max: '', deadline: '' });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-[#0d0d15] border-cyan-500/30">
        <DialogHeader>
          <DialogTitle className="text-cyan-300 font-mono flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {phaseItemId ? 'Procure Task' : 'Procure Entire Project'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-[10px] font-mono text-cyan-400/50 uppercase tracking-wider">Title</Label>
            <Input
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="h-8 text-xs bg-cyan-500/5 border-cyan-500/20 text-cyan-300 font-mono"
            />
          </div>
          <div>
            <Label className="text-[10px] font-mono text-cyan-400/50 uppercase tracking-wider flex items-center gap-1">
              <MapPin className="h-3 w-3" /> Jobsite Location
            </Label>
            <Input
              placeholder="123 Main St, City, FL 33101"
              value={form.location}
              onChange={e => setForm({ ...form, location: e.target.value })}
              className="h-8 text-xs bg-cyan-500/5 border-cyan-500/20 text-cyan-300 font-mono placeholder:text-cyan-500/30"
            />
          </div>
          <div>
            <Label className="text-[10px] font-mono text-cyan-400/50 uppercase tracking-wider">Description</Label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full rounded-md text-xs bg-cyan-500/5 border border-cyan-500/20 text-cyan-300 font-mono p-2 placeholder:text-cyan-500/30"
              placeholder="Describe the scope of work..."
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[10px] font-mono text-cyan-400/50 uppercase tracking-wider flex items-center gap-1">
                <DollarSign className="h-3 w-3" /> Budget Min
              </Label>
              <Input
                type="number"
                placeholder="0.00"
                value={form.budget_min}
                onChange={e => setForm({ ...form, budget_min: e.target.value })}
                className="h-8 text-xs bg-cyan-500/5 border-cyan-500/20 text-cyan-300 font-mono"
              />
            </div>
            <div>
              <Label className="text-[10px] font-mono text-cyan-400/50 uppercase tracking-wider flex items-center gap-1">
                <DollarSign className="h-3 w-3" /> Budget Max
              </Label>
              <Input
                type="number"
                placeholder="0.00"
                value={form.budget_max}
                onChange={e => setForm({ ...form, budget_max: e.target.value })}
                className="h-8 text-xs bg-cyan-500/5 border-cyan-500/20 text-cyan-300 font-mono"
              />
            </div>
          </div>
          <div>
            <Label className="text-[10px] font-mono text-cyan-400/50 uppercase tracking-wider flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Deadline
            </Label>
            <Input
              type="date"
              value={form.deadline}
              onChange={e => setForm({ ...form, deadline: e.target.value })}
              className="h-8 text-xs bg-cyan-500/5 border-cyan-500/20 text-cyan-300 font-mono"
            />
          </div>
          <Button
            onClick={handleSubmit}
            disabled={saving}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-xs font-mono"
          >
            {saving ? 'Creating...' : 'Create Procurement Listing'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProcurementDialog;
