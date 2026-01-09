import * as React from 'react';
import { CornerDownRight, Spline, Circle, PenTool, X, Check } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SplineDrawingToolbarProps {
  currentCurveType: 'linear' | 'curve' | 'arc' | 'freeform';
  pointCount: number;
  onCurveTypeChange: (type: 'linear' | 'curve' | 'arc' | 'freeform') => void;
  onCancel: () => void;
  onComplete: () => void;
  canComplete: boolean;
}

export function SplineDrawingToolbar({
  currentCurveType,
  pointCount,
  onCurveTypeChange,
  onCancel,
  onComplete,
  canComplete,
}: SplineDrawingToolbarProps) {
  const curveTypes = [
    { id: 'linear' as const, icon: CornerDownRight, tooltip: 'Straight line' },
    { id: 'curve' as const, icon: Spline, tooltip: 'Bezier curve' },
    { id: 'arc' as const, icon: Circle, tooltip: 'Circular arc' },
    { id: 'freeform' as const, icon: PenTool, tooltip: 'Freeform' },
  ];

  return (
    <div className="flex items-center gap-1 p-1 bg-background/95 backdrop-blur border border-border rounded-lg shadow-lg">
      {/* Curve type buttons */}
      {curveTypes.map((type) => {
        const Icon = type.icon;
        const isActive = currentCurveType === type.id;
        return (
          <TooltipProvider key={type.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onCurveTypeChange(type.id)}
                  className={`
                    w-7 h-7 flex items-center justify-center rounded transition-all
                    ${isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                {type.tooltip}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}
      
      <div className="w-px h-5 bg-border mx-0.5" />
      
      {/* Point count */}
      <span className="text-[10px] font-medium text-muted-foreground px-1 min-w-[20px] text-center">
        {pointCount}
      </span>
      
      <div className="w-px h-5 bg-border mx-0.5" />
      
      {/* Cancel */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onCancel}
              className="w-7 h-7 flex items-center justify-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            Cancel (Esc)
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      {/* Complete */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onComplete}
              disabled={!canComplete}
              className={`
                w-7 h-7 flex items-center justify-center rounded transition-all
                ${canComplete 
                  ? 'bg-green-500 text-white hover:bg-green-600' 
                  : 'text-muted-foreground/30 cursor-not-allowed'
                }
              `}
            >
              <Check className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            {canComplete ? 'Complete shape (Enter)' : 'Add 3+ points to complete'}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
