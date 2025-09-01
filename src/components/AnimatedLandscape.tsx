
import { useState, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';

const AnimatedLandscape = () => {
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });

  // Single image per screen size - no carousel
  const desktopImage = '/lovable-uploads/cb2899af-8352-4d43-8351-90966c98c1cb.png';
  const mobileImage = '/lovable-uploads/cb2899af-8352-4d43-8351-90966c98c1cb.png';

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const parallaxAnimation = useSpring({
    transform: `translate(${(mousePosition.x - 50) * 0.02}px, ${(mousePosition.y - 50) * 0.01}px)`,
    config: { tension: 120, friction: 14 }
  });

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Main Wonderlands Landscapes Background */}
      <animated.div 
        style={parallaxAnimation}
        className="absolute inset-0 w-full h-full"
      >
        {/* Desktop/Tablet Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat hidden sm:block"
          style={{
            backgroundImage: `url(${desktopImage})`,
            backgroundPosition: 'center center',
            backgroundSize: 'cover'
          }}
        />
        
        {/* Mobile Image - Cropped to show sun and waterfall better */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat sm:hidden"
          style={{
            backgroundImage: `url(${mobileImage})`,
            backgroundPosition: 'center 30%',
            backgroundSize: 'cover'
          }}
        />
      </animated.div>
      
      {/* Subtle overlay for better text readability while preserving the beautiful colors */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10" />
    </div>
  );
};

export default AnimatedLandscape;
