
import { useState, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';

const AnimatedLandscape = () => {
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });

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

  const sunAnimation = useSpring({
    transform: `translate(${(mousePosition.x - 50) * 0.5}px, ${(mousePosition.y - 50) * 0.3}px)`,
    config: { tension: 120, friction: 14 }
  });

  const starAnimation = useSpring({
    transform: `translate(${(mousePosition.x - 50) * 0.3}px, ${(mousePosition.y - 50) * 0.2}px)`,
    config: { tension: 120, friction: 14 }
  });

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Background Image - Cropped bottom 15% */}
      <div 
        className="absolute inset-0 bg-no-repeat"
        style={{
          backgroundImage: 'url(/lovable-uploads/0c70745d-4bf3-4394-8fb2-da6024bf72b9.png)',
          backgroundSize: '100% 117.65%',
          backgroundPosition: 'center top'
        }}
      />
      
      {/* Optional overlay for better text readability */}
      <div className="absolute inset-0 bg-black/20" />
    </div>
  );
};

export default AnimatedLandscape;
