import React, { createContext, useContext, ReactNode } from 'react';
import { Scene3D, TextureConfig } from '@/components/scene3d/types';
import { useSceneCache } from '@/hooks/useSceneCache';

interface TextureLibrary {
  finishes: TextureConfig[];
  pavers: TextureConfig[];
  coping: TextureConfig[];
}

interface SceneContextType {
  scene: Scene3D;
  setScene: (scene: Scene3D | ((prev: Scene3D) => Scene3D)) => void;
  textureLibrary: TextureLibrary;
  setTextureLibrary: (library: TextureLibrary) => void;
  save: () => void;
  clearCache: () => void;
  lastSaved: number | null;
  timeSinceLastSave: number | null;
  isSaving: boolean;
  hasCachedData: boolean;
}

const SceneContext = createContext<SceneContextType | undefined>(undefined);

interface SceneProviderProps {
  children: ReactNode;
  initialScene: Scene3D;
  initialTextureLibrary: TextureLibrary;
  productId?: string;
  productModel?: string;
  autoSave?: boolean;
}

export function SceneProvider({
  children,
  initialScene,
  initialTextureLibrary,
  productId,
  productModel,
  autoSave = true
}: SceneProviderProps) {
  const [textureLibrary, setTextureLibrary] = React.useState<TextureLibrary>(initialTextureLibrary);
  
  const {
    scene,
    setScene,
    save,
    clearCache,
    lastSaved,
    timeSinceLastSave,
    isSaving,
    hasCachedData
  } = useSceneCache(initialScene, {
    productId,
    productModel,
    autoSave
  });

  const value: SceneContextType = {
    scene,
    setScene,
    textureLibrary,
    setTextureLibrary,
    save,
    clearCache,
    lastSaved,
    timeSinceLastSave,
    isSaving,
    hasCachedData
  };

  return (
    <SceneContext.Provider value={value}>
      {children}
    </SceneContext.Provider>
  );
}

export function useScene() {
  const context = useContext(SceneContext);
  if (context === undefined) {
    throw new Error('useScene must be used within a SceneProvider');
  }
  return context;
}
