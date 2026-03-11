import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, FileText, Trash2, Download, ExternalLink } from 'lucide-react';

interface ProcurementDocument {
  id: string;
  file_name: string;
  file_url: string;
  file_size: number | null;
  file_type: string | null;
  created_at: string;
}

interface ProcurementDocumentsPanelProps {
  projectId: string;
}

const ProcurementDocumentsPanel: React.FC<ProcurementDocumentsPanelProps> = ({ projectId }) => {
  const { toast } = useToast();
  const [docs, setDocs] = useState<ProcurementDocument[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDocs();
  }, [projectId]);

  const fetchDocs = async () => {
    const { data } = await supabase
      .from('procurement_documents')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false }) as any;
    setDocs(data || []);
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const ext = file.name.split('.').pop();
        const path = `procurement/${projectId}/${Date.now()}-${file.name}`;
        const { error: uploadErr } = await supabase.storage.from('project-documents').upload(path, file);
        if (uploadErr) throw uploadErr;
        const { data: urlData } = supabase.storage.from('project-documents').getPublicUrl(path);

        await supabase.from('procurement_documents').insert({
          project_id: projectId,
          file_name: file.name,
          file_url: urlData.publicUrl,
          file_size: file.size,
          file_type: file.type || ext,
        } as any);
      }
      toast({ title: 'Documents uploaded' });
      fetchDocs();
    } catch (e: any) {
      toast({ title: 'Upload failed', description: e.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId: string) => {
    await supabase.from('procurement_documents').delete().eq('id', docId);
    toast({ title: 'Document removed' });
    fetchDocs();
  };

  return (
    <div className="holographic-panel rounded-lg p-4 border border-cyan-500/20 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-mono text-cyan-400/60 uppercase tracking-wider">
          Procurement Documents
        </h3>
        <Button
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 text-xs font-mono"
        >
          <Upload className="h-3 w-3 mr-1" />
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
        <input
          ref={fileRef}
          type="file"
          multiple
          className="hidden"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png,.dwg,.zip"
          onChange={e => { handleUpload(e.target.files); e.target.value = ''; }}
        />
      </div>

      {docs.length === 0 ? (
        <p className="text-[10px] font-mono text-cyan-400/40 text-center py-2">
          No procurement documents uploaded yet. Upload plans, specs, or scope documents for contractors to review.
        </p>
      ) : (
        <div className="space-y-1">
          {docs.map(doc => (
            <div key={doc.id} className="flex items-center gap-2 py-1.5 px-2 rounded bg-cyan-500/5 group">
              <FileText className="h-3 w-3 text-cyan-400/40 flex-shrink-0" />
              <span className="flex-1 text-[10px] font-mono text-cyan-300/70 truncate">
                {doc.file_name}
              </span>
              {doc.file_size && (
                <span className="text-[10px] text-cyan-500/40 font-mono">
                  {(doc.file_size / 1024).toFixed(0)}KB
                </span>
              )}
              <a
                href={doc.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300"
              >
                <Download className="h-3 w-3" />
              </a>
              <button
                onClick={() => handleDelete(doc.id)}
                className="text-red-400/40 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProcurementDocumentsPanel;
