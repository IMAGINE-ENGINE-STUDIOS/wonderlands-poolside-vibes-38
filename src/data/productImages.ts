// Centralized product image imports for consistent use across search and lookup
// These are ES6 imports that Vite will process correctly

// Pool images from src/assets/pools
import axiom14DeluxeMain from '@/assets/pools/latham/axiom-14-deluxe-main.webp';
import axiom14DeluxeGallery1 from '@/assets/pools/latham/axiom-14-deluxe-gallery-1.webp';
import axiom14DeluxeSpecs from '@/assets/pools/latham/axiom-14-deluxe-specs.webp';
import axiom16Main from '@/assets/pools/latham/axiom-16-main.webp';
import axiom16Specs from '@/assets/pools/latham/axiom-16-specs.webp';

// Tanning ledge images from src/assets/tanning-ledges
import glimmerglassParadise from '@/assets/tanning-ledges/glimmerglass-paradise.webp';
import glimmerglassLeeward from '@/assets/tanning-ledges/glimmerglass-leeward.webp';
import glimmerglassLeisure from '@/assets/tanning-ledges/glimmerglass-leisure.webp';

// Export all product images
export const productImages = {
  // Axiom 14 Deluxe
  axiom14DeluxeMain,
  axiom14DeluxeGallery1,
  axiom14DeluxeSpecs,
  axiom16Main,
  axiom16Specs,
  
  // GlimmerGlass Tanning Ledges
  glimmerglassParadise,
  glimmerglassLeeward,
  glimmerglassLeisure,
};

export default productImages;
