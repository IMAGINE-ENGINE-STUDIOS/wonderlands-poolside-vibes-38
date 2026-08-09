
import * as React from 'react';
const { memo, useState, useEffect } = React;
import { OptimizedImage } from './OptimizedImage';
import heroImage1 from '../assets/hero-carousel-1.webp';
import heroImage2 from '../assets/hero-carousel-2.webp';
import heroImage3 from '../assets/hero-carousel-3.webp';

const AnimatedLandscape = memo(() => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const carouselImages = [
    { src: heroImage1, alt: "Luxury pool with spa and modern design" },
    { src: heroImage2, alt: "Contemporary pool with infinity edge and mountain views" },
    { src: heroImage3, alt: "Premium pool with waterfall feature and blue tiles" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % carouselImages.length
      );
    }, 6000); // Change image every 6 seconds

    return () => clearInterval(interval);
  }, [carouselImages.length]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Carousel Images */}
      {carouselImages.map((image, index) => (
        <OptimizedImage 
          key={index}
          src={image.src}
          alt={image.alt}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            index === currentImageIndex ? 'opacity-100' : 'opacity-0'
          }`}
          sizeConfig="hero"
          priority={index === 0}
          loading={index === 0 ? "eager" : "lazy"}
        />
      ))}
      
      {/* Subtle overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30" />
      
      {/* Carousel indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
        {carouselImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentImageIndex 
                ? 'bg-white shadow-lg' 
                : 'bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
});

AnimatedLandscape.displayName = 'AnimatedLandscape';

export default AnimatedLandscape;
