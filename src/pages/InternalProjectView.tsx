import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, Save, GripVertical, ChevronDown, ChevronRight, FileText, DollarSign, Upload, Download } from 'lucide-react';
import type { ConstructionProject, ProjectPhase } from '@/components/admin/projectManagement/useProjectManagement';

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
  created_at: string;
  updated_at: string;
}

const InternalProjectView: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [project, setProject] = useState<ConstructionProject | null>(null);
  const [costItems, setCostItems] = useState<CostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [showCostPanel, setShowCostPanel] = useState(true);
  const [newCost, setNewCost] = useState({ description: '', category: 'general', quantity: '1', unit_price: '0', phase_id: '', notes: '' });
  const [editingCostId, setEditingCostId] = useState<string | null>(null);
  const [editCost, setEditCost] = useState<Partial<CostItem>>({});
  const [quotationPrices, setQuotationPrices] = useState<Record<string, string>>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const { toast } = useToast();

  const fetchProject = useCallback(async () => {
    if (!token) return;
    try {
      const { data: proj, error: projErr } = await supabase
        .from('construction_projects')
        .select('*')
        .eq('internal_share_token', token)
        .single();

      if (projErr || !proj) {
        setError('Project not found or link is invalid.');
        return;
      }

      const [phasesRes, costRes] = await Promise.all([
        supabase.from('project_phases').select('*').eq('project_id', proj.id).order('phase_order'),
        supabase.from('project_cost_items').select('*').eq('project_id', proj.id).order('created_at'),
      ]);

      const phases = phasesRes.data || [];
      setCostItems((costRes.data as CostItem[]) || []);

      const phaseIds = phases.map((p: any) => p.id);
      let items: any[] = [];
      let documents: any[] = [];

      if (phaseIds.length > 0) {
        const { data: itemsData } = await supabase.from('phase_items').select('*').in('phase_id', phaseIds).order('item_order');
        items = itemsData || [];
        const itemIds = items.map((i: any) => i.id);
        if (itemIds.length > 0) {
          const { data: docsData } = await supabase.from('item_documents').select('*').in('item_id', itemIds).order('created_at', { ascending: false });
          documents = docsData || [];
        }
      }

      const fullPhases: ProjectPhase[] = phases.map((phase: any) => ({
        ...phase,
        items: items.filter((i: any) => i.phase_id === phase.id).map((item: any) => ({
          ...item,
          documents: documents.filter((d: any) => d.item_id === item.id),
        })),
      }));

      const result = { ...proj, phases: fullPhases };
      setProject(result);
      setExpandedPhases(new Set(fullPhases.map(p => p.id)));
    } catch {
      setError('Failed to load project.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchProject(); }, [fetchProject]);

  const handleToggleItem = async (itemId: string, completed: boolean) => {
    await supabase.from('phase_items').update({ is_completed: completed, completed_at: completed ? new Date().toISOString() : null }).eq('id', itemId);
    await fetchProject();
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination || !project) return;
    const { source, destination } = result;
    const phaseId = source.droppableId;
    const phase = project.phases.find(p => p.id === phaseId);
    if (!phase) return;

    const reordered = Array.from(phase.items);
    const [moved] = reordered.splice(source.index, 1);
    reordered.splice(destination.index, 0, moved);

    const updatedPhases = project.phases.map(p =>
      p.id === phaseId ? { ...p, items: reordered.map((item, idx) => ({ ...item, item_order: idx })) } : p
    );
    setProject({ ...project, phases: updatedPhases });

    await Promise.all(reordered.map((item, idx) =>
      supabase.from('phase_items').update({ item_order: idx }).eq('id', item.id)
    ));
  };

  const addCostItem = async () => {
    if (!newCost.description.trim() || !project) return;
    const { error } = await supabase.from('project_cost_items').insert({
      project_id: project.id,
      description: newCost.description,
      category: newCost.category,
      quantity: parseFloat(newCost.quantity) || 1,
      unit_price: parseFloat(newCost.unit_price) || 0,
      phase_id: newCost.phase_id || null,
      notes: newCost.notes || null,
    });
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    setNewCost({ description: '', category: 'general', quantity: '1', unit_price: '0', phase_id: '', notes: '' });
    await fetchProject();
  };

  const updateCostItem = async (id: string) => {
    const { error } = await supabase.from('project_cost_items').update({
      description: editCost.description,
      category: editCost.category,
      quantity: editCost.quantity,
      unit_price: editCost.unit_price,
      notes: editCost.notes,
      status: editCost.status,
    }).eq('id', id);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    setEditingCostId(null);
    toast({ title: 'Saved' });
    await fetchProject();
  };

  const deleteCostItem = async (id: string) => {
    await supabase.from('project_cost_items').delete().eq('id', id);
    await fetchProject();
  };

  const handleManualCost = async (itemId: string, itemName: string, phaseId: string) => {
    if (!project) return;
    const priceStr = quotationPrices[itemId];
    const price = parseFloat(priceStr);
    if (!price || price <= 0) {
      toast({ title: 'Enter a valid price', variant: 'destructive' });
      return;
    }
    await supabase.from('project_cost_items').insert({
      project_id: project.id,
      description: `Manual: ${itemName}`,
      category: 'general',
      quantity: 1,
      unit_price: price,
      phase_id: phaseId,
      notes: 'Manually entered cost (no quotation)',
    });
    setQuotationPrices(prev => { const n = { ...prev }; delete n[itemId]; return n; });
    toast({ title: 'Cost added' });
    await fetchProject();
  };

  const handleUploadQuotation = async (itemId: string, itemName: string, phaseId: string, file: File) => {
    if (!project) return;
    try {
      const filePath = `${project.id}/${itemId}/${Date.now()}_${file.name}`;
      const { error: uploadErr } = await supabase.storage.from('project-documents').upload(filePath, file);
      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage.from('project-documents').getPublicUrl(filePath);

      await supabase.from('item_documents').insert({
        item_id: itemId,
        file_name: file.name,
        file_url: urlData.publicUrl,
        file_type: file.type,
        file_size: file.size,
      });

      // If a price was entered, create a cost item automatically
      const priceStr = quotationPrices[itemId];
      const price = parseFloat(priceStr);
      if (price > 0) {
        await supabase.from('project_cost_items').insert({
          project_id: project.id,
          description: `Quotation: ${itemName}`,
          category: 'subcontractor',
          quantity: 1,
          unit_price: price,
          phase_id: phaseId,
          notes: `From uploaded file: ${file.name}`,
        });
        setQuotationPrices(prev => { const n = { ...prev }; delete n[itemId]; return n; });
      }

      toast({ title: 'Quotation uploaded', description: file.name });
      await fetchProject();
    } catch (e: any) {
      toast({ title: 'Upload failed', description: e.message, variant: 'destructive' });
    }
  };

  const togglePhase = (id: string) => {
    setExpandedPhases(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const toggleItemExpand = (id: string) => {
    setExpandedItems(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800" /></div>;
  if (error || !project) return <div className="min-h-screen bg-white flex items-center justify-center"><div className="text-center"><h1 className="text-xl font-semibold text-gray-800 mb-2">Not Found</h1><p className="text-sm text-gray-500">{error}</p></div></div>;

  const totalItems = project.phases.reduce((s, p) => s + p.items.length, 0);
  const completedItems = project.phases.reduce((s, p) => s + p.items.filter(i => i.is_completed).length, 0);
  const overallProgress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  const totalCost = costItems.reduce((s, c) => s + (c.quantity * c.unit_price), 0);

  const CATEGORIES = ['general', 'labor', 'materials', 'equipment', 'permits', 'subcontractor', 'other'];
  const STATUSES = ['quoted', 'approved', 'invoiced', 'paid'];

  return (
    <div className="min-h-screen bg-gray-50">
      {project.cover_image_url && (
        <div className="w-full aspect-[4/1] max-h-[280px] overflow-hidden">
          <img src={project.cover_image_url} alt={project.project_name} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded">INTERNAL</span>
            <h1 className="text-2xl font-bold text-gray-900">{project.project_name}</h1>
          </div>
          <p className="text-sm text-gray-500">{completedItems}/{totalItems} tasks • {overallProgress}% complete</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Phases & Items */}
          <div className="lg:col-span-2">
            <div className="mb-4 p-4 rounded-xl border border-gray-200 bg-white">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</span>
                <span className={`text-lg font-bold ${overallProgress === 100 ? 'text-green-600' : 'text-gray-900'}`}>{overallProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-700 ${overallProgress === 100 ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${overallProgress}%` }} />
              </div>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="space-y-3">
                {project.phases.map((phase) => {
                  const pc = phase.items.filter(i => i.is_completed).length;
                  const pt = phase.items.length;
                  const pp = pt > 0 ? Math.round((pc / pt) * 100) : 0;
                  const isExp = expandedPhases.has(phase.id);

                  return (
                    <div key={phase.id} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                      <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors" onClick={() => togglePhase(phase.id)}>
                        <div className="flex items-center gap-2">
                          {isExp ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
                          <span className="text-sm font-semibold text-gray-800 uppercase tracking-wide">{phase.phase_name}</span>
                          <span className="text-xs text-gray-400">{pc}/{pt}</span>
                        </div>
                        <span className={`text-xs font-bold ${pp === 100 ? 'text-green-600' : 'text-gray-600'}`}>{pp}%</span>
                      </button>

                      {isExp && (
                        <Droppable droppableId={phase.id}>
                          {(provided) => (
                            <div ref={provided.innerRef} {...provided.droppableProps} className="px-3 pb-3">
                              {phase.items.map((item, index) => (
                                <Draggable key={item.id} draggableId={item.id} index={index}>
                                  {(provided, snapshot) => (
                                    <div ref={provided.innerRef} {...provided.draggableProps} className={`group ${snapshot.isDragging ? 'shadow-lg rounded-lg bg-white' : ''}`}>
                                      <div className="flex items-center gap-2 py-2 px-2 rounded-lg hover:bg-gray-50 transition-colors">
                                        <div {...provided.dragHandleProps} className="cursor-grab opacity-0 group-hover:opacity-100 transition-opacity">
                                          <GripVertical className="h-4 w-4 text-gray-300" />
                                        </div>
                                        <Checkbox checked={item.is_completed} onCheckedChange={(checked) => handleToggleItem(item.id, !!checked)} className="border-gray-300 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500" />
                                        <span className={`flex-1 text-sm cursor-pointer ${item.is_completed ? 'line-through text-gray-400' : 'text-gray-700'}`} onClick={() => toggleItemExpand(item.id)}>
                                          {item.item_name}
                                        </span>
                                        {item.documents.length > 0 && (
                                          <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium">{item.documents.length} doc{item.documents.length > 1 ? 's' : ''}</span>
                                        )}
                                        {/* Upload quotation button */}
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6 opacity-0 group-hover:opacity-100 text-amber-500 hover:text-amber-600 transition-opacity"
                                          onClick={() => fileInputRefs.current[item.id]?.click()}
                                          title="Upload quotation"
                                        >
                                          <Upload className="h-3 w-3" />
                                        </Button>
                                        <input
                                          ref={(el) => { fileInputRefs.current[item.id] = el; }}
                                          type="file"
                                          className="hidden"
                                          onChange={(e) => {
                                            const f = e.target.files?.[0];
                                            if (f) handleUploadQuotation(item.id, item.item_name, phase.id, f);
                                            e.target.value = '';
                                          }}
                                        />
                                      </div>

                                      {/* Quotation price input - always visible for quick entry */}
                                      <div className="ml-10 flex items-center gap-2 py-1">
                                        <DollarSign className="h-3 w-3 text-gray-400" />
                                        <Input
                                          type="number"
                                          placeholder="Quote price..."
                                          value={quotationPrices[item.id] || ''}
                                          onChange={(e) => setQuotationPrices(prev => ({ ...prev, [item.id]: e.target.value }))}
                                          className="h-6 w-32 text-xs border-gray-200"
                                        />
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="h-6 text-[10px] px-2"
                                          disabled={!quotationPrices[item.id] || parseFloat(quotationPrices[item.id]) <= 0}
                                          onClick={() => handleManualCost(item.id, item.item_name, phase.id)}
                                        >
                                          <Plus className="h-3 w-3 mr-1" />Add Cost
                                        </Button>
                                        <span className="text-[10px] text-gray-400">or upload quotation</span>
                                      </div>

                                      {/* Documents list */}
                                      {expandedItems.has(item.id) && item.documents.length > 0 && (
                                        <div className="ml-10 mt-1 mb-2 space-y-1">
                                          {item.documents.map((doc) => (
                                            <div key={doc.id} className="flex items-center gap-2 text-xs text-gray-500 py-1.5 px-2 rounded bg-gray-50 border border-gray-100">
                                              <FileText className="h-3 w-3 flex-shrink-0 text-gray-400" />
                                              <span className="flex-1 truncate text-gray-700">{doc.file_name}</span>
                                              <span className="text-gray-400 text-[10px]">
                                                {doc.file_size ? `${(doc.file_size / 1024).toFixed(0)}KB` : ''}
                                              </span>
                                              <a
                                                href={doc.file_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                download={doc.file_name}
                                                className="flex items-center gap-1 text-blue-500 hover:text-blue-700 transition-colors"
                                              >
                                                <Download className="h-3 w-3" />
                                                <span>Download</span>
                                              </a>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      )}
                    </div>
                  );
                })}
              </div>
            </DragDropContext>
          </div>

          {/* Right: Cost Tracking */}
          <div className="lg:col-span-1">
            <div className="rounded-xl border border-gray-200 bg-white p-4 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-600" />
                  <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Cost Tracking</h2>
                </div>
                <span className="text-lg font-bold text-gray-900">${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>

              {/* Cost items list */}
              <div className="space-y-2 mb-4 max-h-[400px] overflow-y-auto">
                {costItems.map((ci) => (
                  <div key={ci.id} className="border border-gray-100 rounded-lg p-2.5 text-xs">
                    {editingCostId === ci.id ? (
                      <div className="space-y-2">
                        <Input value={editCost.description || ''} onChange={(e) => setEditCost({ ...editCost, description: e.target.value })} className="h-7 text-xs" placeholder="Description" />
                        <div className="grid grid-cols-2 gap-2">
                          <Input type="number" value={editCost.quantity || ''} onChange={(e) => setEditCost({ ...editCost, quantity: parseFloat(e.target.value) })} className="h-7 text-xs" placeholder="Qty" />
                          <Input type="number" value={editCost.unit_price || ''} onChange={(e) => setEditCost({ ...editCost, unit_price: parseFloat(e.target.value) })} className="h-7 text-xs" placeholder="Price" />
                        </div>
                        <select value={editCost.status || 'quoted'} onChange={(e) => setEditCost({ ...editCost, status: e.target.value })} className="w-full h-7 text-xs border border-gray-200 rounded px-2">
                          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <Input value={editCost.notes || ''} onChange={(e) => setEditCost({ ...editCost, notes: e.target.value })} className="h-7 text-xs" placeholder="Notes" />
                        <div className="flex gap-1">
                          <Button size="sm" onClick={() => updateCostItem(ci.id)} className="h-7 text-xs flex-1"><Save className="h-3 w-3 mr-1" />Save</Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingCostId(null)} className="h-7 text-xs">Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="cursor-pointer" onClick={() => { setEditingCostId(ci.id); setEditCost(ci); }}>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-800">{ci.description}</p>
                            <p className="text-gray-400 mt-0.5">{ci.category} • {ci.quantity} × ${ci.unit_price}</p>
                          </div>
                          <div className="text-right flex items-center gap-1">
                            <span className="font-bold text-gray-900">${(ci.quantity * ci.unit_price).toFixed(2)}</span>
                            <button onClick={(e) => { e.stopPropagation(); deleteCostItem(ci.id); }} className="text-red-400 hover:text-red-600 ml-1"><Trash2 className="h-3 w-3" /></button>
                          </div>
                        </div>
                        <div className="mt-1">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                            ci.status === 'paid' ? 'bg-green-50 text-green-600' :
                            ci.status === 'approved' ? 'bg-blue-50 text-blue-600' :
                            ci.status === 'invoiced' ? 'bg-amber-50 text-amber-600' :
                            'bg-gray-100 text-gray-500'
                          }`}>{ci.status}</span>
                          {ci.notes && <span className="text-gray-400 ml-2">{ci.notes}</span>}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {costItems.length === 0 && <p className="text-xs text-gray-400 text-center py-4">No cost items yet</p>}
              </div>

              {/* Add new cost item */}
              <div className="border-t border-gray-100 pt-3 space-y-2">
                <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Add Cost Item</p>
                <Input value={newCost.description} onChange={(e) => setNewCost({ ...newCost, description: e.target.value })} className="h-7 text-xs" placeholder="Description" />
                <div className="grid grid-cols-2 gap-2">
                  <Input type="number" value={newCost.quantity} onChange={(e) => setNewCost({ ...newCost, quantity: e.target.value })} className="h-7 text-xs" placeholder="Qty" />
                  <Input type="number" value={newCost.unit_price} onChange={(e) => setNewCost({ ...newCost, unit_price: e.target.value })} className="h-7 text-xs" placeholder="Unit Price" />
                </div>
                <select value={newCost.category} onChange={(e) => setNewCost({ ...newCost, category: e.target.value })} className="w-full h-7 text-xs border border-gray-200 rounded px-2">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={newCost.phase_id} onChange={(e) => setNewCost({ ...newCost, phase_id: e.target.value })} className="w-full h-7 text-xs border border-gray-200 rounded px-2">
                  <option value="">No phase</option>
                  {project.phases.map(p => <option key={p.id} value={p.id}>{p.phase_name}</option>)}
                </select>
                <Input value={newCost.notes} onChange={(e) => setNewCost({ ...newCost, notes: e.target.value })} className="h-7 text-xs" placeholder="Notes (optional)" />
                <Button size="sm" onClick={addCostItem} disabled={!newCost.description.trim()} className="w-full h-7 text-xs">
                  <Plus className="h-3 w-3 mr-1" />Add Item
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-10">
          <p className="text-[10px] text-gray-400">Internal View — Wonderlands World Experience</p>
        </div>
      </div>
    </div>
  );
};

export default InternalProjectView;
