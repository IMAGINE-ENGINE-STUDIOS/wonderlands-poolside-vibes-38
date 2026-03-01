import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Plus, Share2, Copy, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ProjectPhaseCard from './ProjectPhaseCard';
import type { ConstructionProject } from './useProjectManagement';

interface ProjectDetailViewProps {
  project: ConstructionProject;
  onBack: () => void;
  onToggleItem: (itemId: string, completed: boolean) => void;
  onAddPhase: (projectId: string, name: string) => void;
  onAddItem: (phaseId: string, name: string) => void;
  onDeleteItem: (itemId: string) => void;
  onDeletePhase: (phaseId: string) => void;
  onUploadDocument: (itemId: string, file: File) => void;
  onDeleteDocument: (docId: string) => void;
  onDeleteProject: (projectId: string) => void;
}

const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({
  project,
  onBack,
  onToggleItem,
  onAddPhase,
  onAddItem,
  onDeleteItem,
  onDeletePhase,
  onUploadDocument,
  onDeleteDocument,
  onDeleteProject,
}) => {
  const [newPhaseName, setNewPhaseName] = useState('');
  const [showAddPhase, setShowAddPhase] = useState(false);
  const { toast } = useToast();

  const totalItems = project.phases.reduce((sum, p) => sum + p.items.length, 0);
  const completedItems = project.phases.reduce(
    (sum, p) => sum + p.items.filter(i => i.is_completed).length,
    0
  );
  const overallProgress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const shareUrl = `${window.location.origin}/project/${project.share_token}`;

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({ title: 'Link copied!', description: 'Share this link with your client' });
  };

  const handleAddPhase = () => {
    if (!newPhaseName.trim()) return;
    onAddPhase(project.id, newPhaseName.trim());
    setNewPhaseName('');
    setShowAddPhase(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-cyan-400 hover:text-cyan-300"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-lg font-mono font-bold text-cyan-300 tracking-wide">
              {project.project_name}
            </h2>
            <p className="text-[10px] font-mono text-cyan-400/50">
              Overall: {completedItems}/{totalItems} items • {overallProgress}% complete
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={copyShareLink}
            className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 text-xs font-mono"
          >
            <Share2 className="h-3 w-3 mr-1" />
            Share
            <Copy className="h-3 w-3 ml-1" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDeleteProject(project.id)}
            className="text-red-400/60 hover:text-red-400 text-xs font-mono"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Delete
          </Button>
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div className="holographic-panel rounded-lg p-3 border border-cyan-500/20">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-mono text-cyan-400/60 uppercase tracking-wider">Project Progress</span>
          <span className={`text-sm font-mono font-bold ${overallProgress === 100 ? 'text-green-400' : 'text-cyan-300'}`}>
            {overallProgress}%
          </span>
        </div>
        <div className="w-full bg-cyan-900/30 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              overallProgress === 100 ? 'bg-green-500' : 'bg-gradient-to-r from-cyan-500 to-blue-500'
            }`}
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* Phases */}
      <div className="space-y-3">
        {project.phases.map((phase) => (
          <ProjectPhaseCard
            key={phase.id}
            phase={phase}
            onToggleItem={onToggleItem}
            onAddItem={onAddItem}
            onDeleteItem={onDeleteItem}
            onDeletePhase={onDeletePhase}
            onUploadDocument={onUploadDocument}
            onDeleteDocument={onDeleteDocument}
          />
        ))}
      </div>

      {/* Add Phase */}
      {showAddPhase ? (
        <div className="flex items-center gap-2">
          <Input
            placeholder="Phase name..."
            value={newPhaseName}
            onChange={(e) => setNewPhaseName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddPhase()}
            className="h-8 text-xs bg-transparent border-cyan-500/20 text-cyan-300 placeholder:text-cyan-500/30 font-mono"
            autoFocus
          />
          <Button size="sm" onClick={handleAddPhase} className="text-xs font-mono">
            Add
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAddPhase(false)}
            className="text-xs text-cyan-400/60"
          >
            Cancel
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAddPhase(true)}
          className="border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/10 text-xs font-mono w-full"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Phase
        </Button>
      )}
    </div>
  );
};

export default ProjectDetailView;
