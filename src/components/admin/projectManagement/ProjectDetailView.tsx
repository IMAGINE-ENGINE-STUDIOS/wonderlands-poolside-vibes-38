import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Plus, Share2, Copy, Trash2, Mail, Link, Send, ImagePlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
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
  onUpdateCoverImage: (projectId: string, file: File) => void;
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
  onUpdateCoverImage,
}) => {
  const [newPhaseName, setNewPhaseName] = useState('');
  const [showAddPhase, setShowAddPhase] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const coverInputRef = React.useRef<HTMLInputElement>(null);
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
    toast({ title: 'Link copied!', description: 'Share this private link with your client' });
  };

  const sendShareEmail = async () => {
    if (!shareEmail.trim()) return;
    setSendingEmail(true);
    try {
      const { data, error } = await supabase.functions.invoke('share-project-email', {
        body: {
          email: shareEmail.trim(),
          projectName: project.project_name,
          shareUrl,
        },
      });

      if (error) throw error;

      toast({ title: 'Email sent!', description: `Project link sent to ${shareEmail}` });
      setShareEmail('');
      setShowShareDialog(false);
    } catch (e: any) {
      toast({ title: 'Failed to send', description: e.message, variant: 'destructive' });
    } finally {
      setSendingEmail(false);
    }
  };

  const handleAddPhase = () => {
    if (!newPhaseName.trim()) return;
    onAddPhase(project.id, newPhaseName.trim());
    setNewPhaseName('');
    setShowAddPhase(false);
  };

  return (
    <div className="space-y-4">
      {/* Cover Image */}
      <div className="relative rounded-lg overflow-hidden group">
        {project.cover_image_url ? (
          <div className="aspect-[3/1] w-full">
            <img
              src={project.cover_image_url}
              alt={project.project_name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
          </div>
        ) : (
          <div className="aspect-[3/1] w-full bg-cyan-900/10 border border-dashed border-cyan-500/20 flex items-center justify-center">
            <div className="text-center">
              <ImagePlus className="h-6 w-6 text-cyan-500/30 mx-auto mb-1" />
              <span className="text-[10px] font-mono text-cyan-500/30">Add cover image</span>
            </div>
          </div>
        )}
        <button
          className="absolute top-2 right-2 p-1.5 rounded bg-black/60 text-cyan-400/60 hover:text-cyan-300 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => coverInputRef.current?.click()}
        >
          <ImagePlus className="h-4 w-4" />
        </button>
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onUpdateCoverImage(project.id, f);
            e.target.value = '';
          }}
        />
      </div>

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
            onClick={() => setShowShareDialog(true)}
            className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 text-xs font-mono"
          >
            <Share2 className="h-3 w-3 mr-1" />
            Share
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

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-md bg-[#0d0d15] border-cyan-500/30">
          <DialogHeader>
            <DialogTitle className="text-cyan-300 font-mono flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Share Project
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-xs font-mono text-cyan-400/60">
              Share this project with your client. They'll only see this project — all others remain private.
            </p>

            {/* Copy Link */}
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-cyan-400/50 uppercase tracking-wider">
                Share via Link
              </label>
              <div className="flex gap-2">
                <Input
                  value={shareUrl}
                  readOnly
                  className="h-8 text-[10px] bg-cyan-500/5 border-cyan-500/20 text-cyan-300 font-mono"
                />
                <Button
                  size="sm"
                  onClick={copyShareLink}
                  className="bg-cyan-600 hover:bg-cyan-500 text-xs font-mono"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </Button>
              </div>
            </div>

            {/* Email Share */}
            <div className="space-y-2 pt-2 border-t border-cyan-500/10">
              <label className="text-[10px] font-mono text-cyan-400/50 uppercase tracking-wider">
                Share via Email
              </label>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="client@example.com"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendShareEmail()}
                  className="h-8 text-xs bg-transparent border-cyan-500/20 text-cyan-300 placeholder:text-cyan-500/30 font-mono"
                />
                <Button
                  size="sm"
                  onClick={sendShareEmail}
                  disabled={sendingEmail || !shareEmail.trim()}
                  className="bg-cyan-600 hover:bg-cyan-500 text-xs font-mono"
                >
                  {sendingEmail ? (
                    <div className="animate-spin h-3 w-3 border-b border-white rounded-full" />
                  ) : (
                    <>
                      <Send className="h-3 w-3 mr-1" />
                      Send
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-2 mt-2 p-2 rounded bg-cyan-500/5 border border-cyan-500/10">
              <Link className="h-3 w-3 text-cyan-400/40 mt-0.5 flex-shrink-0" />
              <p className="text-[10px] font-mono text-cyan-400/40">
                This link is private. Only people with this link can view the project progress. They cannot see any other projects.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
