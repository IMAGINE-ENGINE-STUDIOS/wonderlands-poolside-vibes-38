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
          preserveAspectRatio="xMidYMid slice"
          className="w-full h-full"
        >
          {/* Background Mountains - Distant */}
          <path 
            d="M0 500 Q200 350 400 500 Q600 300 800 500 Q900 450 1000 500 V1000 H0 Z" 
            fill="#4a746e"
            className="hill-back"
          />
          
          {/* Mid Mountains */}
          <path 
            d="M0 600 Q250 400 500 600 Q750 450 1000 600 V1000 H0 Z" 
            fill="#39b36d"
            className="hill-mid"
          />
          
          {/* Front Mountains */}
          <path 
            d="M0 700 Q300 550 600 700 Q800 600 1000 700 V1000 H0 Z" 
            fill="#2f8c63"
            className="hill-front"
          />

          {/* Waterfall Pool */}
          <ellipse 
            cx="500" 
            cy="680" 
            rx="100" 
            ry="40" 
            fill="#4fd0ff"
            className="pool"
          />

          {/* Main Waterfall Streams */}
          <rect 
            x="470" 
            y="400" 
            width="20" 
            height="280" 
            fill="#3fdfff" 
            className="waterfall-main"
            rx="10"
          />
          <rect 
            x="500" 
            y="400" 
            width="15" 
            height="280" 
            fill="#9ff" 
            className="waterfall-highlight"
            rx="7"
          />
          <rect 
            x="520" 
            y="400" 
            width="18" 
            height="280" 
            fill="#66ccff" 
            className="waterfall-main"
            rx="9"
          />

          {/* Distant Purple Valley */}
          <path 
            d="M300 580 Q400 480 500 580 Q500 590 300 590 Z" 
            fill="#9b4ac8"
            className="purple-valley"
          />

          {/* Yellow/Orange Foreground Hills */}
          <path 
            d="M600 750 Q800 650 1000 750 V1000 H600 Z" 
            fill="#ffc44d"
            className="yellow-hill"
          />

          {/* Dark Foreground */}
          <path 
            d="M0 800 Q400 700 1000 850 V1000 H0 Z" 
            fill="#195c4d"
            className="foreground-hill"
          />
          
          {/* Additional Mountain Details */}
          <path 
            d="M0 650 Q150 550 300 650 Q450 600 600 650 V1000 H0 Z" 
            fill="#26a69a"
            className="hill-detail"
          />
        </svg>

        {/* Animated Sun with Parallax */}
        <animated.div 
          style={parallaxSun}
          className="absolute top-[15%] right-[20%] z-10"
        >
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle 
              cx="60" 
              cy="60" 
              r="50" 
              fill="#fcd34d" 
              className="wonderlands-svg-sun"
            />
            {/* Sun rays */}
            <g className="wonderlands-svg-sun">
              {[...Array(8)].map((_, i) => (
                <line
                  key={i}
                  x1="60"
                  y1="15"
                  x2="60"
                  y2="5"
                  stroke="#fcd34d"
                  strokeWidth="3"
                  strokeLinecap="round"
                  transform={`rotate(${i * 45} 60 60)`}
                />
              ))}
            </g>
          </svg>
        </animated.div>

        {/* Animated Star with Parallax */}
        <animated.div 
          style={parallaxStar}
          className="absolute top-[25%] left-[15%] z-10"
        >
          <svg width="80" height="80" viewBox="0 0 80 80">
            <polygon 
              points="40,10 48,30 70,30 54,42 62,62 40,50 18,62 26,42 10,30 32,30"
              fill="#3fdfff" 
              className="wonderlands-svg-star"
            />
          </svg>
        </animated.div>

        {/* Floating Elements */}
        <div className="absolute top-[60%] left-[10%] w-4 h-4 bg-pink-400 rounded-full animate-bounce opacity-60"></div>
        <div className="absolute top-[70%] right-[15%] w-3 h-3 bg-yellow-300 rounded-full animate-pulse opacity-50"></div>
        <div className="absolute top-[65%] left-[80%] w-5 h-5 bg-green-400 rounded-full animate-ping opacity-40"></div>
      </div>

      {/* Mobile Wireframe Grid */}
      <div className="wireframe-grid md:hidden"></div>
    </div>
  );
};

export default InteractiveLandscape;