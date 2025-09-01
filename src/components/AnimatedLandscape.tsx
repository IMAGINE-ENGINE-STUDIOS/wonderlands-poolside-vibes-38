
import { useState, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';

const AnimatedLandscape = () => {
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [currentImage, setCurrentImage] = useState(0);

  const images = [
    '/lovable-uploads/cb2899af-8352-4d43-8351-90966c98c1cb.png',
    '/lovable-uploads/9d0089ec-5bc5-4832-b3b6-468224810f69.png', 
    '/lovable-uploads/7675f245-b0f5-4d57-8c25-e3c4563185fa.png',
    '/lovable-uploads/fb8f1128-c390-4351-9992-4588ffa7ed56.png'
  ];

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

  // Cycle through images every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [images.length]);

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
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 hidden sm:block"
          style={{
            backgroundImage: `url(${images[currentImage]})`,
            backgroundPosition: 'center center',
            backgroundSize: 'cover'
          }}
        />
        
        {/* Mobile Image - Cropped to show sun and waterfall better */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 sm:hidden"
          style={{
            backgroundImage: `url(${images[currentImage]})`,
            backgroundPosition: 'center 30%',
            backgroundSize: 'cover'
          }}
        />
      </animated.div>
      
      {/* Subtle overlay for better text readability while preserving the beautiful colors */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10" />
      
      {/* Image indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImage(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              currentImage === index 
                ? 'bg-white shadow-lg' 
                : 'bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`Switch to landscape ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default AnimatedLandscape;
