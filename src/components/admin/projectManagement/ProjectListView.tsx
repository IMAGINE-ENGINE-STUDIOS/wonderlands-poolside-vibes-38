import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, FolderOpen, Calendar, ArrowRight, ImagePlus } from 'lucide-react';
import type { ConstructionProject } from './useProjectManagement';

interface ProjectListViewProps {
  projects: ConstructionProject[];
  loading: boolean;
  onSelectProject: (id: string) => void;
  onCreateProject: (name: string) => void;
  onUpdateCoverImage: (projectId: string, file: File) => void;
}

const ProjectListView: React.FC<ProjectListViewProps> = ({
  projects,
  loading,
  onSelectProject,
  onCreateProject,
  onUpdateCoverImage,
}) => {
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const coverInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleCreate = () => {
    if (!newName.trim()) return;
    onCreateProject(newName.trim());
    setNewName('');
    setShowCreate(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-mono font-bold text-cyan-300 uppercase tracking-wider">
          Construction Projects
        </h2>
        <Button
          size="sm"
          onClick={() => setShowCreate(true)}
          className="text-xs font-mono bg-cyan-600 hover:bg-cyan-500"
        >
          <Plus className="h-3 w-3 mr-1" />
          New Project
        </Button>
      </div>

      {showCreate && (
        <Card className="holographic-panel border-cyan-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Project name..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                className="h-8 text-xs bg-transparent border-cyan-500/20 text-cyan-300 placeholder:text-cyan-500/30 font-mono"
                autoFocus
              />
              <Button size="sm" onClick={handleCreate} className="text-xs font-mono">
                Create
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCreate(false)}
                className="text-xs text-cyan-400/60"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {projects.length === 0 ? (
        <div className="text-center py-12">
          <FolderOpen className="h-10 w-10 text-cyan-500/30 mx-auto mb-3" />
          <p className="text-xs font-mono text-cyan-400/50">No projects yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="holographic-panel border-cyan-500/20 hover:border-cyan-500/40 cursor-pointer transition-all group overflow-hidden"
              onClick={() => onSelectProject(project.id)}
            >
              {/* Cover Image */}
              <div className="relative aspect-video bg-cyan-900/10 overflow-hidden">
                {project.cover_image_url ? (
                  <img
                    src={project.cover_image_url}
                    alt={project.project_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                    <FolderOpen className="h-8 w-8 text-cyan-500/20" />
                    <span className="text-[10px] font-mono text-cyan-500/30">No cover image</span>
                  </div>
                )}
                {/* Upload cover button */}
                <button
                  className="absolute top-2 right-2 p-1.5 rounded bg-black/60 text-cyan-400/60 hover:text-cyan-300 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    coverInputRefs.current[project.id]?.click();
                  }}
                >
                  <ImagePlus className="h-3.5 w-3.5" />
                </button>
                <input
                  ref={(el) => { coverInputRefs.current[project.id] = el; }}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onUpdateCoverImage(project.id, f);
                    e.target.value = '';
                  }}
                />
                {/* Gradient overlay */}
                <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/80 to-transparent" />
              </div>

              <CardContent className="p-3">
                <h3 className="text-sm font-mono font-medium text-cyan-300 truncate">
                  {project.project_name}
                </h3>
                <div className="flex items-center justify-between mt-1.5">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3 text-cyan-500/40" />
                    <span className="text-[10px] font-mono text-cyan-400/50">
                      {new Date(project.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      project.status === 'active'
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-cyan-500/10 text-cyan-400'
                    }`}>
                      {project.status}
                    </span>
                    <ArrowRight className="h-3 w-3 text-cyan-400/30 group-hover:text-cyan-400 transition-colors" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectListView;
