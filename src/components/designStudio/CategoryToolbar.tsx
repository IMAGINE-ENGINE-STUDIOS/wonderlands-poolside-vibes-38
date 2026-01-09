import React from 'react';
import { cn } from '@/lib/utils';
import { 
  Waves, 
  TreeDeciduous, 
  Droplets, 
  Mountain, 
  Wrench 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { DesignCategory } from './featureTypes';

interface CategoryToolbarProps {
  activeCategory: DesignCategory;
  onCategoryChange: (category: DesignCategory) => void;
}

const categories: { id: DesignCategory; name: string; icon: React.ReactNode }[] = [
  { id: 'pool', name: 'Swimming Pool', icon: <Waves className="h-4 w-4" /> },
  { id: 'landscape', name: 'Landscape', icon: <TreeDeciduous className="h-4 w-4" /> },
  { id: 'water-features', name: 'Water Features', icon: <Droplets className="h-4 w-4" /> },
  { id: 'terrain', name: 'Terrain', icon: <Mountain className="h-4 w-4" /> },
  { id: 'utilities', name: 'Utilities', icon: <Wrench className="h-4 w-4" /> },
];

export function CategoryToolbar({ activeCategory, onCategoryChange }: CategoryToolbarProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center gap-1 px-2 py-1.5 bg-muted/50 border-b">
        {categories.map((category) => (
          <Tooltip key={category.id}>
            <TooltipTrigger asChild>
              <Button
                variant={activeCategory === category.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onCategoryChange(category.id)}
                className={cn(
                  'gap-2 h-8 px-3',
                  activeCategory === category.id && 'bg-primary text-primary-foreground'
                )}
              >
                {category.icon}
                <span className="hidden sm:inline text-xs font-medium">{category.name}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="sm:hidden">
              {category.name}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
