import { useState, useEffect } from "react";
import { useSpring, animated } from "@react-spring/web";

const InteractiveLandscape = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const parallaxSun = useSpring({
    transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.3}px)`,
  });

  const parallaxClouds = useSpring({
    transform: `translate(${mousePosition.x * 0.2}px, ${mousePosition.y * 0.1}px)`,
  });

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-pink-300 via-coral to-orange-300 landscape-mobile">
      {/* Sky Gradient Layers */}
      <div className="absolute inset-0 bg-gradient-to-b from-pink-400 via-orange-400 to-yellow-200"></div>
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-orange-300/20 to-coral/30"></div>

      {/* Floating Clouds */}
      <div className="absolute inset-0">
        <div className="paradise-cloud cloud-large"></div>
        <div className="paradise-cloud cloud-medium"></div>
        <div className="paradise-cloud cloud-small"></div>
        <div className="paradise-cloud cloud-tiny"></div>
      </div>

      {/* Blue Star/Diamond */}
      <animated.div 
        style={parallaxClouds} 
        className="absolute top-20 left-1/4 z-10"
      >
        <div className="star-diamond"></div>
        <div className="star-sparkles">
          <div className="sparkle sparkle-1"></div>
          <div className="sparkle sparkle-2"></div>
          <div className="sparkle sparkle-3"></div>
          <div className="sparkle sparkle-4"></div>
        </div>
      </animated.div>

      {/* Yellow Sun with Rays */}
      <animated.div style={parallaxSun} className="absolute top-16 right-1/3">
        <div className="wonderlands-sun">
          <div className="sun-rays">
            <div className="sun-ray ray-1"></div>
            <div className="sun-ray ray-2"></div>
            <div className="sun-ray ray-3"></div>
            <div className="sun-ray ray-4"></div>
            <div className="sun-ray ray-5"></div>
            <div className="sun-ray ray-6"></div>
            <div className="sun-ray ray-7"></div>
            <div className="sun-ray ray-8"></div>
          </div>
        </div>
      </animated.div>

      {/* Multi-Layer Mountain Paradise */}
      <div className="absolute bottom-0 w-full z-20">
        {/* Distant Mountains */}
        <div className="mountain-layer mountain-distant-1"></div>
        <div className="mountain-layer mountain-distant-2"></div>
        <div className="mountain-layer mountain-distant-3"></div>
        
        {/* Mid Mountains */}
        <div className="mountain-layer mountain-mid-1">
          {/* Main Waterfall */}
          <div className="wonderlands-waterfall main-waterfall">
            <div className="waterfall-mist"></div>
            <div className="waterfall-stream-new stream-purple"></div>
            <div className="waterfall-stream-new stream-blue-light"></div>
            <div className="waterfall-stream-new stream-blue"></div>
            <div className="waterfall-stream-new stream-teal"></div>
            <div className="waterfall-splash-effect"></div>
          </div>
        </div>
        
        <div className="mountain-layer mountain-mid-2">
          {/* Secondary Waterfall */}
          <div className="wonderlands-waterfall secondary-waterfall">
            <div className="waterfall-stream-new stream-cyan"></div>
            <div className="waterfall-stream-new stream-aqua"></div>
          </div>
        </div>
        
        {/* Foreground Mountains */}
        <div className="mountain-layer mountain-front-1"></div>
        <div className="mountain-layer mountain-front-2"></div>
        
        {/* Paradise Vegetation */}
        <div className="vegetation-paradise">
          <div className="palm-tree tree-1"></div>
          <div className="palm-tree tree-2"></div>
          <div className="tropical-plant plant-1"></div>
          <div className="tropical-plant plant-2"></div>
          <div className="tropical-plant plant-3"></div>
          <div className="tropical-plant plant-4"></div>
          <div className="tropical-flower flower-1"></div>
          <div className="tropical-flower flower-2"></div>
          <div className="tropical-flower flower-3"></div>
        </div>
        
        {/* Paradise Pool with Enhanced Effects */}
        <div className="wonderlands-pool paradise-pool">
          <div className="pool-reflection"></div>
          <div className="pool-ripple ripple-1"></div>
          <div className="pool-ripple ripple-2"></div>
          <div className="pool-ripple ripple-3"></div>
          <div className="pool-bubbles">
            <div className="bubble bubble-1"></div>
            <div className="bubble bubble-2"></div>
            <div className="bubble bubble-3"></div>
            <div className="bubble bubble-4"></div>
          </div>
        </div>
      </div>

      {/* Floating Paradise Elements */}
      <div className="paradise-floating-elements">
        <div className="floating-leaf leaf-1"></div>
        <div className="floating-leaf leaf-2"></div>
        <div className="floating-leaf leaf-3"></div>
        <div className="light-particle particle-1"></div>
        <div className="light-particle particle-2"></div>
        <div className="light-particle particle-3"></div>
      </div>

      {/* Mobile Wireframe Grid */}
      <div className="wireframe-grid md:hidden"></div>
    </div>
  );
};

export default InteractiveLandscape;