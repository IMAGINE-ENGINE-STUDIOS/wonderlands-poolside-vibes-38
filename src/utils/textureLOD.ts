/**
 * Texture LOD (Level of Detail) Manager
 * Handles loading and switching between different texture resolutions based on zoom level
 */

export interface TextureLOD {
  high: HTMLImageElement | null;
  medium: HTMLImageElement | null;
  low: HTMLImageElement | null;
  loaded: boolean;
}

export interface TextureLODSet {
  paver: TextureLOD;
  coping: TextureLOD;
  liner: TextureLOD;
}

/**
 * Calculate texture scale based on canvas dimensions
 * Returns multipliers for high, medium, and low resolution textures
 */
export const calculateTextureSizes = (baseSize: number) => {
  return {
    high: baseSize * 2,      // Double resolution for full quality when zoomed
    medium: baseSize,        // Full base resolution
    low: baseSize * 0.5      // Half resolution for distant view
  };
};

/**
 * Determine which LOD level to use based on zoom level
 */
export const getLODLevel = (zoomLevel: number): 'high' | 'medium' | 'low' => {
  if (zoomLevel >= 1.3) return 'high';    // Use high quality at lower zoom threshold
  if (zoomLevel >= 0.8) return 'medium';  // Medium quality for moderate zoom
  return 'low';
};

/**
 * Load a single texture at specific resolution
 */
const loadTexture = (src: string, scale: number = 1): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    // For demonstration, we load the same image but can apply different quality settings
    // In production, you would load different pre-generated image files
    img.onload = () => {
      // If we need to resize, we can create a canvas and resize
      if (scale < 1) {
        const canvas = document.createElement('canvas');
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          // Use high-quality image smoothing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          // Create a new image from the resized canvas
          const resizedImg = new Image();
          resizedImg.src = canvas.toDataURL('image/jpeg', 0.9);
          resizedImg.onload = () => resolve(resizedImg);
          resizedImg.onerror = () => reject(new Error('Failed to create resized image'));
        } else {
          resolve(img);
        }
      } else {
        resolve(img);
      }
    };
    
    img.onerror = () => reject(new Error(`Failed to load texture: ${src}`));
    img.src = src;
  });
};

/**
 * Load all LOD levels for a single texture
 */
export const loadTextureLOD = async (src: string): Promise<TextureLOD> => {
  try {
    const [high, medium, low] = await Promise.all([
      loadTexture(src, 2.0),    // Double size for maximum quality when zoomed
      loadTexture(src, 1.0),    // Full base size
      loadTexture(src, 0.5)     // Half size for distant view
    ]);

    return {
      high,
      medium,
      low,
      loaded: true
    };
  } catch (error) {
    console.error('Error loading texture LOD:', error);
    return {
      high: null,
      medium: null,
      low: null,
      loaded: false
    };
  }
};

/**
 * Load all textures with LOD levels
 */
export const loadAllTextureLODs = async (
  paverSrc: string,
  copingSrc: string,
  linerSrc: string
): Promise<TextureLODSet> => {
  const [paver, coping, liner] = await Promise.all([
    loadTextureLOD(paverSrc),
    loadTextureLOD(copingSrc),
    loadTextureLOD(linerSrc)
  ]);

  return { paver, coping, liner };
};

/**
 * Get the appropriate texture from LOD set based on zoom level
 */
export const getTextureForLOD = (
  textureLOD: TextureLOD,
  zoomLevel: number
): HTMLImageElement | null => {
  const level = getLODLevel(zoomLevel);
  
  switch (level) {
    case 'high':
      return textureLOD.high || textureLOD.medium || textureLOD.low;
    case 'medium':
      return textureLOD.medium || textureLOD.low || textureLOD.high;
    case 'low':
      return textureLOD.low || textureLOD.medium || textureLOD.high;
  }
};
