import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { ChevronDown, ChevronRight, FileText, GripVertical } from 'lucide-react';
import type { ConstructionProject, ProjectPhase } from '@/components/admin/projectManagement/useProjectManagement';

const SharedProjectView: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [project, setProject] = useState<ConstructionProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

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

      // Auto-expand all phases on first load
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
    const { source, destination, draggableId } = result;
    const phaseId = source.droppableId;

    const phase = project.phases.find(p => p.id === phaseId);
    if (!phase) return;

    const reordered = Array.from(phase.items);
    const [moved] = reordered.splice(source.index, 1);
    reordered.splice(destination.index, 0, moved);

    // Optimistic update
    const updatedPhases = project.phases.map(p =>
      p.id === phaseId
        ? { ...p, items: reordered.map((item, idx) => ({ ...item, item_order: idx })) }
        : p
    );
    setProject({ ...project, phases: updatedPhases });

    // Persist to DB
    const updates = reordered.map((item, idx) =>
      supabase.from('phase_items').update({ item_order: idx }).eq('id', item.id)
    );
    await Promise.all(updates);
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-800 mb-2">Project Not Found</h1>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  const totalItems = project.phases.reduce((s, p) => s + p.items.length, 0);
  const completedItems = project.phases.reduce((s, p) => s + p.items.filter(i => i.is_completed).length, 0);
  const overallProgress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Cover Image */}
      {project.cover_image_url && (
        <div className="w-full aspect-[3/1] max-h-[360px] overflow-hidden">
          <img
            src={project.cover_image_url}
            alt={project.project_name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-1">
            {project.project_name}
          </h1>
          <p className="text-sm text-gray-500">
            {completedItems}/{totalItems} tasks completed
          </p>
        </div>

        {/* Overall Progress */}
        <div className="mb-8 p-5 rounded-xl border border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Overall Progress
            </span>
            <span className={`text-lg font-bold ${overallProgress === 100 ? 'text-green-600' : 'text-gray-900'}`}>
              {overallProgress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                overallProgress === 100 ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>

        {/* Phases with drag-and-drop */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="space-y-4">
            {project.phases.map((phase) => {
              const phaseCompleted = phase.items.filter(i => i.is_completed).length;
              const phaseTotal = phase.items.length;
              const phaseProgress = phaseTotal > 0 ? Math.round((phaseCompleted / phaseTotal) * 100) : 0;
              const isExpanded = expandedPhases.has(phase.id);

              return (
                <div key={phase.id} className="rounded-xl border border-gray-200 overflow-hidden">
                  {/* Phase Header */}
                  <button
                    className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                    onClick={() => togglePhase(phase.id)}
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      )}
                      <span className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        {phase.phase_name}
                      </span>
                      <span className="text-xs text-gray-400">
                        {phaseCompleted}/{phaseTotal}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-20">
                        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              phaseProgress === 100 ? 'bg-green-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${phaseProgress}%` }}
                          />
                        </div>
                      </div>
                      <span className={`text-xs font-bold ${phaseProgress === 100 ? 'text-green-600' : 'text-gray-600'}`}>
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
                                  className={`group ${snapshot.isDragging ? 'shadow-lg rounded-lg bg-white' : ''}`}
                                >
                                  <div className="flex items-center gap-2 py-2 px-2 rounded-lg hover:bg-gray-50 transition-colors">
                                    <div
                                      {...provided.dragHandleProps}
                                      className="cursor-grab opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <GripVertical className="h-4 w-4 text-gray-300" />
                                    </div>
                                    <Checkbox
                                      checked={item.is_completed}
                                      disabled
                                      className="border-gray-300 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                                    />
                                    <span
                                      className={`flex-1 text-sm cursor-pointer ${
                                        item.is_completed ? 'line-through text-gray-400' : 'text-gray-700'
                                      }`}
                                      onClick={() => toggleItemExpand(item.id)}
                                    >
                                      {item.item_name}
                                    </span>
                                    {item.documents.length > 0 && (
                                      <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium">
                                        {item.documents.length} doc{item.documents.length > 1 ? 's' : ''}
                                      </span>
                                    )}
                                    {item.due_date && (
                                      <span className="text-[10px] text-gray-400">
                                        {new Date(item.due_date).toLocaleDateString()}
                                      </span>
                                    )}
                                  </div>

                                  {/* Documents */}
                                  {expandedItems.has(item.id) && item.documents.length > 0 && (
                                    <div className="ml-10 mt-1 mb-2 space-y-1">
                                      {item.documents.map((doc) => (
                                        <div
                                          key={doc.id}
                                          className="flex items-center gap-2 text-xs text-gray-500 py-1 px-2 rounded bg-gray-50"
                                        >
                                          <FileText className="h-3 w-3 flex-shrink-0" />
                                          <a
                                            href={doc.file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 truncate hover:text-blue-600 underline"
                                          >
                                            {doc.file_name}
                                          </a>
                                          <span className="text-gray-400">
                                            {doc.file_size ? `${(doc.file_size / 1024).toFixed(0)}KB` : ''}
                                          </span>
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

        <div className="text-center mt-10">
          <p className="text-[10px] text-gray-400">
            Powered by Wonderlands World Experience
          </p>
        </div>
      </div>
    </div>
  );
};

export default SharedProjectView;
