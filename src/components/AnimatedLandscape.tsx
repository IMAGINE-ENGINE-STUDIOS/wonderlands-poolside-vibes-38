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
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-pink-300 via-orange-300 to-yellow-300" />
      
      {/* Sun */}
      <animated.div 
        style={sunAnimation}
        className="absolute top-32 right-1/3 w-48 h-48 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 shadow-2xl animate-pulse"
      />
      
      {/* Star */}
      <animated.div 
        style={starAnimation}
        className="absolute top-40 left-1/4"
      >
        <svg width="40" height="40" viewBox="0 0 40 40" className="text-blue-400 animate-pulse">
          <path
            d="M20 0 L25 15 L40 20 L25 25 L20 40 L15 25 L0 20 L15 15 Z"
            fill="currentColor"
          />
        </svg>
      </animated.div>
      
      {/* Background Mountains */}
      <div className="absolute bottom-0 w-full">
        <svg viewBox="0 0 1200 600" className="w-full h-auto">
          {/* Back mountain layers */}
          <path
            d="M0,400 Q200,300 400,350 Q600,250 800,300 Q1000,200 1200,250 L1200,600 L0,600 Z"
            fill="#4ade80"
            className="animate-pulse"
          />
          <path
            d="M0,450 Q300,350 500,400 Q700,300 900,350 Q1100,280 1200,320 L1200,600 L0,600 Z"
            fill="#22c55e"
          />
          <path
            d="M0,500 Q200,420 400,450 Q600,380 800,420 Q1000,350 1200,380 L1200,600 L0,600 Z"
            fill="#16a34a"
          />
          
          {/* Waterfall */}
          <defs>
            <linearGradient id="waterfall" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#7dd3fc" />
              <stop offset="50%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0ea5e9" />
            </linearGradient>
            <linearGradient id="pool" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
          </defs>
          
          {/* Waterfall streams */}
          <rect x="450" y="300" width="8" height="120" fill="url(#waterfall)" className="animate-pulse" />
          <rect x="465" y="320" width="6" height="100" fill="url(#waterfall)" className="animate-pulse" />
          <rect x="475" y="310" width="10" height="110" fill="url(#waterfall)" className="animate-pulse" />
          
          {/* Pool/Lake */}
          <ellipse cx="600" cy="550" rx="200" ry="50" fill="url(#pool)" className="animate-pulse" />
          
          {/* Purple rock formations */}
          <path
            d="M350,450 Q380,400 420,430 Q450,380 480,420 L480,600 L350,600 Z"
            fill="#a855f7"
          />
          <path
            d="M200,480 Q230,440 260,460 Q290,420 320,450 L320,600 L200,600 Z"
            fill="#9333ea"
          />
          
          {/* Foreground orange hills */}
          <path
            d="M0,520 Q150,480 300,500 Q450,460 600,480 Q750,440 900,460 Q1050,420 1200,440 L1200,600 L0,600 Z"
            fill="#f97316"
          />
          
          {/* Dark foreground elements */}
          <circle cx="100" cy="550" r="25" fill="#065f46" className="animate-pulse" />
          <circle cx="150" cy="540" r="20" fill="#047857" className="animate-pulse" />
          <circle cx="200" cy="560" r="30" fill="#059669" className="animate-pulse" />
          <circle cx="900" cy="520" r="35" fill="#065f46" className="animate-pulse" />
          <circle cx="950" cy="540" r="25" fill="#047857" className="animate-pulse" />
          <circle cx="1000" cy="530" r="40" fill="#059669" className="animate-pulse" />
          
          {/* Grass elements */}
          {Array.from({ length: 20 }, (_, i) => (
            <path
              key={i}
              d={`M${50 + i * 60},580 Q${55 + i * 60},570 ${60 + i * 60},580 Q${65 + i * 60},570 ${70 + i * 60},580`}
              stroke="#166534"
              strokeWidth="2"
              fill="none"
              className="animate-pulse"
            />
          ))}
        </svg>
      </div>
      
      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 12 }, (_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 60}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default AnimatedLandscape;