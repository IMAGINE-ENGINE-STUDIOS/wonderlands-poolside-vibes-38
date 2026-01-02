import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ProjectType = 'residential' | 'commercial';

interface ProjectTypeContextType {
  projectType: ProjectType;
  setProjectType: (type: ProjectType) => void;
  priceMultiplier: number;
}

const ProjectTypeContext = createContext<ProjectTypeContextType | undefined>(undefined);

const STORAGE_KEY = 'project-type';

export function ProjectTypeProvider({ children }: { children: ReactNode }) {
  const [projectType, setProjectTypeState] = useState<ProjectType>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'commercial' || stored === 'residential') {
        return stored;
      }
    }
    return 'residential';
  });

  const priceMultiplier = projectType === 'commercial' ? 3 : 1;

  const setProjectType = (type: ProjectType) => {
    setProjectTypeState(type);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, type);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, projectType);
    }
  }, [projectType]);

  return (
    <ProjectTypeContext.Provider value={{ projectType, setProjectType, priceMultiplier }}>
      {children}
    </ProjectTypeContext.Provider>
  );
}

export function useProjectType() {
  const context = useContext(ProjectTypeContext);
  if (context === undefined) {
    throw new Error('useProjectType must be used within a ProjectTypeProvider');
  }
  return context;
}
