import * as React from 'react';
import { CornerDownRight, Spline, Circle, X, Trash2 } from 'lucide-react';

interface SplinePoint {
  x: number;
  y: number;
  id: string;
  curveType: 'linear' | 'curve' | 'arc';
}

interface SplinePointEditorProps {
  point: SplinePoint;
  pointIndex: number;
  position: { x: number; y: number };
  onCurveTypeChange: (pointId: string, curveType: 'linear' | 'curve' | 'arc') => void;
  onDeletePoint: (pointId: string) => void;
  onClose: () => void;
}

export function SplinePointEditor({
  point,
  pointIndex,
  position,
  onCurveTypeChange,
  onDeletePoint,
  onClose,
}: SplinePointEditorProps) {
  const curveTypes = [
    { id: 'linear', label: 'Straight', icon: CornerDownRight, description: 'Sharp corner' },
    { id: 'curve', label: 'Curve', icon: Spline, description: 'Smooth bezier' },
    { id: 'arc', label: 'Arc', icon: Circle, description: 'Circular arc' },
  ] as const;

  return (
    <div
      className="fixed z-[100] animate-in fade-in-0 zoom-in-95 duration-150"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -100%) translateY(-12px)',
      }}
    >
      {/* Backdrop click handler */}
      <div
        className="fixed inset-0 z-[-1]"
        onClick={onClose}
      />
      
      {/* Editor Panel - styled like 3D viewer texture editors */}
      <div className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-2xl overflow-hidden min-w-[200px]">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 bg-muted/30 border-b border-border/30">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
              {pointIndex + 1}
            </div>
            <span className="text-xs font-medium text-foreground">Point Settings</span>
          </div>
          <button
            onClick={onClose}
            className="w-5 h-5 rounded-md hover:bg-muted flex items-center justify-center transition-colors"
          >
            <X className="w-3 h-3 text-muted-foreground" />
          </button>
        </div>

        {/* Curve Type Selection */}
        <div className="p-2 space-y-2">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider px-1">Curvature</p>
          
          <div className="space-y-1">
            {curveTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = point.curveType === type.id;
              
              return (
                <button
                  key={type.id}
                  onClick={() => onCurveTypeChange(point.id, type.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all
                    ${isSelected 
                      ? 'bg-primary/15 border border-primary/30 text-primary' 
                      : 'bg-muted/20 border border-transparent hover:bg-muted/40 text-foreground'
                    }
                  `}
                >
                  <div className={`
                    w-7 h-7 rounded-md flex items-center justify-center transition-colors
                    ${isSelected ? 'bg-primary/20' : 'bg-muted/50'}
                  `}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-xs font-medium">{type.label}</p>
                    <p className="text-[10px] text-muted-foreground">{type.description}</p>
                  </div>
                  {isSelected && (
                    <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Delete Action */}
        <div className="px-2 pb-2">
          <button
            onClick={() => onDeletePoint(point.id)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">Delete Point</span>
          </button>
        </div>
      </div>

      {/* Arrow pointer */}
      <div
        className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-full"
        style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' }}
      >
        <svg width="16" height="8" viewBox="0 0 16 8" className="fill-background stroke-border/50">
          <path d="M0 0 L8 8 L16 0" strokeWidth="1" />
        </svg>
      </div>
    </div>
  );
}
