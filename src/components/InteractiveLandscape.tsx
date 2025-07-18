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
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-purple-900 via-pink-600 to-orange-400 landscape-mobile">
      {/* Twinkling Stars */}
      <div className="absolute inset-0">
        <div className="stars-container">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="star"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 60}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Animated Clouds */}
      <animated.div style={parallaxClouds} className="absolute inset-0">
        <div className="cloud cloud-1"></div>
        <div className="cloud cloud-2"></div>
        <div className="cloud cloud-3"></div>
      </animated.div>

      {/* Sun */}
      <animated.div style={parallaxSun} className="absolute top-32 right-32">
        <div className="sun"></div>
      </animated.div>

      {/* Mountain Silhouettes */}
      <div className="absolute bottom-0 w-full">
        <div className="mountain-back"></div>
        <div className="mountain-mid"></div>
        <div className="mountain-front"></div>
      </div>

      {/* Waterfall */}
      <div className="absolute right-1/4 top-1/3 waterfall-container">
        <div className="waterfall">
          <div className="waterfall-stream stream-1"></div>
          <div className="waterfall-stream stream-2"></div>
          <div className="waterfall-stream stream-3"></div>
          <div className="waterfall-splash"></div>
        </div>
      </div>

      {/* Water Pool */}
      <div className="absolute bottom-0 w-full">
        <div className="water-surface">
          <div className="water-ripple ripple-1"></div>
          <div className="water-ripple ripple-2"></div>
          <div className="water-ripple ripple-3"></div>
        </div>
      </div>


      {/* Mobile Wireframe Grid */}
      <div className="wireframe-grid md:hidden"></div>
    </div>
  );
};

export default InteractiveLandscape;