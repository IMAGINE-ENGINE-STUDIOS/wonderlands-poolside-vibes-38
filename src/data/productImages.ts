// Centralized product image imports for consistent use across search and lookup
// These are ES6 imports that Vite will process correctly

// Pool images from src/assets/pools
import axiom14DeluxeMain from '@/assets/pools/axiom-14-deluxe-main.jpg';
import axiom14DeluxeGallery1 from '@/assets/pools/axiom-14-deluxe-gallery-1.jpg';
import axiom14DeluxeSpecs from '@/assets/pools/axiom-14-deluxe-specs.jpg';

// Tanning ledge images from src/assets/tanning-ledges
import glimmerglassParadise from '@/assets/tanning-ledges/glimmerglass-paradise.png';
import glimmerglassLeeward from '@/assets/tanning-ledges/glimmerglass-leeward.png';
import glimmerglassLeisure from '@/assets/tanning-ledges/glimmerglass-leisure.png';

// Export all product images
export const productImages = {
  // Axiom 14 Deluxe
  axiom14DeluxeMain,
  axiom14DeluxeGallery1,
  axiom14DeluxeSpecs,
  
  // GlimmerGlass Tanning Ledges
  glimmerglassParadise,
  glimmerglassLeeward,
  glimmerglassLeisure,
};

export default productImages;
