import { Info } from 'lucide-react';

export function SplineLegend() {
  return (
    <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg p-4 shadow-xl">
      <div className="flex items-center gap-2 mb-3">
        <Info className="w-4 h-4 text-primary" />
        <h4 className="font-semibold text-sm">Pool Shape Editor Guide</h4>
      </div>
      
      <div className="space-y-2 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 bg-green-500 rounded-full" />
          <div>
            <div className="font-medium">Linear Point</div>
            <div className="text-muted-foreground">Straight edges</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 bg-cyan-500" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }} />
          <div>
            <div className="font-medium">Curve Point</div>
            <div className="text-muted-foreground">Smooth curves</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 bg-magenta-500 rounded" style={{ clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }} />
          <div>
            <div className="font-medium">Smooth Point</div>
            <div className="text-muted-foreground">Very smooth curves</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 bg-orange-500" />
          <div>
            <div className="font-medium">Corner Point</div>
            <div className="text-muted-foreground">Sharp corners</div>
          </div>
        </div>
        
        <div className="pt-2 mt-2 border-t border-border space-y-1">
          <div className="text-muted-foreground">• Drag points to move</div>
          <div className="text-muted-foreground">• Click + to add points</div>
          <div className="text-muted-foreground">• Click X to delete points</div>
          <div className="text-muted-foreground">• Click type to change</div>
        </div>
      </div>
    </div>
  );
}
