import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DEFAULT_PROJECT_TEMPLATE } from './defaultTemplate';

export interface ProjectPhase {
  id: string;
  phase_name: string;
  phase_order: number;
  items: PhaseItem[];
}

export interface PhaseItem {
  id: string;
  item_name: string;
  is_completed: boolean;
  completed_at: string | null;
  due_date: string | null;
  notes: string | null;
  item_order: number;
  documents: ItemDocument[];
}

export interface ItemDocument {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
  created_at: string;
}

export interface ConstructionProject {
  id: string;
  project_name: string;
  client_id: string | null;
  contractor_id: string | null;
  share_token: string;
  internal_share_token: string;
  status: string;
  notes: string | null;
  cover_image_url: string | null;
  created_at: string;
  updated_at: string;
  phases: ProjectPhase[];
}

export function useProjectManagement() {
  const [projects, setProjects] = useState<ConstructionProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<ConstructionProject | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('construction_projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects((data || []).map((p: any) => ({ ...p, phases: [] })));
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchProjectDetail = useCallback(async (projectId: string) => {
    try {
      const [projectRes, phasesRes] = await Promise.all([
        supabase.from('construction_projects').select('*').eq('id', projectId).single(),
        supabase.from('project_phases').select('*').eq('project_id', projectId).order('phase_order'),
      ]);

      if (projectRes.error) throw projectRes.error;
      const phases = phasesRes.data || [];

      // Fetch items for all phases
      const phaseIds = phases.map((p: any) => p.id);
      let items: any[] = [];
      let documents: any[] = [];

      if (phaseIds.length > 0) {
        const itemsRes = await supabase
          .from('phase_items')
          .select('*')
          .in('phase_id', phaseIds)
          .order('item_order');
        items = itemsRes.data || [];

        const itemIds = items.map((i: any) => i.id);
        if (itemIds.length > 0) {
          const docsRes = await supabase
            .from('item_documents')
            .select('*')
            .in('item_id', itemIds)
            .order('created_at', { ascending: false });
          documents = docsRes.data || [];
        }
      }

      // Assemble
      const fullPhases: ProjectPhase[] = phases.map((phase: any) => {
        const phaseItems = items
          .filter((i: any) => i.phase_id === phase.id)
          .map((item: any) => ({
            ...item,
            documents: documents.filter((d: any) => d.item_id === item.id),
          }));
        return { ...phase, items: phaseItems };
      });

      const project: ConstructionProject = { ...projectRes.data, phases: fullPhases };
      setSelectedProject(project);
      return project;
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
      return null;
    }
  }, [toast]);

  const createProject = useCallback(async (name: string, clientId?: string, contractorId?: string) => {
    try {
      const { data: project, error } = await supabase
        .from('construction_projects')
        .insert({ project_name: name, client_id: clientId || null, contractor_id: contractorId || null })
        .select()
        .single();

      if (error) throw error;

      // Create default phases and items
      for (let i = 0; i < DEFAULT_PROJECT_TEMPLATE.length; i++) {
        const tmpl = DEFAULT_PROJECT_TEMPLATE[i];
        const { data: phase, error: phaseErr } = await supabase
          .from('project_phases')
          .insert({ project_id: project.id, phase_name: tmpl.phase_name, phase_order: i })
          .select()
          .single();

        if (phaseErr) throw phaseErr;

        const itemInserts = tmpl.items.map((itemName, j) => ({
          phase_id: phase.id,
          item_name: itemName,
          item_order: j,
        }));

        if (itemInserts.length > 0) {
          const { error: itemErr } = await supabase.from('phase_items').insert(itemInserts);
          if (itemErr) throw itemErr;
        }
      }

      toast({ title: 'Project created', description: `"${name}" with default template` });
      await fetchProjects();
      return project;
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
      return null;
    }
  }, [toast, fetchProjects]);

  const toggleItem = useCallback(async (itemId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('phase_items')
        .update({
          is_completed: completed,
          completed_at: completed ? new Date().toISOString() : null,
        })
        .eq('id', itemId);

      if (error) throw error;
      if (selectedProject) {
        await fetchProjectDetail(selectedProject.id);
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  }, [selectedProject, fetchProjectDetail, toast]);

  const addPhase = useCallback(async (projectId: string, phaseName: string) => {
    try {
      const maxOrder = selectedProject?.phases.reduce((max, p) => Math.max(max, p.phase_order), -1) ?? -1;
      const { error } = await supabase
        .from('project_phases')
        .insert({ project_id: projectId, phase_name: phaseName, phase_order: maxOrder + 1 });

      if (error) throw error;
      await fetchProjectDetail(projectId);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  }, [selectedProject, fetchProjectDetail, toast]);

  const addItem = useCallback(async (phaseId: string, itemName: string) => {
    try {
      const phase = selectedProject?.phases.find(p => p.id === phaseId);
      const maxOrder = phase?.items.reduce((max, i) => Math.max(max, i.item_order), -1) ?? -1;
      const { error } = await supabase
        .from('phase_items')
        .insert({ phase_id: phaseId, item_name: itemName, item_order: maxOrder + 1 });

      if (error) throw error;
      if (selectedProject) await fetchProjectDetail(selectedProject.id);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  }, [selectedProject, fetchProjectDetail, toast]);

  const deleteItem = useCallback(async (itemId: string) => {
    try {
      const { error } = await supabase.from('phase_items').delete().eq('id', itemId);
      if (error) throw error;
      if (selectedProject) await fetchProjectDetail(selectedProject.id);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  }, [selectedProject, fetchProjectDetail, toast]);

  const deletePhase = useCallback(async (phaseId: string) => {
    try {
      const { error } = await supabase.from('project_phases').delete().eq('id', phaseId);
      if (error) throw error;
      if (selectedProject) await fetchProjectDetail(selectedProject.id);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  }, [selectedProject, fetchProjectDetail, toast]);

  const uploadDocument = useCallback(async (itemId: string, file: File) => {
    try {
      const filePath = `${selectedProject?.id}/${itemId}/${Date.now()}_${file.name}`;
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
      if (selectedProject) await fetchProjectDetail(selectedProject.id);
    } catch (e: any) {
      toast({ title: 'Upload failed', description: e.message, variant: 'destructive' });
    }
  }, [selectedProject, fetchProjectDetail, toast]);

  const deleteDocument = useCallback(async (docId: string) => {
    try {
      const { error } = await supabase.from('item_documents').delete().eq('id', docId);
      if (error) throw error;
      if (selectedProject) await fetchProjectDetail(selectedProject.id);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  }, [selectedProject, fetchProjectDetail, toast]);

  const deleteProject = useCallback(async (projectId: string) => {
    try {
      const { error } = await supabase.from('construction_projects').delete().eq('id', projectId);
      if (error) throw error;
      toast({ title: 'Project deleted' });
      setSelectedProject(null);
      await fetchProjects();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  }, [fetchProjects, toast]);

  const reorderItems = useCallback(async (phaseId: string, reorderedItems: { id: string; item_order: number }[]) => {
    try {
      // Optimistic update
      if (selectedProject) {
        const updatedPhases = selectedProject.phases.map(p =>
          p.id === phaseId
            ? {
                ...p,
                items: p.items
                  .map(item => {
                    const newOrder = reorderedItems.find(r => r.id === item.id);
                    return newOrder ? { ...item, item_order: newOrder.item_order } : item;
                  })
                  .sort((a, b) => a.item_order - b.item_order),
              }
            : p
        );
        setSelectedProject({ ...selectedProject, phases: updatedPhases });
      }

      const updates = reorderedItems.map(({ id, item_order }) =>
        supabase.from('phase_items').update({ item_order }).eq('id', id)
      );
      await Promise.all(updates);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
      if (selectedProject) await fetchProjectDetail(selectedProject.id);
    }
  }, [selectedProject, fetchProjectDetail, toast]);

  const updateCoverImage = useCallback(async (projectId: string, file: File) => {
    try {
      const filePath = `covers/${projectId}/${Date.now()}_${file.name}`;
      const { error: uploadErr } = await supabase.storage
        .from('project-documents')
        .upload(filePath, file);
      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage
        .from('project-documents')
        .getPublicUrl(filePath);

      const { error: updateErr } = await supabase
        .from('construction_projects')
        .update({ cover_image_url: urlData.publicUrl })
        .eq('id', projectId);
      if (updateErr) throw updateErr;

      toast({ title: 'Cover image updated' });
      await fetchProjects();
      if (selectedProject?.id === projectId) {
        await fetchProjectDetail(projectId);
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  }, [fetchProjects, fetchProjectDetail, selectedProject, toast]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return {
    projects,
    selectedProject,
    loading,
    fetchProjects,
    fetchProjectDetail,
    createProject,
    toggleItem,
    addPhase,
    addItem,
    deleteItem,
    deletePhase,
    uploadDocument,
    deleteDocument,
    deleteProject,
    updateCoverImage,
    reorderItems,
    setSelectedProject,
  };
}
