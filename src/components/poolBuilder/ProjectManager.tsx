import * as React from 'react';
const { useState, useEffect, useCallback } = React;
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FolderOpen, Save, Trash2, Plus, Clock, FileText, X } from 'lucide-react';

export interface SavedProject {
  id: string;
  name: string;
  savedAt: string;
  thumbnail?: string;
  data: any; // Full serialized project state
}

const STORAGE_KEY = 'wonderlands_studio_projects';
const AUTOSAVE_KEY = 'wonderlands_studio_autosave';

export function getAutoSave(): SavedProject | null {
  try {
    const raw = localStorage.getItem(AUTOSAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function setAutoSave(data: any) {
  try {
    const project: SavedProject = {
      id: 'autosave',
      name: 'Auto-Save',
      savedAt: new Date().toISOString(),
      data,
    };
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(project));
  } catch (e) {
    console.warn('Auto-save failed:', e);
  }
}

export function getSavedProjects(): SavedProject[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveProjectList(projects: SavedProject[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

interface ProjectManagerProps {
  onLoadProject: (data: any) => void;
  onSaveProject: () => any; // Returns current project state
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  lastSaved?: string;
}

export function ProjectManager({ onLoadProject, onSaveProject, isOpen, onOpenChange, lastSaved }: ProjectManagerProps) {
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [newName, setNewName] = useState('');
  const [tab, setTab] = useState<'saved' | 'new'>('saved');

  useEffect(() => {
    if (isOpen) {
      setProjects(getSavedProjects());
    }
  }, [isOpen]);

  const handleSaveNew = useCallback(() => {
    const name = newName.trim() || `Project ${new Date().toLocaleDateString()}`;
    const data = onSaveProject();
    const project: SavedProject = {
      id: `proj_${Date.now()}`,
      name,
      savedAt: new Date().toISOString(),
      data,
    };
    const updated = [project, ...projects];
    saveProjectList(updated);
    setProjects(updated);
    setNewName('');
    setTab('saved');
  }, [newName, onSaveProject, projects]);

  const handleLoad = useCallback((project: SavedProject) => {
    onLoadProject(project.data);
    onOpenChange(false);
  }, [onLoadProject, onOpenChange]);

  const handleDelete = useCallback((id: string) => {
    const updated = projects.filter(p => p.id !== id);
    saveProjectList(updated);
    setProjects(updated);
  }, [projects]);

  const handleLoadAutoSave = useCallback(() => {
    const auto = getAutoSave();
    if (auto) {
      onLoadProject(auto.data);
      onOpenChange(false);
    }
  }, [onLoadProject, onOpenChange]);

  const autoSave = getAutoSave();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <FolderOpen className="w-5 h-5" />
            Project Manager
          </DialogTitle>
        </DialogHeader>

        {/* Tab buttons */}
        <div className="flex gap-1 border-b border-border pb-2">
          <button
            onClick={() => setTab('saved')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              tab === 'saved' ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Saved Projects ({projects.length})
          </button>
          <button
            onClick={() => setTab('new')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              tab === 'new' ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Save Current
          </button>
        </div>

        {tab === 'saved' ? (
          <ScrollArea className="max-h-[400px]">
            <div className="space-y-2">
              {/* Auto-save recovery */}
              {autoSave && (
                <button
                  onClick={handleLoadAutoSave}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-all text-left"
                >
                  <Clock className="w-5 h-5 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground">Last Session (Auto-Save)</div>
                    <div className="text-[10px] text-muted-foreground">
                      {new Date(autoSave.savedAt).toLocaleString()}
                    </div>
                  </div>
                </button>
              )}

              {projects.length === 0 && !autoSave && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No saved projects yet. Save your current design to get started.
                </div>
              )}

              {projects.map(project => (
                <div
                  key={project.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border/30 hover:bg-muted/40 transition-all group"
                >
                  <FileText className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  <button
                    onClick={() => handleLoad(project)}
                    className="flex-1 min-w-0 text-left"
                  >
                    <div className="text-sm font-medium text-foreground truncate">{project.name}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {new Date(project.savedAt).toLocaleString()}
                    </div>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(project.id); }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-sm">Project Name</Label>
              <Input
                placeholder={`Project ${new Date().toLocaleDateString()}`}
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSaveNew()}
              />
            </div>
            <Button onClick={handleSaveNew} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              Save Project
            </Button>
          </div>
        )}

        {lastSaved && (
          <div className="text-[10px] text-muted-foreground text-center pt-1 border-t border-border/30">
            Last auto-saved: {new Date(lastSaved).toLocaleTimeString()}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
