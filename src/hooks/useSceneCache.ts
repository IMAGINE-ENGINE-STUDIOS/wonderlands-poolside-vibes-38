import { useState, useEffect, useCallback, useRef } from 'react';
import { Scene3D } from '@/components/scene3d/types';

const CACHE_KEY_PREFIX = 'pool-scene-cache-';
const AUTO_SAVE_INTERVAL = 5000; // Auto-save every 5 seconds
const MAX_CACHE_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

interface CachedScene {
  scene: Scene3D;
  timestamp: number;
  productId?: string;
  productModel?: string;
}

interface UseSceneCacheOptions {
  productId?: string;
  productModel?: string;
  autoSave?: boolean;
  autoSaveInterval?: number;
}

/**
 * Hook for caching and auto-saving pool scene configurations
 * Stores scenes in localStorage with automatic cleanup of old caches
 */
export function useSceneCache(
  initialScene: Scene3D,
  options: UseSceneCacheOptions = {}
) {
  const {
    productId,
    productModel,
    autoSave = true,
    autoSaveInterval = AUTO_SAVE_INTERVAL
  } = options;

  const [scene, setScene] = useState<Scene3D>(initialScene);
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sceneRef = useRef(scene);

  // Update ref when scene changes
  useEffect(() => {
    sceneRef.current = scene;
  }, [scene]);

  // Generate cache key
  const getCacheKey = useCallback(() => {
    if (productId) {
      return `${CACHE_KEY_PREFIX}${productId}`;
    } else if (productModel) {
      return `${CACHE_KEY_PREFIX}model-${productModel}`;
    }
    return `${CACHE_KEY_PREFIX}custom-pool`;
  }, [productId, productModel]);

  // Save scene to cache
  const saveToCache = useCallback((sceneToSave: Scene3D, silent = false) => {
    try {
      const cacheKey = getCacheKey();
      const cachedData: CachedScene = {
        scene: sceneToSave,
        timestamp: Date.now(),
        productId,
        productModel
      };
      
      localStorage.setItem(cacheKey, JSON.stringify(cachedData));
      setLastSaved(cachedData.timestamp);
      
      if (!silent) {
        setIsSaving(true);
        setTimeout(() => setIsSaving(false), 500);
      }
      
      console.log('💾 Scene saved to cache:', cacheKey);
    } catch (error) {
      console.error('Failed to save scene to cache:', error);
    }
  }, [getCacheKey, productId, productModel]);

  // Load scene from cache
  const loadFromCache = useCallback((): CachedScene | null => {
    try {
      const cacheKey = getCacheKey();
      const cached = localStorage.getItem(cacheKey);
      
      if (!cached) return null;
      
      const cachedData: CachedScene = JSON.parse(cached);
      
      // Check if cache is too old
      const age = Date.now() - cachedData.timestamp;
      if (age > MAX_CACHE_AGE) {
        console.log('🗑️ Cache expired, removing:', cacheKey);
        localStorage.removeItem(cacheKey);
        return null;
      }
      
      console.log('📂 Scene loaded from cache:', cacheKey);
      return cachedData;
    } catch (error) {
      console.error('Failed to load scene from cache:', error);
      return null;
    }
  }, [getCacheKey]);

  // Clear cache
  const clearCache = useCallback(() => {
    try {
      const cacheKey = getCacheKey();
      localStorage.removeItem(cacheKey);
      setLastSaved(null);
      console.log('🗑️ Cache cleared:', cacheKey);
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }, [getCacheKey]);

  // Clean up old caches
  const cleanupOldCaches = useCallback(() => {
    try {
      const now = Date.now();
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(CACHE_KEY_PREFIX)) {
          try {
            const cached = localStorage.getItem(key);
            if (cached) {
              const cachedData: CachedScene = JSON.parse(cached);
              const age = now - cachedData.timestamp;
              
              if (age > MAX_CACHE_AGE) {
                keysToRemove.push(key);
              }
            }
          } catch (error) {
            // Invalid cache entry, mark for removal
            keysToRemove.push(key);
          }
        }
      }
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log('🗑️ Cleaned up old cache:', key);
      });
      
      if (keysToRemove.length > 0) {
        console.log(`🧹 Cleaned up ${keysToRemove.length} old cache entries`);
      }
    } catch (error) {
      console.error('Failed to cleanup old caches:', error);
    }
  }, []);

  // Load cached scene on mount
  useEffect(() => {
    const cached = loadFromCache();
    if (cached) {
      setScene(cached.scene);
      setLastSaved(cached.timestamp);
    }
    
    // Cleanup old caches
    cleanupOldCaches();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave) return;
    
    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearInterval(autoSaveTimerRef.current);
    }
    
    // Set up auto-save timer
    autoSaveTimerRef.current = setInterval(() => {
      saveToCache(sceneRef.current, true);
    }, autoSaveInterval);
    
    // Cleanup on unmount
    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [autoSave, autoSaveInterval, saveToCache]);

  // Manual save
  const save = useCallback(() => {
    saveToCache(scene);
  }, [scene, saveToCache]);

  // Update scene and save
  const updateScene = useCallback((newScene: Scene3D | ((prev: Scene3D) => Scene3D)) => {
    setScene(newScene);
  }, []);

  // Get time since last save
  const timeSinceLastSave = lastSaved ? Date.now() - lastSaved : null;

  return {
    scene,
    setScene: updateScene,
    save,
    clearCache,
    lastSaved,
    timeSinceLastSave,
    isSaving,
    hasCachedData: lastSaved !== null
  };
}
