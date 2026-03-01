import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Save, DollarSign } from 'lucide-react';

interface CostItem {
  id: string;
  project_id: string;
  phase_id: string | null;
  contractor_id: string | null;
  description: string;
  category: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  status: string;
  notes: string | null;
}

interface ProjectCostPanelProps {
  projectId: string;
  phases: { id: string; phase_name: string }[];
}

const CATEGORIES = ['general', 'labor', 'materials', 'equipment', 'permits', 'subcontractor', 'other'];
const STATUSES = ['quoted', 'approved', 'invoiced', 'paid'];

const ProjectCostPanel: React.FC<ProjectCostPanelProps> = ({ projectId, phases }) => {
  const [costItems, setCostItems] = useState<CostItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<CostItem>>({});
  const [newCost, setNewCost] = useState({ description: '', category: 'general', quantity: '1', unit_price: '0', phase_id: '', notes: '' });
  const { toast } = useToast();

  const fetchCosts = useCallback(async () => {
    const { data } = await supabase.from('project_cost_items').select('*').eq('project_id', projectId).order('created_at');
    setCostItems((data as CostItem[]) || []);
  }, [projectId]);

  useEffect(() => { fetchCosts(); }, [fetchCosts]);

  const addItem = async () => {
    if (!newCost.description.trim()) return;
    const { error } = await supabase.from('project_cost_items').insert({
      project_id: projectId,
      description: newCost.description,
      category: newCost.category,
      quantity: parseFloat(newCost.quantity) || 1,
      unit_price: parseFloat(newCost.unit_price) || 0,
      phase_id: newCost.phase_id || null,
      notes: newCost.notes || null,
    });
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    setNewCost({ description: '', category: 'general', quantity: '1', unit_price: '0', phase_id: '', notes: '' });
    await fetchCosts();
  };

  const saveItem = async (id: string) => {
    await supabase.from('project_cost_items').update({
      description: editData.description,
      category: editData.category,
      quantity: editData.quantity,
      unit_price: editData.unit_price,
      notes: editData.notes,
      status: editData.status,
    }).eq('id', id);
    setEditingId(null);
    toast({ title: 'Saved' });
    await fetchCosts();
  };

  const deleteItem = async (id: string) => {
    await supabase.from('project_cost_items').delete().eq('id', id);
    await fetchCosts();
  };

  const totalCost = costItems.reduce((s, c) => s + c.quantity * c.unit_price, 0);

  return (
    <div className="holographic-panel rounded-lg border border-cyan-500/20 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-cyan-400" />
          <h3 className="text-xs font-mono text-cyan-300 uppercase tracking-wider font-bold">Cost Tracking</h3>
        </div>
        <span className="text-sm font-mono font-bold text-cyan-300">${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
      </div>

      <div className="space-y-1.5 mb-3 max-h-[300px] overflow-y-auto">
        {costItems.map((ci) => (
          <div key={ci.id} className="rounded border border-cyan-500/10 p-2 text-xs font-mono">
            {editingId === ci.id ? (
              <div className="space-y-1.5">
                <Input value={editData.description || ''} onChange={(e) => setEditData({ ...editData, description: e.target.value })} className="h-6 text-xs bg-transparent border-cyan-500/20 text-cyan-300 font-mono" />
                <div className="grid grid-cols-2 gap-1.5">
                  <Input type="number" value={editData.quantity ?? ''} onChange={(e) => setEditData({ ...editData, quantity: parseFloat(e.target.value) })} className="h-6 text-xs bg-transparent border-cyan-500/20 text-cyan-300 font-mono" />
                  <Input type="number" value={editData.unit_price ?? ''} onChange={(e) => setEditData({ ...editData, unit_price: parseFloat(e.target.value) })} className="h-6 text-xs bg-transparent border-cyan-500/20 text-cyan-300 font-mono" />
                </div>
                <select value={editData.status || 'quoted'} onChange={(e) => setEditData({ ...editData, status: e.target.value })} className="w-full h-6 text-xs bg-transparent border border-cyan-500/20 text-cyan-300 rounded px-1 font-mono">
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <div className="flex gap-1">
                  <Button size="sm" onClick={() => saveItem(ci.id)} className="h-6 text-[10px] font-mono flex-1"><Save className="h-3 w-3 mr-1" />Save</Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="h-6 text-[10px] text-cyan-400/60 font-mono">Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="cursor-pointer" onClick={() => { setEditingId(ci.id); setEditData(ci); }}>
                <div className="flex justify-between">
                  <div>
                    <p className="text-cyan-300">{ci.description}</p>
                    <p className="text-cyan-400/40 mt-0.5">{ci.category} • {ci.quantity} × ${ci.unit_price}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-cyan-300 font-bold">${(ci.quantity * ci.unit_price).toFixed(2)}</span>
                    <button onClick={(e) => { e.stopPropagation(); deleteItem(ci.id); }} className="text-red-400/40 hover:text-red-400 ml-1"><Trash2 className="h-3 w-3" /></button>
                  </div>
                </div>
                <span className={`text-[10px] px-1 py-0.5 rounded mt-1 inline-block ${
                  ci.status === 'paid' ? 'bg-green-500/10 text-green-400' :
                  ci.status === 'approved' ? 'bg-blue-500/10 text-blue-400' :
                  ci.status === 'invoiced' ? 'bg-amber-500/10 text-amber-400' :
                  'bg-cyan-500/5 text-cyan-400/50'
                }`}>{ci.status}</span>
              </div>
            )}
          </div>
        ))}
        {costItems.length === 0 && <p className="text-[10px] text-cyan-400/30 text-center py-3 font-mono">No cost items</p>}
      </div>

      <div className="border-t border-cyan-500/10 pt-3 space-y-1.5">
        <Input value={newCost.description} onChange={(e) => setNewCost({ ...newCost, description: e.target.value })} className="h-6 text-xs bg-transparent border-cyan-500/20 text-cyan-300 placeholder:text-cyan-500/30 font-mono" placeholder="Description" />
        <div className="grid grid-cols-2 gap-1.5">
          <Input type="number" value={newCost.quantity} onChange={(e) => setNewCost({ ...newCost, quantity: e.target.value })} className="h-6 text-xs bg-transparent border-cyan-500/20 text-cyan-300 font-mono" placeholder="Qty" />
          <Input type="number" value={newCost.unit_price} onChange={(e) => setNewCost({ ...newCost, unit_price: e.target.value })} className="h-6 text-xs bg-transparent border-cyan-500/20 text-cyan-300 font-mono" placeholder="Price" />
        </div>
        <select value={newCost.category} onChange={(e) => setNewCost({ ...newCost, category: e.target.value })} className="w-full h-6 text-xs bg-transparent border border-cyan-500/20 text-cyan-300 rounded px-1 font-mono">
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={newCost.phase_id} onChange={(e) => setNewCost({ ...newCost, phase_id: e.target.value })} className="w-full h-6 text-xs bg-transparent border border-cyan-500/20 text-cyan-300 rounded px-1 font-mono">
          <option value="">No phase</option>
          {phases.map(p => <option key={p.id} value={p.id}>{p.phase_name}</option>)}
        </select>
        <Button size="sm" onClick={addItem} disabled={!newCost.description.trim()} className="w-full h-6 text-[10px] font-mono">
          <Plus className="h-3 w-3 mr-1" />Add Cost Item
        </Button>
      </div>
    </div>
  );
};

export default ProjectCostPanel;
