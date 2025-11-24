import { useEffect, useState } from 'react';
import { Check, Save, Cloud } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AutoSaveIndicatorProps {
  lastSaved: number | null;
  isSaving: boolean;
  className?: string;
}

export function AutoSaveIndicator({ lastSaved, isSaving, className }: AutoSaveIndicatorProps) {
  const [timeSince, setTimeSince] = useState<string>('');

  useEffect(() => {
    if (!lastSaved) {
      setTimeSince('Never');
      return;
    }

    const updateTimeSince = () => {
      const seconds = Math.floor((Date.now() - lastSaved) / 1000);
      
      if (seconds < 10) {
        setTimeSince('Just now');
      } else if (seconds < 60) {
        setTimeSince(`${seconds}s ago`);
      } else if (seconds < 3600) {
        const minutes = Math.floor(seconds / 60);
        setTimeSince(`${minutes}m ago`);
      } else {
        const hours = Math.floor(seconds / 3600);
        setTimeSince(`${hours}h ago`);
      }
    };

    updateTimeSince();
    const interval = setInterval(updateTimeSince, 1000);

    return () => clearInterval(interval);
  }, [lastSaved]);

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs transition-all",
      isSaving 
        ? "bg-primary/10 border-primary/20 text-primary" 
        : lastSaved 
          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
          : "bg-muted border-border text-muted-foreground",
      className
    )}>
      {isSaving ? (
        <>
          <Save className="h-3 w-3 animate-pulse" />
          <span className="font-medium">Saving...</span>
        </>
      ) : lastSaved ? (
        <>
          <Check className="h-3 w-3" />
          <span className="font-medium">
            Saved {timeSince}
          </span>
        </>
      ) : (
        <>
          <Cloud className="h-3 w-3" />
          <span>Not saved</span>
        </>
      )}
    </div>
  );
}
