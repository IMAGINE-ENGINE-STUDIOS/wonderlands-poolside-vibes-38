import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ChevronDown, ChevronRight, FileText, GripVertical, Upload, Download, HardHat, Clock, CheckCircle, PlayCircle } from 'lucide-react';
import type { ConstructionProject, ProjectPhase } from '@/components/admin/projectManagement/useProjectManagement';

const SharedProjectView: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [project, setProject] = useState<ConstructionProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [contractorTasks, setContractorTasks] = useState<any[]>([]);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const { toast } = useToast();

  const fetchProject = useCallback(async () => {
    if (!token) return;
    try {
      const { data: proj, error: projErr } = await supabase
        .from('construction_projects')
        .select('*')
        .eq('share_token', token)
        .single();

      if (projErr || !proj) {
        setError('Project not found or link is invalid.');
        return;
      }

      const { data: phases } = await supabase
        .from('project_phases')
        .select('*')
        .eq('project_id', proj.id)
        .order('phase_order');

      const phaseIds = (phases || []).map((p: any) => p.id);
      let items: any[] = [];
      let documents: any[] = [];

      if (phaseIds.length > 0) {
        const { data: itemsData } = await supabase
          .from('phase_items')
          .select('*')
          .in('phase_id', phaseIds)
          .order('item_order');
        items = itemsData || [];

        const itemIds = items.map((i: any) => i.id);
        if (itemIds.length > 0) {
          const { data: docsData } = await supabase
            .from('item_documents')
            .select('*')
            .in('item_id', itemIds)
            .order('created_at', { ascending: false });
          documents = docsData || [];
        }
      }

      const fullPhases: ProjectPhase[] = (phases || []).map((phase: any) => ({
        ...phase,
        items: items
          .filter((i: any) => i.phase_id === phase.id)
          .map((item: any) => ({
            ...item,
            documents: documents.filter((d: any) => d.item_id === item.id),
          })),
      }));

      const result = { ...proj, phases: fullPhases };
      setProject(result);

      // Fetch contractor tasks for this project
      const { data: taskData } = await supabase
        .from('contractor_project_tasks')
        .select('*, contractors(company_name, contact_name)')
        .eq('project_id', proj.id)
        .order('start_date', { ascending: true }) as any;
      setContractorTasks(taskData || []);

      if (expandedPhases.size === 0) {
        setExpandedPhases(new Set(fullPhases.map(p => p.id)));
      }
    } catch {
      setError('Failed to load project.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

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
      p.id === phaseId
        ? { ...p, items: reordered.map((item, idx) => ({ ...item, item_order: idx })) }
        : p
    );
    setProject({ ...project, phases: updatedPhases });

    await Promise.all(reordered.map((item, idx) =>
      supabase.from('phase_items').update({ item_order: idx }).eq('id', item.id)
    ));
  };

  const handleUploadDocument = async (itemId: string, file: File) => {
    if (!project) return;
    try {
      const filePath = `${project.id}/${itemId}/${Date.now()}_${file.name}`;
      const { error: uploadErr } = await supabase.storage
        .from('project-documents')
        .upload(filePath, file);
      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage
        .from('project-documents')
        .getPublicUrl(filePath);

      const { error: docErr } = await supabase.from('item_documents').insert({
        item_id: itemId,
        file_name: file.name,
        file_url: urlData.publicUrl,
        file_type: file.type,
        file_size: file.size,
      });
      if (docErr) throw docErr;

      toast({ title: 'Document uploaded', description: file.name });
      await fetchProject();
    } catch (e: any) {
      toast({ title: 'Upload failed', description: e.message, variant: 'destructive' });
    }
  };

  const togglePhase = (phaseId: string) => {
    setExpandedPhases(prev => {
      const next = new Set(prev);
      next.has(phaseId) ? next.delete(phaseId) : next.add(phaseId);
      return next;
    });
  };

  const toggleItemExpand = (itemId: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      next.has(itemId) ? next.delete(itemId) : next.add(itemId);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-mono font-bold text-cyan-300 mb-2">Project Not Found</h1>
          <p className="text-sm font-mono text-cyan-400/50">{error}</p>
        </div>
      </div>
    );
  }

  const totalItems = project.phases.reduce((s, p) => s + p.items.length, 0);
  const completedItems = project.phases.reduce((s, p) => s + p.items.filter(i => i.is_completed).length, 0);
  const overallProgress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative">
      <div className="absolute inset-0 grid-bg opacity-20" />

      {/* Cover Image */}
      {project.cover_image_url && (
        <div className="relative w-full aspect-[3/1] max-h-[360px] overflow-hidden">
          <img
            src={project.cover_image_url}
            alt={project.project_name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-[#0a0a0f]/30" />
        </div>
      )}

      <div className="relative max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-mono font-bold text-cyan-300 tracking-wider mb-1">
            {project.project_name}
          </h1>
          <p className="text-xs font-mono text-cyan-400/50">
            {completedItems}/{totalItems} tasks completed
          </p>
        </div>

        {/* Overall Progress */}
        <div className="mb-6 p-4 rounded-lg border border-cyan-500/20 bg-black/40 backdrop-blur">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-cyan-400/60 uppercase tracking-wider">
              Overall Progress
            </span>
            <span className={`text-lg font-mono font-bold ${overallProgress === 100 ? 'text-green-400' : 'text-cyan-300'}`}>
              {overallProgress}%
            </span>
          </div>
          <div className="w-full bg-cyan-900/30 rounded-full h-4 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                overallProgress === 100 ? 'bg-green-500' : 'bg-gradient-to-r from-cyan-500 to-blue-500'
              }`}
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>

        {/* Phases */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="space-y-4">
            {project.phases.map((phase) => {
              const phaseCompleted = phase.items.filter(i => i.is_completed).length;
              const phaseTotal = phase.items.length;
              const phaseProgress = phaseTotal > 0 ? Math.round((phaseCompleted / phaseTotal) * 100) : 0;
              const isExpanded = expandedPhases.has(phase.id);

              return (
                <div key={phase.id} className="rounded-lg border border-cyan-500/20 bg-black/40 backdrop-blur overflow-hidden">
                  {/* Phase Header */}
                  <button
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-cyan-500/5 transition-colors"
                    onClick={() => togglePhase(phase.id)}
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-cyan-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-cyan-400" />
                      )}
                      <span className="text-sm font-mono text-cyan-300 uppercase tracking-wide font-bold">
                        {phase.phase_name}
                      </span>
                      <span className="text-xs font-mono text-cyan-400/60">
                        {phaseCompleted}/{phaseTotal}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24">
                        <div className="w-full bg-cyan-900/30 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              phaseProgress === 100 ? 'bg-green-500' : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                            }`}
                            style={{ width: `${phaseProgress}%` }}
                          />
                        </div>
                      </div>
                      <span className={`text-xs font-mono font-bold ${phaseProgress === 100 ? 'text-green-400' : 'text-cyan-400'}`}>
                        {phaseProgress}%
                      </span>
                    </div>
                  </button>

                  {/* Phase Items */}
                  {isExpanded && (
                    <Droppable droppableId={phase.id}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className="px-3 py-2"
                        >
                          {phase.items.map((item, index) => (
                            <Draggable key={item.id} draggableId={item.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`group ${snapshot.isDragging ? 'shadow-lg shadow-cyan-500/10 rounded-lg bg-[#0d0d15]' : ''}`}
                                >
                                  <div className="flex items-center gap-2 py-2 px-2 rounded-lg hover:bg-cyan-500/5 transition-colors">
                                    <div
                                      {...provided.dragHandleProps}
                                      className="cursor-grab opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <GripVertical className="h-4 w-4 text-cyan-500/30" />
                                    </div>
                                    <Checkbox
                                      checked={item.is_completed}
                                      disabled
                                      className="border-cyan-500/40 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                                    />
                                    <span
                                      className={`flex-1 text-xs font-mono cursor-pointer ${
                                        item.is_completed ? 'line-through text-cyan-400/40' : 'text-cyan-300/80'
                                      }`}
                                      onClick={() => toggleItemExpand(item.id)}
                                    >
                                      {item.item_name}
                                    </span>
                                    {item.documents.length > 0 && (
                                      <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded font-mono">
                                        {item.documents.length} doc{item.documents.length > 1 ? 's' : ''}
                                      </span>
                                    )}
                                    {/* Upload button */}
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 opacity-0 group-hover:opacity-100 text-cyan-400/60 hover:text-cyan-400 transition-opacity"
                                      onClick={() => fileInputRefs.current[item.id]?.click()}
                                    >
                                      <Upload className="h-3 w-3" />
                                    </Button>
                                    <input
                                      ref={(el) => { fileInputRefs.current[item.id] = el; }}
                                      type="file"
                                      className="hidden"
                                      onChange={(e) => {
                                        const f = e.target.files?.[0];
                                        if (f) handleUploadDocument(item.id, f);
                                        e.target.value = '';
                                      }}
                                    />
                                    {item.due_date && (
                                      <span className="text-[10px] text-cyan-400/50 font-mono">
                                        {new Date(item.due_date).toLocaleDateString()}
                                      </span>
                                    )}
                                  </div>

                                  {/* Documents - always visible if expanded */}
                                  {expandedItems.has(item.id) && item.documents.length > 0 && (
                                    <div className="ml-10 mt-1 mb-2 space-y-1">
                                      {item.documents.map((doc) => (
                                        <div
                                          key={doc.id}
                                          className="flex items-center gap-2 text-[10px] font-mono text-cyan-400/60 py-1.5 px-2 rounded bg-cyan-500/5 border border-cyan-500/10"
                                        >
                                          <FileText className="h-3 w-3 flex-shrink-0 text-cyan-400/40" />
                                          <span className="flex-1 truncate text-cyan-300/70">
                                            {doc.file_name}
                                          </span>
                                          <span className="text-cyan-500/40">
                                            {doc.file_size ? `${(doc.file_size / 1024).toFixed(0)}KB` : ''}
                                          </span>
                                          <a
                                            href={doc.file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            download={doc.file_name}
                                            className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors"
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

        {/* Contractor Work Progress */}
        {contractorTasks.length > 0 && (() => {
          const ctCompleted = contractorTasks.filter((t: any) => t.status === 'completed').length;
          const ctProgress = Math.round((ctCompleted / contractorTasks.length) * 100);
          return (
            <div className="mt-6 p-4 rounded-lg border border-cyan-500/20 bg-black/40 backdrop-blur space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardHat className="h-4 w-4 text-cyan-400" />
                  <span className="text-xs font-mono text-cyan-300 uppercase tracking-wider font-bold">
                    Contractor Progress
                  </span>
                </div>
                <span className="text-xs font-mono text-cyan-400/60">
                  {ctCompleted}/{contractorTasks.length} tasks • {ctProgress}%
                </span>
              </div>
              <div className="w-full bg-cyan-900/30 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    ctProgress === 100 ? 'bg-green-500' : 'bg-gradient-to-r from-emerald-500 to-cyan-500'
                  }`}
                  style={{ width: `${ctProgress}%` }}
                />
              </div>
              <div className="space-y-2">
                {contractorTasks.map((task: any) => {
                  const overdue = task.due_date && task.status !== 'completed' && new Date(task.due_date) < new Date();
                  return (
                    <div
                      key={task.id}
                      className={`rounded border p-2.5 ${
                        overdue ? 'border-red-500/30 bg-red-500/5'
                          : task.status === 'completed' ? 'border-green-500/20 bg-green-500/5'
                          : 'border-cyan-500/10 bg-cyan-500/5'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {task.status === 'completed' ? <CheckCircle className="h-3 w-3 text-green-400" />
                            : task.status === 'in_progress' ? <PlayCircle className="h-3 w-3 text-yellow-400" />
                            : <Clock className="h-3 w-3 text-cyan-400/60" />}
                          <span className={`text-xs font-mono ${task.status === 'completed' ? 'text-cyan-400/40 line-through' : 'text-cyan-300'}`}>
                            {task.task_name}
                          </span>
                          {overdue && <Badge variant="destructive" className="text-[9px] h-4 px-1">Overdue</Badge>}
                        </div>
                        <Badge className={
                          task.status === 'completed' ? 'bg-green-500/20 text-green-400 border-green-500/30 text-[10px] font-mono'
                            : task.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-[10px] font-mono'
                            : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-[10px] font-mono'
                        }>
                          {task.status === 'in_progress' ? 'In Progress' : task.status === 'completed' ? 'Completed' : 'Assigned'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-[10px] font-mono text-cyan-400/40">
                        <span className="flex items-center gap-1"><HardHat className="h-2.5 w-2.5" />{task.contractors?.company_name || 'Contractor'}</span>
                        {task.due_date && <span className="flex items-center gap-1"><Clock className="h-2.5 w-2.5" />Due: {new Date(task.due_date).toLocaleDateString()}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        <div className="text-center mt-10">
          <p className="text-[10px] font-mono text-cyan-500/30">
            Powered by Wonderlands World Experience
          </p>
        </div>
      </div>
    </div>
  );
};

export default SharedProjectView;
