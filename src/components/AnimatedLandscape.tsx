
import { memo } from 'react';
import { OptimizedImage } from './OptimizedImage';

const AnimatedLandscape = memo(() => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Background Image - optimized WebP format */}
      <OptimizedImage 
        src="/lovable-uploads/7a94e712-7683-4a26-8a1c-c6974e320b5a.png"
        alt="Pool landscape background"
        className="absolute inset-0 w-full h-full object-cover"
        sizeConfig="hero"
        priority={true}
      />
      
      {/* Optional overlay for better text readability */}
      <div className="absolute inset-0 bg-black/20" />
    </div>
  );
});

AnimatedLandscape.displayName = 'AnimatedLandscape';

export default AnimatedLandscape;
