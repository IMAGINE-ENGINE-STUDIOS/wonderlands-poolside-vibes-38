import React from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { ToolButton } from './ToolButton';
import { 
  poolTools, 
  landscapeTools, 
  waterFeaturesTools, 
  utilitiesTools,
  type DesignCategory,
  type ToolDefinition 
} from './featureTypes';

interface SubToolbarProps {
  category: DesignCategory;
  activeTool: string | null;
  onToolSelect: (tool: ToolDefinition) => void;
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

export function SubToolbar({ category, activeTool, onToolSelect }: SubToolbarProps) {
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
        <ScrollArea className="w-full">
          <div className="flex items-center gap-1 px-2 py-1.5">
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
      </div>
    </TooltipProvider>
  );
}
