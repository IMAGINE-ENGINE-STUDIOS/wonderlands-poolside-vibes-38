import React from 'react';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import type { ToolDefinition } from './featureTypes';

interface ToolButtonProps {
  tool: ToolDefinition;
  isActive: boolean;
  onClick: () => void;
}

export function ToolButton({ tool, isActive, onClick }: ToolButtonProps) {
  // Dynamically get the icon component
  const IconComponent = (LucideIcons as any)[tool.icon] || LucideIcons.Circle;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={isActive ? 'secondary' : 'ghost'}
          size="sm"
          onClick={onClick}
          className={cn(
            'relative flex flex-col items-center justify-center h-14 w-14 gap-0.5 p-1',
            isActive && 'bg-secondary ring-1 ring-primary/50'
          )}
        >
          <IconComponent className="h-5 w-5" />
          <span className="text-[10px] leading-tight text-center truncate w-full">
            {tool.name}
          </span>
          {tool.isNew && (
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <div className="flex items-center gap-2">
          <p className="font-medium">{tool.name}</p>
          {tool.isNew && <Badge variant="secondary" className="text-[10px] px-1 py-0">New</Badge>}
        </div>
        {tool.description && (
          <p className="text-xs text-muted-foreground">{tool.description}</p>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
