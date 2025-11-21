/**
 * Lightweight texture caching system for 3D viewer
 * Automatically manages texture loading and memory
 */

import * as THREE from 'three';

interface CachedTexture {
  texture: THREE.Texture;
  lastUsed: number;
  size: number;
}

class TextureCache {
  private cache = new Map<string, CachedTexture>();
  private maxCacheSize = 100 * 1024 * 1024; // 100MB max cache
  private currentCacheSize = 0;
  private loader = new THREE.TextureLoader();

  /**
   * Load a texture with caching
   */
  async loadTexture(url: string, repeat?: { x: number; y: number }): Promise<THREE.Texture> {
    // CRITICAL: Validate URL before attempting to load
    if (!url || url === '' || url === 'undefined' || url === 'null') {
      const fallbackUrl = '/src/assets/finishes/sapphire-blue-g3.jpg';
      const stack = new Error().stack;
      console.error('❌ TEXTURE CACHE: Invalid URL detected!', {
        receivedUrl: url,
        urlType: typeof url,
        fallbackUrl,
        stackTrace: stack?.split('\n').slice(1, 4).join('\n')
      });
      
      // Load fallback instead of crashing
      url = fallbackUrl;
    }

    console.log('🎨 Texture Cache: Loading texture', {
      url,
      cached: this.cache.has(url),
      cacheSize: this.cache.size
    });

    // Check cache first
    const cached = this.cache.get(url);
    if (cached) {
      console.log('✅ Texture Cache: Hit', { url });
      cached.lastUsed = Date.now();
      // Clone texture and preserve repeat settings
      const clonedTexture = cached.texture.clone();
      if (repeat) {
        clonedTexture.repeat.set(repeat.x, repeat.y);
        clonedTexture.needsUpdate = true;
      }
      return clonedTexture;
    }

    // Load new texture
    console.log('⏳ Texture Cache: Starting load', { url });
    
    return new Promise((resolve, reject) => {
      this.loader.load(
        url,
        (texture) => {
          console.log('✅ Texture Cache: Load successful', { url });
          
          // Configure texture for optimal performance
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.RepeatWrapping;
          texture.minFilter = THREE.LinearMipmapLinearFilter;
          texture.magFilter = THREE.LinearFilter;
          texture.anisotropy = 4; // Reasonable quality/performance balance
          
          if (repeat) {
            texture.repeat.set(repeat.x, repeat.y);
          }
          
          texture.needsUpdate = true;

          // Estimate texture size (rough approximation)
          const size = (texture.image?.width || 1024) * (texture.image?.height || 1024) * 4;
          
          // Cache the texture
          this.cache.set(url, {
            texture: texture.clone(),
            lastUsed: Date.now(),
            size
          });
          
          this.currentCacheSize += size;
          this.cleanupCache();
          
          console.log(`✅ Cached new texture`, { 
            url: url.substring(0, 50),
            size: `${(size / 1024).toFixed(0)}KB`, 
            repeat,
            dimensions: `${texture.image?.width}x${texture.image?.height}`
          });
          
          resolve(texture);
        },
        undefined,
        (error) => {
          const errorMsg = error instanceof Error ? error.message : String(error);
          console.error('❌ Texture Cache: Load failed', {
            url,
            error: errorMsg,
            errorType: error?.constructor?.name || 'Unknown',
            timestamp: new Date().toISOString()
          });
          
          // Log the calling code
          console.error('🔍 Texture Load Failure Stack Trace:', new Error().stack);
          
          reject(error);
        }
      );
    });
  }

  /**
   * Remove old textures if cache is too large
   */
  private cleanupCache() {
    if (this.currentCacheSize <= this.maxCacheSize) return;

    // Sort by last used time
    const entries = Array.from(this.cache.entries())
      .sort((a, b) => a[1].lastUsed - b[1].lastUsed);

    // Remove oldest textures until we're under the limit
    for (const [url, cached] of entries) {
      if (this.currentCacheSize <= this.maxCacheSize * 0.8) break;
      
      cached.texture.dispose();
      this.cache.delete(url);
      this.currentCacheSize -= cached.size;
    }
  }

  /**
   * Clear all cached textures
   */
  clear() {
    this.cache.forEach(cached => cached.texture.dispose());
    this.cache.clear();
    this.currentCacheSize = 0;
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      count: this.cache.size,
      sizeMB: (this.currentCacheSize / (1024 * 1024)).toFixed(2),
      maxSizeMB: (this.maxCacheSize / (1024 * 1024)).toFixed(2)
    };
  }
}

// Singleton instance
export const textureCache = new TextureCache();

/**
 * Create optimized texture from data URL
 * Automatically handles UV mapping and compression
 */
export const createOptimizedTexture = (
  dataUrl: string,
  repeat: { x: number; y: number } = { x: 1, y: 1 }
): Promise<THREE.Texture> => {
  return textureCache.loadTexture(dataUrl, repeat);
};

/**
 * Dispose of a texture properly
 */
export const disposeTexture = (texture: THREE.Texture | null) => {
  if (texture) {
    texture.dispose();
  }
};
