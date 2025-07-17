import { Sparkles, Waves, Sun, Moon, TreePine, Flower } from "lucide-react";

const FloatingElements = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Large floating shapes */}
      <div className="absolute top-1/4 left-10 w-32 h-32 bg-gradient-to-br from-coral/20 to-orange/20 rounded-full animate-float-slow"></div>
      <div className="absolute bottom-1/4 right-10 w-28 h-28 bg-gradient-to-br from-primary/20 to-teal/20 rounded-full animate-bounce-gentle"></div>
      <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-gradient-to-br from-secondary/20 to-accent/20 rounded-full animate-wiggle"></div>
      <div className="absolute bottom-1/3 left-1/3 w-36 h-36 bg-gradient-to-br from-teal/15 to-primary/15 rounded-full animate-float"></div>
      
      {/* Medium floating shapes */}
      <div className="absolute top-20 right-1/3 w-16 h-16 bg-gradient-to-br from-orange/25 to-coral/25 rounded-full animate-bounce-gentle"></div>
      <div className="absolute bottom-20 left-1/4 w-20 h-20 bg-gradient-to-br from-accent/25 to-secondary/25 rounded-full animate-float-slow"></div>
      <div className="absolute top-2/3 left-10 w-18 h-18 bg-gradient-to-br from-primary/25 to-teal/25 rounded-full animate-wiggle"></div>
      
      {/* Small floating shapes */}
      <div className="absolute top-1/3 left-1/2 w-12 h-12 bg-gradient-to-br from-coral/30 to-orange/30 rounded-full animate-float"></div>
      <div className="absolute bottom-1/2 right-1/3 w-14 h-14 bg-gradient-to-br from-teal/30 to-primary/30 rounded-full animate-bounce-gentle"></div>
      <div className="absolute top-3/4 right-20 w-10 h-10 bg-gradient-to-br from-secondary/30 to-accent/30 rounded-full animate-wiggle"></div>
      
      {/* Icon elements */}
      <div className="absolute top-1/4 right-1/4 text-coral/30 animate-float">
        <Sun size={32} />
      </div>
      <div className="absolute bottom-1/4 left-1/4 text-primary/30 animate-bounce-gentle">
        <Waves size={28} />
      </div>
      <div className="absolute top-1/2 left-1/3 text-teal/30 animate-wiggle">
        <Sparkles size={24} />
      </div>
      <div className="absolute bottom-1/3 right-1/2 text-orange/30 animate-float-slow">
        <Moon size={26} />
      </div>
      <div className="absolute top-2/3 right-1/4 text-secondary/30 animate-bounce-gentle">
        <TreePine size={30} />
      </div>
      <div className="absolute bottom-1/2 left-1/2 text-accent/30 animate-wiggle">
        <Flower size={22} />
      </div>
      
      {/* Sparkle effects scattered throughout */}
      <div className="absolute top-1/5 left-1/5 text-primary/20 animate-wiggle">
        <Sparkles size={16} />
      </div>
      <div className="absolute bottom-1/5 right-1/5 text-coral/20 animate-float">
        <Sparkles size={18} />
      </div>
      <div className="absolute top-2/5 right-2/5 text-teal/20 animate-bounce-gentle">
        <Sparkles size={14} />
      </div>
      <div className="absolute bottom-2/5 left-2/5 text-orange/20 animate-float-slow">
        <Sparkles size={20} />
      </div>
      <div className="absolute top-3/5 left-3/5 text-secondary/20 animate-wiggle">
        <Sparkles size={12} />
      </div>
      <div className="absolute bottom-3/5 right-3/5 text-accent/20 animate-bounce-gentle">
        <Sparkles size={16} />
      </div>
      
      {/* Tiny scattered elements */}
      <div className="absolute top-1/6 right-1/6 w-6 h-6 bg-coral/40 rounded-full animate-float"></div>
      <div className="absolute bottom-1/6 left-1/6 w-8 h-8 bg-primary/40 rounded-full animate-bounce-gentle"></div>
      <div className="absolute top-5/6 left-5/6 w-4 h-4 bg-teal/40 rounded-full animate-wiggle"></div>
      <div className="absolute bottom-5/6 right-5/6 w-5 h-5 bg-orange/40 rounded-full animate-float-slow"></div>
    </div>
  );
};

export default FloatingElements;