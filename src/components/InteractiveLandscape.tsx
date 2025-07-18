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
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-pink-400 via-orange-400 to-yellow-200 landscape-mobile">
      {/* Blue Star/Diamond */}
      <animated.div 
        style={parallaxClouds} 
        className="absolute top-20 left-1/4 z-10"
      >
        <div className="star-diamond"></div>
      </animated.div>

      {/* Yellow Sun */}
      <animated.div style={parallaxSun} className="absolute top-16 right-1/3">
        <div className="wonderlands-sun"></div>
      </animated.div>

      {/* Rolling Hills Layers */}
      <div className="absolute bottom-0 w-full z-20">
        {/* Back Hills */}
        <div className="hill-layer hill-back"></div>
        
        {/* Mid Hills with Waterfall */}
        <div className="hill-layer hill-mid">
          {/* Waterfall streams */}
          <div className="wonderlands-waterfall">
            <div className="waterfall-stream-new stream-purple"></div>
            <div className="waterfall-stream-new stream-blue-light"></div>
            <div className="waterfall-stream-new stream-blue"></div>
            <div className="waterfall-stream-new stream-teal"></div>
          </div>
        </div>
        
        {/* Front Hills */}
        <div className="hill-layer hill-front"></div>
        
        {/* Vegetation */}
        <div className="vegetation-layer">
          <div className="plant plant-1"></div>
          <div className="plant plant-2"></div>
          <div className="plant plant-3"></div>
          <div className="plant plant-4"></div>
          <div className="plant plant-5"></div>
        </div>
        
        {/* Water Pool */}
        <div className="wonderlands-pool">
          <div className="pool-ripple ripple-1"></div>
          <div className="pool-ripple ripple-2"></div>
          <div className="pool-ripple ripple-3"></div>
        </div>
      </div>

      {/* Mobile Wireframe Grid */}
      <div className="wireframe-grid md:hidden"></div>
    </div>
  );
};

export default InteractiveLandscape;