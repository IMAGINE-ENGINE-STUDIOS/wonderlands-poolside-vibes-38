import React from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { ToolButton } from './ToolButton';
import { Ruler } from 'lucide-react';
import { 
  poolTools, 
  landscapeTools, 
  waterFeaturesTools, 
  utilitiesTools,
  type DesignCategory,
  type ToolDefinition 
} from './featureTypes';

interface PoolStats {
  perimeter: number;
  area: number;
  corners: number;
  features: number;
  deckArea: number;
  totalCost: number;
}

interface SubToolbarProps {
  category: DesignCategory;
  activeTool: string | null;
  onToolSelect: (tool: ToolDefinition) => void;
  stats?: PoolStats | null;
  hideTools?: boolean;
}

const getToolsForCategory = (category: DesignCategory): ToolDefinition[] => {
  switch (category) {
    case 'pool':
      return poolTools;
    case 'landscape':
      return landscapeTools;
    case 'water-features':
      return waterFeaturesTools;
    case 'utilities':
      return utilitiesTools;
    case 'terrain':
      return []; // Terrain uses the existing TerrainEditor
    default:
      return [];
  }
};

export function SubToolbar({ category, activeTool, onToolSelect, stats }: SubToolbarProps) {
  const tools = getToolsForCategory(category);

  if (category === 'terrain') {
    return (
      <div className="flex items-center justify-center h-16 px-4 bg-background border-b text-sm text-muted-foreground">
        Use the Terrain panel on the left to manage 3D terrain, sky, and nature assets.
      </div>
    );
  }

  if (tools.length === 0) {
    return null;
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="bg-background border-b">
        <div className="flex items-center px-2 py-1.5">
          <ScrollArea className="flex-1">
            <div className="flex items-center gap-1">
              {tools.map((tool) => (
                <ToolButton
                  key={tool.id}
                  tool={tool}
                  isActive={activeTool === tool.id}
                  onClick={() => onToolSelect(tool)}
                />
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
          
          {/* Stats Bar */}
          {stats && (
            <div className="flex items-center gap-4 ml-4 pl-4 border-l">
              <div className="flex items-center gap-1 text-xs">
                <Ruler className="h-3 w-3" />
                <span className="font-bold">{stats.perimeter.toFixed(1)}</span>
                <span className="text-muted-foreground">ft</span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <span className="font-bold">{stats.area.toFixed(1)}</span>
                <span className="text-muted-foreground">sq ft pool</span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <span className="font-bold">{stats.corners}</span>
                <span className="text-muted-foreground">corners</span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <span className="font-bold">{stats.features}</span>
                <span className="text-muted-foreground">features</span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <span className="font-bold">{stats.deckArea.toFixed(1)}</span>
                <span className="text-muted-foreground">sq ft deck</span>
              </div>
              <div className="h-5 w-px bg-border" />
              <div className="flex items-center gap-1 text-xs font-semibold text-primary">
                <span className="text-muted-foreground">Total:</span>
                <span className="text-lg">${stats.totalCost.toLocaleString('en-US', {
                  maximumFractionDigits: 0
                })}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
