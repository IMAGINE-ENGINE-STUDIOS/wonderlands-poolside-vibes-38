
import { memo } from 'react';
import { OptimizedImage } from './OptimizedImage';

const AnimatedLandscape = memo(() => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Hero Background Image - Modern pool spa with waterfall */}
      <OptimizedImage 
        src="/lovable-uploads/ff4b7b6f-f7a9-4e18-969d-3c3f2a35e471.png"
        alt="Modern luxury pool and spa with waterfall feature"
        className="absolute inset-0 w-full h-full object-cover"
        sizeConfig="hero"
        priority={true}
        loading="eager"
      />
      
      {/* Subtle overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30" />
    </div>
  );
});

AnimatedLandscape.displayName = 'AnimatedLandscape';

export default AnimatedLandscape;
