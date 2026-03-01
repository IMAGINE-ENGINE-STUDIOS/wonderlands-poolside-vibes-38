import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import ProjectPhaseCard from '@/components/admin/projectManagement/ProjectPhaseCard';
import type { ConstructionProject, ProjectPhase } from '@/components/admin/projectManagement/useProjectManagement';

const SharedProjectView: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [project, setProject] = useState<ConstructionProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;

    const fetchProject = async () => {
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

        setProject({ ...proj, phases: fullPhases });
      } catch {
        setError('Failed to load project.');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [token]);

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
          <h1 className="text-xl font-mono text-cyan-300 mb-2">Project Not Found</h1>
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
        <div className="space-y-4">
          {project.phases.map((phase) => (
            <ProjectPhaseCard
              key={phase.id}
              phase={phase}
              readOnly
              onToggleItem={() => {}}
              onAddItem={() => {}}
              onDeleteItem={() => {}}
              onDeletePhase={() => {}}
              onUploadDocument={() => {}}
              onDeleteDocument={() => {}}
            />
          ))}
        </div>

        <div className="text-center mt-8">
          <p className="text-[10px] font-mono text-cyan-500/30">
            Powered by Wonderlands World Experience
          </p>
        </div>
      </div>
    </div>
  );
};

export default SharedProjectView;
