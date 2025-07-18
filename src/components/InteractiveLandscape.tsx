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
    transform: `translate(${mousePosition.x * 0.3}px, ${mousePosition.y * 0.2}px)`,
  });

  const parallaxStar = useSpring({
    transform: `translate(${mousePosition.x * 0.4}px, ${mousePosition.y * 0.3}px)`,
  });

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-t from-orange-400 via-pink-400 to-pink-300 landscape-mobile">
      <div className="absolute inset-0">
        <svg 
          viewBox="0 0 1000 1000" 
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full"
        >
          {/* Background Hills */}
          <path 
            d="M0 600 Q250 450 500 600 T1000 600 V1000 H0 Z" 
            fill="#39b36d"
            className="hill-back"
          />
          <path 
            d="M0 700 Q300 500 700 700 T1000 700 V1000 H0 Z" 
            fill="#2f8c63"
            className="hill-mid"
          />
          <path 
            d="M0 800 Q400 600 1000 800 V1000 H0 Z" 
            fill="#195c4d"
            className="hill-front"
          />

          {/* Waterfall Pool */}
          <path 
            d="M400 600 Q500 620 600 600 Q590 640 400 630 Z" 
            fill="#4fd0ff"
            className="pool"
          />

          {/* Waterfall Streams */}
          <rect 
            x="470" 
            y="450" 
            width="60" 
            height="180" 
            fill="#3fdfff" 
            className="waterfall-main"
          />
          <rect 
            x="500" 
            y="450" 
            width="30" 
            height="180" 
            fill="#9ff" 
            className="waterfall-highlight"
          />

          {/* Distant Purple Valley */}
          <path 
            d="M300 600 Q400 500 500 600 Q500 610 300 610 Z" 
            fill="#9b4ac8"
            className="purple-valley"
          />

          {/* Yellow Hill (foreground) */}
          <path 
            d="M600 680 Q800 600 1000 700 V1000 H600 Z" 
            fill="#ffc44d"
            className="yellow-hill"
          />

          {/* Foreground Hill */}
          <path 
            d="M0 700 Q400 650 1000 800 V1000 H0 Z" 
            fill="#144c3c"
            className="foreground-hill"
          />
        </svg>

        {/* Animated Sun with Parallax */}
        <animated.div 
          style={parallaxSun}
          className="absolute top-[20%] right-[25%]"
        >
          <svg width="140" height="140" viewBox="0 0 140 140">
            <circle 
              cx="70" 
              cy="70" 
              r="70" 
              fill="#fcd34d" 
              className="wonderlands-svg-sun"
            />
          </svg>
        </animated.div>

        {/* Animated Star with Parallax */}
        <animated.div 
          style={parallaxStar}
          className="absolute top-[20%] left-[25%]"
        >
          <svg width="100" height="100" viewBox="0 0 100 100">
            <polygon 
              points="50,10 60,40 90,40 70,60 80,90 50,70 20,90 30,60 10,40 40,40"
              fill="#3fdfff" 
              className="wonderlands-svg-star"
            />
          </svg>
        </animated.div>
      </div>

      {/* Mobile Wireframe Grid */}
      <div className="wireframe-grid md:hidden"></div>
    </div>
  );
};

export default InteractiveLandscape;