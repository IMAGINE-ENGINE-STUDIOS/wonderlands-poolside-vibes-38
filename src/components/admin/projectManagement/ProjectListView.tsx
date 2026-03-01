import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, FolderOpen, Calendar, ArrowRight } from 'lucide-react';
import type { ConstructionProject } from './useProjectManagement';

interface ProjectListViewProps {
  projects: ConstructionProject[];
  loading: boolean;
  onSelectProject: (id: string) => void;
  onCreateProject: (name: string) => void;
}

const ProjectListView: React.FC<ProjectListViewProps> = ({
  projects,
  loading,
  onSelectProject,
  onCreateProject,
}) => {
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');

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
        <div className="grid gap-3">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="holographic-panel border-cyan-500/20 hover:border-cyan-500/40 cursor-pointer transition-all group"
              onClick={() => onSelectProject(project.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FolderOpen className="h-5 w-5 text-cyan-400/60" />
                    <div>
                      <h3 className="text-sm font-mono font-medium text-cyan-300">
                        {project.project_name}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Calendar className="h-3 w-3 text-cyan-500/40" />
                        <span className="text-[10px] font-mono text-cyan-400/50">
                          {new Date(project.created_at).toLocaleDateString()}
                        </span>
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                          project.status === 'active'
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-cyan-500/10 text-cyan-400'
                        }`}>
                          {project.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-cyan-400/30 group-hover:text-cyan-400 transition-colors" />
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
