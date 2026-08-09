import { Scene3D, TextureConfig } from '@/components/scene3d/types';

/**
 * Default texture configuration for fallback
 */
const DEFAULT_FINISH_TEXTURE: TextureConfig = {
  url: '/textures/finishes/sapphire-blue-g3.jpg',
  name: 'Default Finish',
  roughness: 0.3,
  metalness: 0.2,
  scale: 1.8,
  offset: [0, 0]
};

const DEFAULT_PAVER_TEXTURE: TextureConfig = {
  url: '/lovable-uploads/6f65c8d2-ad09-4fef-b01f-cb3c2e96cf11.png',
  name: 'Default Paver',
  roughness: 0.8,
  metalness: 0.0,
  scale: 1.8,
  offset: [0, 0]
};

const DEFAULT_COPING_TEXTURE: TextureConfig = {
  url: '/lovable-uploads/08c51883-4e87-4344-b773-ec0a6d575b54.webp',
  name: 'Default Coping',
  roughness: 0.6,
  metalness: 0.0,
  scale: 1.8,
  offset: [-0.21, 0]
};

/**
 * Validates and ensures a texture config has a valid URL
 */
function validateTextureConfig(texture: TextureConfig | undefined, fallback: TextureConfig): TextureConfig {
  if (!texture || !texture.url || texture.url === '' || texture.url === 'undefined' || texture.url === 'null') {
    return { ...fallback };
  }
  
  return {
    ...texture,
    scale: texture.scale || fallback.scale,
    offset: texture.offset || fallback.offset,
    roughness: texture.roughness ?? fallback.roughness,
    metalness: texture.metalness ?? fallback.metalness
  };
}

/**
 * Validates and fixes a Scene3D object to ensure all required properties exist
 * with valid values. This prevents texture loading errors and crashes.
 */
export function validateScene(scene: Scene3D): Scene3D {
  const validated: Scene3D = { ...scene };

  // Validate pool finish
  if (!validated.pool.finish) {
    validated.pool.finish = { ...DEFAULT_FINISH_TEXTURE };
  } else {
    validated.pool.finish = validateTextureConfig(validated.pool.finish, DEFAULT_FINISH_TEXTURE);
  }

  // Validate deck textures
  if (!validated.deck.paver) {
    validated.deck.paver = { ...DEFAULT_PAVER_TEXTURE };
  } else {
    validated.deck.paver = validateTextureConfig(validated.deck.paver, DEFAULT_PAVER_TEXTURE);
  }

  if (!validated.deck.coping) {
    validated.deck.coping = { ...DEFAULT_COPING_TEXTURE };
  } else {
    validated.deck.coping = validateTextureConfig(validated.deck.coping, DEFAULT_COPING_TEXTURE);
  }

  // CRITICAL: Always ensure waterline exists with valid URL
  if (!validated.deck.waterline) {
    // Use pool finish as waterline default
    validated.deck.waterline = {
      url: validated.pool.finish.url,
      name: `${validated.pool.finish.name} (Waterline)`,
      roughness: 0.3,
      metalness: 0.2,
      scale: validated.pool.finish.scale || 1.8,
      offset: validated.pool.finish.offset || [0, 0]
    };
  } else {
    validated.deck.waterline = validateTextureConfig(validated.deck.waterline, {
      url: validated.pool.finish.url,
      name: `${validated.pool.finish.name} (Waterline)`,
      roughness: 0.3,
      metalness: 0.2,
      scale: 1.8,
      offset: [0, 0]
    });
  }

  // Ensure deck dimensions exist
  validated.deck.copingWidth = validated.deck.copingWidth || 1.1;
  validated.deck.copingHeight = validated.deck.copingHeight || 2 / 12;
  validated.deck.deckHeight = validated.deck.deckHeight || 2 / 12;

  // Ensure pool dimensions exist
  if (!validated.pool.dimensions) {
    validated.pool.dimensions = { length: 28, width: 14, depth: 6 };
  }

  // Ensure arrays exist
  validated.pool.points = validated.pool.points || [];
  validated.pool.depthPoints = validated.pool.depthPoints || [];
  validated.features = validated.features || [];
  validated.stairs = validated.stairs || [];
  validated.annotations = validated.annotations || [];

  // Ensure camera exists
  if (!validated.camera) {
    const length = validated.pool.dimensions.length;
    const width = validated.pool.dimensions.width;
    validated.camera = {
      position: [length * 0.8, length * 0.6, width * 0.8],
      target: [width / 2, 0, length / 2]
    };
  }

  return validated;
}

/**
 * Quick check if a texture URL is valid
 */
export function isValidTextureUrl(url: string | undefined): boolean {
  return !!url && url !== '' && url !== 'undefined' && url !== 'null';
}
