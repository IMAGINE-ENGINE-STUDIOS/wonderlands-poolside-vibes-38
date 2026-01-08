import React from 'react';
import { Home, Building2 } from 'lucide-react';
import { useProjectType, ProjectType } from '@/contexts/ProjectTypeContext';
import { cn } from '@/lib/utils';
interface ProjectTypeToggleProps {
  className?: string;
  showPriceNote?: boolean;
}
export default function ProjectTypeToggle({
  className,
  showPriceNote = true
}: ProjectTypeToggleProps) {
  const {
    projectType,
    setProjectType
  } = useProjectType();
  const options: {
    value: ProjectType;
    label: string;
    icon: React.ReactNode;
  }[] = [{
    value: 'residential',
    label: 'Residential',
    icon: <Home className="h-4 w-4" />
  }, {
    value: 'commercial',
    label: 'Commercial',
    icon: <Building2 className="h-4 w-4" />
  }];
  return <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
        {options.map(option => <button key={option.value} onClick={() => setProjectType(option.value)} className={cn("flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all flex-1 justify-center", projectType === option.value ? option.value === 'residential' ? "bg-primary text-primary-foreground shadow-sm" : "bg-amber-500 text-white shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-background/50")}>
            {option.icon}
            <span>{option.label}</span>
          </button>)}
      </div>
      {showPriceNote && projectType === 'commercial' && <p className="text-xs text-amber-600 font-medium text-center">COMMERCIAL PROJECTS </p>}
    </div>;
}