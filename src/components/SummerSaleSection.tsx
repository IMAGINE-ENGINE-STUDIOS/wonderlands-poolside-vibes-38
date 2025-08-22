import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Calendar, 
  Timer, 
  Waves, 
  Sun,
  Thermometer,
  Sparkles
} from 'lucide-react';

const SummerSaleSection = () => {
  const saleEndDate = new Date('2024-09-30');
  const currentDate = new Date();
  const daysLeft = Math.ceil((saleEndDate.getTime() - currentDate.getTime()) / (1000 * 3600 * 24));

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-teal-50 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200/30 rounded-full animate-pulse" />
        <div className="absolute top-40 right-20 w-24 h-24 bg-teal-200/40 rounded-full animate-bounce" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-32 left-1/3 w-40 h-40 bg-sky-200/20 rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Sun Element */}
        <div className="absolute top-10 right-10">
          <div className="wonderlands-sun scale-50">
            <div className="sun-rays">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                <div key={num} className={`sun-ray ray-${num}`} />
              ))}
            </div>
          </div>
        </div>

        {/* Floating Pool Elements */}
        <div className="absolute bottom-20 right-20 animate-bounce" style={{ animationDelay: '0.5s' }}>
          <Waves className="w-16 h-16 text-blue-400/60" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-lg px-6 py-3 animate-pulse">
              <Sparkles className="mr-2 h-5 w-5" />
              SUMMER SALE 2024
            </Badge>
          </div>
          
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-teal-500 to-blue-700 bg-clip-text text-transparent mb-6 animate-fade-in">
            Florida Pool Paradise
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto mb-8 leading-relaxed">
            Transform your backyard into a luxury oasis with our exclusive Florida pool installation deals. 
            Limited time offer - Save up to <span className="font-bold text-orange-600">$15,000</span> on premium installations.
          </p>

          {/* Countdown Timer */}
          <div className="flex justify-center items-center gap-4 mb-8">
            <Timer className="h-6 w-6 text-orange-500" />
            <span className="text-2xl font-bold text-orange-600">
              {daysLeft} days left
            </span>
            <Calendar className="h-6 w-6 text-orange-500" />
          </div>
        </div>

        {/* 3D Scene-like Pool Display */}
        <div className="relative max-w-6xl mx-auto mb-16">
          <div className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-teal-900 rounded-3xl p-8 md:p-16 shadow-2xl">
            {/* Pool Structure - Modern Cabin Style */}
            <div className="relative bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 rounded-2xl overflow-hidden shadow-xl">
              {/* Pool Water Effect */}
              <div className="h-64 md:h-96 bg-gradient-to-br from-blue-400 via-teal-400 to-blue-600 relative overflow-hidden">
                {/* Water Animation */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-800/50 to-transparent" />
                
                {/* Pool Features */}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <Badge className="bg-blue-600/80 text-white backdrop-blur">
                    <Thermometer className="mr-1 h-4 w-4" />
                    Heated
                  </Badge>
                  <Badge className="bg-teal-600/80 text-white backdrop-blur">
                    <Sun className="mr-1 h-4 w-4" />
                    Solar Ready
                  </Badge>
                </div>
              </div>

              {/* Pool Deck */}
              <div className="h-16 bg-gradient-to-r from-amber-100 via-stone-200 to-amber-100 border-t-4 border-stone-300">
                <div className="h-full flex items-center justify-center">
                  <div className="flex gap-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-8 h-2 bg-stone-400 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Florida Location Badge */}
            <div className="absolute -top-4 left-8">
              <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-lg px-4 py-2">
                <MapPin className="mr-2 h-5 w-5" />
                Florida Only
              </Badge>
            </div>
          </div>
        </div>

        {/* Sale Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {[
            {
              icon: <Waves className="h-12 w-12 text-blue-500" />,
              title: "Premium Installation",
              description: "Professional installation with lifetime warranty",
              savings: "Save $5,000"
            },
            {
              icon: <Sun className="h-12 w-12 text-orange-500" />,
              title: "Solar Heating System",
              description: "Eco-friendly heating included at no extra cost",
              savings: "Save $7,000"
            },
            {
              icon: <Thermometer className="h-12 w-12 text-red-500" />,
              title: "Smart Pool Tech",
              description: "Automated cleaning and chemical balancing",
              savings: "Save $3,000"
            }
          ].map((feature, index) => (
            <div 
              key={index} 
              className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-200/50"
            >
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 animate-bounce" style={{ animationDelay: `${index * 0.2}s` }}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{feature.title}</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">{feature.description}</p>
                <Badge className="bg-green-100 text-green-800 border border-green-200">
                  {feature.savings}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-2xl border border-gray-200/50 max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              Ready to Dive In?
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Limited spots available for summer 2024 installations. 
              Book your consultation today and secure your Florida pool paradise.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Get Free Quote
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg font-semibold transition-all duration-300"
              >
                View Gallery
              </Button>
            </div>

            <p className="text-sm text-gray-500 mt-6">
              * Offer valid for Florida residents only. Terms and conditions apply.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SummerSaleSection;