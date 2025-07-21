import { Palmtree, Waves, Sun, Umbrella, Fish, Shell, Anchor, Sailboat, Droplets, Wind } from "lucide-react";

const FloridaPoolElements = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Enhanced Florida-themed pool elements with dynamic animations */}
      
      {/* Dynamic water droplets */}
      <div className="absolute top-1/6 left-1/4 text-primary/30 animate-ping">
        <Droplets size={20} className="animate-pulse" />
      </div>
      <div className="absolute top-2/3 right-1/3 text-teal/25 animate-bounce" style={{ animationDelay: '1s' }}>
        <Droplets size={24} />
      </div>
      <div className="absolute bottom-1/4 left-2/3 text-primary/20 animate-ping" style={{ animationDelay: '2s' }}>
        <Droplets size={18} />
      </div>
      
      {/* Wind elements for movement */}
      <div className="absolute top-1/3 left-1/6 text-teal/15 animate-pulse" style={{ animationDelay: '0.5s' }}>
        <Wind size={32} />
      </div>
      <div className="absolute bottom-1/3 right-1/6 text-primary/15 animate-pulse" style={{ animationDelay: '1.5s' }}>
        <Wind size={28} />
      </div>
      
      {/* Palm trees */}
      <div className="absolute top-1/4 left-20 text-teal/25 animate-float-slow">
        <Palmtree size={48} />
      </div>
      <div className="absolute bottom-1/3 right-20 text-teal/20 animate-bounce-gentle">
        <Palmtree size={36} />
      </div>
      <div className="absolute top-2/3 left-1/3 text-teal/30 animate-wiggle">
        <Palmtree size={32} />
      </div>
      
      {/* Pool-related waves */}
      <div className="absolute top-1/3 right-1/4 text-primary/30 animate-float">
        <Waves size={40} />
      </div>
      <div className="absolute bottom-1/4 left-1/4 text-primary/25 animate-bounce-gentle">
        <Waves size={36} />
      </div>
      <div className="absolute top-1/2 right-1/3 text-primary/20 animate-wiggle">
        <Waves size={28} />
      </div>
      
      {/* Florida sun */}
      <div className="absolute top-20 right-1/4 text-orange/35 animate-float-slow">
        <Sun size={44} />
      </div>
      <div className="absolute bottom-1/5 left-1/5 text-orange/25 animate-bounce-gentle">
        <Sun size={32} />
      </div>
      
      {/* Pool umbrellas */}
      <div className="absolute top-1/2 left-1/4 text-coral/30 animate-wiggle">
        <Umbrella size={38} />
      </div>
      <div className="absolute bottom-2/3 right-1/2 text-coral/25 animate-float">
        <Umbrella size={34} />
      </div>
      
      {/* Marine life (Florida waters) */}
      <div className="absolute top-3/4 left-1/2 text-teal/25 animate-float-slow">
        <Fish size={30} />
      </div>
      <div className="absolute bottom-1/2 right-1/4 text-primary/25 animate-bounce-gentle">
        <Fish size={26} />
      </div>
      
      {/* Seashells */}
      <div className="absolute top-1/5 left-1/3 text-coral/20 animate-wiggle">
        <Shell size={24} />
      </div>
      <div className="absolute bottom-1/4 right-1/3 text-coral/25 animate-float">
        <Shell size={28} />
      </div>
      
      {/* Nautical elements */}
      <div className="absolute top-2/5 right-1/5 text-secondary/25 animate-bounce-gentle">
        <Anchor size={32} />
      </div>
      <div className="absolute bottom-2/5 left-1/5 text-primary/20 animate-float-slow">
        <Sailboat size={36} />
      </div>
      
      {/* Pool-shaped floating elements */}
      <div className="absolute top-1/6 right-2/3 w-20 h-12 bg-primary/15 rounded-full animate-float"></div>
      <div className="absolute bottom-1/6 left-2/3 w-24 h-14 bg-teal/15 rounded-full animate-bounce-gentle"></div>
      <div className="absolute top-5/6 right-1/6 w-16 h-10 bg-coral/15 rounded-full animate-wiggle"></div>
      
      {/* Kidney-shaped pool elements */}
      <div className="absolute top-1/3 left-1/6 w-18 h-12 bg-orange/20 rounded-full skew-x-12 animate-float-slow"></div>
      <div className="absolute bottom-1/3 right-1/6 w-22 h-14 bg-secondary/20 rounded-full skew-x-12 animate-bounce-gentle"></div>
      
      {/* Pool ladder elements */}
      <div className="absolute top-1/2 left-1/2 w-2 h-16 bg-primary/20 rounded animate-wiggle"></div>
      <div className="absolute bottom-1/2 right-1/2 w-2 h-12 bg-teal/20 rounded animate-float"></div>
      
      {/* Pool tile patterns */}
      <div className="absolute top-2/3 right-2/3 w-8 h-8 bg-gradient-to-br from-primary/25 to-teal/25 rounded animate-float-slow"></div>
      <div className="absolute bottom-2/3 left-2/3 w-6 h-6 bg-gradient-to-br from-coral/25 to-orange/25 rounded animate-bounce-gentle"></div>
      
      {/* Florida-specific circular elements */}
      <div className="absolute top-1/4 right-1/2 w-14 h-14 bg-gradient-to-br from-orange/20 to-coral/20 rounded-full animate-wiggle"></div>
      <div className="absolute bottom-1/4 left-1/2 w-18 h-18 bg-gradient-to-br from-primary/20 to-teal/20 rounded-full animate-float"></div>
      
      {/* Enhanced Pool water ripples with scale animations */}
      <div className="absolute top-1/5 left-2/5 w-12 h-3 bg-primary/15 rounded-full animate-float hover:animate-pulse"></div>
      <div className="absolute bottom-1/5 right-2/5 w-16 h-4 bg-teal/15 rounded-full animate-bounce-gentle hover:animate-ping"></div>
      <div className="absolute top-4/5 left-1/5 w-10 h-2 bg-coral/15 rounded-full animate-wiggle hover:animate-spin"></div>
      
      {/* Dynamic gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/2 to-transparent animate-pulse" style={{ animationDuration: '8s' }}></div>
      <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-teal/2 to-transparent animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }}></div>
      
      {/* Floating sparkle effects */}
      <div className="absolute top-1/8 right-1/8 w-3 h-3 bg-primary/40 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
      <div className="absolute top-3/8 left-1/8 w-2 h-2 bg-teal/40 rounded-full animate-ping" style={{ animationDelay: '1.2s' }}></div>
      <div className="absolute bottom-1/8 right-3/8 w-4 h-4 bg-coral/40 rounded-full animate-ping" style={{ animationDelay: '2.1s' }}></div>
      <div className="absolute bottom-3/8 left-3/8 w-2 h-2 bg-orange/40 rounded-full animate-ping" style={{ animationDelay: '0.8s' }}></div>
      
      {/* Swirling pool elements */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="w-32 h-32 border border-primary/10 rounded-full animate-spin" style={{ animationDuration: '20s' }}></div>
        <div className="absolute top-2 left-2 w-28 h-28 border border-teal/10 rounded-full animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }}></div>
      </div>
    </div>
  );
};

export default FloridaPoolElements;