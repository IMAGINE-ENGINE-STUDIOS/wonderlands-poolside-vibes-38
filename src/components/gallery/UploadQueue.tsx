import { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { formatSize } from './galleryUtils';

export interface UploadQueueItem {
  id: string;
  file: File;
  status: 'queued' | 'uploading' | 'done' | 'error';
  progress: number;
  error?: string;
}

interface UploadQueueProps {
  items: UploadQueueItem[];
  onDismiss: (id: string) => void;
  onClearCompleted: () => void;
}

const UploadQueue = ({ items, onDismiss, onClearCompleted }: UploadQueueProps) => {
  const [expanded, setExpanded] = useState(false);
  const [nearCorner, setNearCorner] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const threshold = 120;
      const nearRight = window.innerWidth - e.clientX < threshold;
      const nearBottom = window.innerHeight - e.clientY < 300;
      setNearCorner(nearRight && nearBottom);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Auto-expand when items are added
  useEffect(() => {
    if (items.some(i => i.status === 'uploading' || i.status === 'queued')) {
      setExpanded(true);
    }
  }, [items]);

  const hasItems = items.length > 0;
  const activeCount = items.filter(i => i.status === 'uploading' || i.status === 'queued').length;
  const doneCount = items.filter(i => i.status === 'done').length;
  const isVisible = hasItems && (expanded || nearCorner);

  if (!hasItems) return null;

  return (
    <div
      className={`fixed right-0 bottom-8 z-50 transition-all duration-300 ease-in-out ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-[calc(100%-12px)] opacity-40'
      }`}
      onMouseEnter={() => setNearCorner(true)}
      onMouseLeave={() => { if (!expanded) setNearCorner(false); }}
    >
      {/* Tab/handle visible when collapsed */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={`absolute -left-8 top-2 h-8 w-8 rounded-l-lg bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors ${
          isVisible ? '' : 'animate-pulse'
        }`}
      >
        {expanded ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        {activeCount > 0 && (
          <span className="absolute -top-1.5 -left-1.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-bold">
            {activeCount}
          </span>
        )}
      </button>

      <div className="w-72 bg-popover border border-border rounded-l-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-3 py-2.5 bg-muted/50 border-b border-border flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground">
            Upload Queue {activeCount > 0 ? `(${activeCount} active)` : `(${doneCount} done)`}
          </span>
          <div className="flex items-center gap-1">
            {doneCount > 0 && (
              <button
                onClick={onClearCompleted}
                className="text-[10px] text-muted-foreground hover:text-foreground px-1.5 py-0.5 rounded hover:bg-accent transition-colors"
              >
                Clear done
              </button>
            )}
            <button onClick={() => setExpanded(false)} className="text-muted-foreground hover:text-foreground p-0.5 rounded hover:bg-accent">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Items list */}
        <div className="max-h-64 overflow-y-auto">
          {items.map(item => (
            <div key={item.id} className="px-3 py-2 border-b border-border/50 last:border-0">
              <div className="flex items-center gap-2 mb-1">
                {item.status === 'uploading' && <Loader2 className="h-3.5 w-3.5 text-primary animate-spin shrink-0" />}
                {item.status === 'queued' && <Loader2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
                {item.status === 'done' && <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />}
                {item.status === 'error' && <AlertCircle className="h-3.5 w-3.5 text-destructive shrink-0" />}
                <span className="text-xs text-foreground truncate flex-1">{item.file.name}</span>
                <span className="text-[10px] text-muted-foreground shrink-0">{formatSize(item.file.size)}</span>
                {(item.status === 'done' || item.status === 'error') && (
                  <button onClick={() => onDismiss(item.id)} className="text-muted-foreground hover:text-foreground">
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
              {(item.status === 'uploading' || item.status === 'queued') && (
                <Progress value={item.progress} className="h-1" />
              )}
              {item.error && <p className="text-[10px] text-destructive mt-0.5">{item.error}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UploadQueue;
