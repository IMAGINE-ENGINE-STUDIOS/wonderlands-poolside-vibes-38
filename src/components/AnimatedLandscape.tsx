
import { useState, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { OptimizedImage } from './OptimizedImage';

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
      {/* Background Image */}
      <OptimizedImage
        src="/lovable-uploads/7a94e712-7683-4a26-8a1c-c6974e320b5a.png"
        alt="Pool landscape background"
        className="absolute inset-0 w-full h-full object-cover"
        sizeConfig="hero"
        priority={true}
        loading="eager"
      />
      
      {/* Optional overlay for better text readability */}
      <div className="absolute inset-0 bg-black/20" />
    </div>
  );
};

export default AnimatedLandscape;
