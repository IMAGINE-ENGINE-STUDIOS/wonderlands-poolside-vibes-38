
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Waves, 
  Palette, 
  Shield, 
  Sparkles, 
  Sun,
  Settings,
  Grid3X3,
  Eye,
  HomeIcon
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const RightNavigation = () => {
  const { profile } = useAuth();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const navigationItems = [
    { id: 'pools', label: 'Pools', icon: Waves },
    { id: 'spas', label: 'Spas', icon: Sparkles },
    { id: 'finishes', label: 'Finishes', icon: Palette },
    { id: 'covers', label: 'Covers', icon: Shield },
    { id: 'screen-enclosures', label: 'Screens', icon: Grid3X3 },
    { id: 'pavers', label: 'Pavers', icon: Sun },
    { id: 'tiles', label: 'Tiles', icon: Settings }
  ];

  const adminItems = profile?.role === 'main_admin' ? [
    { 
      href: '/admin', 
      label: 'Admin', 
      icon: Settings,
      external: true 
    },
    { 
      href: '/content-editor', 
      label: 'Content Editor', 
      icon: Eye,
      external: true 
    }
  ] : profile?.role === 'supplier' ? [
    { 
      href: '/admin', 
      label: 'Dashboard', 
      icon: Settings,
      external: true 
    }
  ] : profile?.role === 'installer' ? [
    { 
      href: '/admin', 
      label: 'Dashboard', 
      icon: Settings,
      external: true 
    }
  ] : [];

  return (
    <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-40 hidden lg:block">
      <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg p-2 shadow-lg">
        <div className="flex flex-col gap-2">
          {/* Home button */}
          <Button
            variant="ghost"
            size="sm"
            className="w-12 h-12 p-0 hover:bg-primary/10 hover:text-primary transition-colors"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            title="Home"
          >
            <HomeIcon className="h-5 w-5" />
          </Button>
          
          {/* Section navigation */}
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                className="w-12 h-12 p-0 hover:bg-primary/10 hover:text-primary transition-colors"
                onClick={() => scrollToSection(item.id)}
                title={item.label}
              >
                <Icon className="h-5 w-5" />
              </Button>
            );
          })}
          
          {/* Admin items */}
          {adminItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.href}
                variant="ghost"
                size="sm"
                className="w-12 h-12 p-0 hover:bg-primary/10 hover:text-primary transition-colors"
                onClick={() => window.location.href = item.href}
                title={item.label}
              >
                <Icon className="h-5 w-5" />
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RightNavigation;
