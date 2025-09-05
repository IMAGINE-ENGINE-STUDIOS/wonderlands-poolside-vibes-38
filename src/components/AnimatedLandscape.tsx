
import { memo } from 'react';

const AnimatedLandscape = memo(() => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Background Image - preloaded in index.html */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/lovable-uploads/7a94e712-7683-4a26-8a1c-c6974e320b5a.png)'
        }}
      />
      
      {/* Optional overlay for better text readability */}
      <div className="absolute inset-0 bg-black/20" />
    </div>
  );
});

AnimatedLandscape.displayName = 'AnimatedLandscape';

export default AnimatedLandscape;
