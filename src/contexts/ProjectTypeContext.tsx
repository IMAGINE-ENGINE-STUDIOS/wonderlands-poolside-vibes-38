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
  // Commercial mode disabled - always use residential
  const projectType: ProjectType = 'residential';

  // Always use residential pricing (multiplier = 1)
  const priceMultiplier = 1;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const setProjectType = (_type: ProjectType) => {
    // Commercial mode disabled - do nothing
  };

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
