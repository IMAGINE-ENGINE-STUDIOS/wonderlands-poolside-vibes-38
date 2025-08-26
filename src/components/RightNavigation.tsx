
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  Package, 
  Briefcase, 
  Shield, 
  User, 
  Waves, 
  ChevronRight, 
  ChevronDown,
  Palette,
  Truck,
  Settings,
  HelpCircle,
  ShoppingCart
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const RightNavigation = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [sectionsExpanded, setSectionsExpanded] = useState({
    catalog: false,
    admin: false
  });
  
  const { user, profile } = useAuth();
  const location = useLocation();

  const toggleSection = (section: keyof typeof sectionsExpanded) => {
    setSectionsExpanded(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      action: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
      show: true
    },
    {
      id: 'cart',
      label: 'Cart',
      icon: ShoppingCart,
      action: () => window.dispatchEvent(new CustomEvent('open-cart')),
      show: true
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: Truck,
      action: () => window.dispatchEvent(new CustomEvent('open-orders')),
      show: true
    },
    {
      id: 'catalog-section',
      label: 'Catalog',
      icon: Package,
      expandable: true,
      show: location.pathname === '/',
      items: [
        { id: 'pool-catalog', label: 'Pools', icon: Waves },
        { id: 'spa-section', label: 'Spas', icon: Waves },
        { id: 'finishes-section', label: 'Finishes', icon: Palette },
        { id: 'pavers-section', label: 'Pavers', icon: Package },
      ]
    },
    {
      id: 'procurement',
      label: 'Jobs',
      icon: Briefcase,
      link: '/procurement',
      show: true,
      badge: 'New'
    }
  ];

  const adminItems = [
    {
      id: 'admin',
      label: 'Admin Dashboard',
      icon: Shield,
      link: '/admin',
      show: !!user
    },
    // Only show content editor link to main admins
    ...(profile?.role === 'main_admin' ? [{
      id: 'content-editor',
      label: 'Content Editor',
      icon: Settings,
      link: '/content-editor',
      show: true
    }] : []),
    {
      id: 'auth',
      label: user ? 'Account' : 'Sign In',
      icon: User,
      link: user ? '/admin' : '/auth',
      show: true
    }
  ];

  return (
    <div 
      className={`fixed right-4 top-1/2 -translate-y-1/2 z-40 transition-all duration-300 ${
        isExpanded ? 'w-64' : 'w-12'
      }`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <Card className="bg-background/95 backdrop-blur-sm border-primary/20 shadow-lg overflow-hidden">
        {/* Main Navigation */}
        <div className="p-2 space-y-1">
          {navItems.filter(item => item.show).map((item) => (
            <div key={item.id}>
              {item.expandable ? (
                <div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-between text-xs hover:bg-primary/10"
                    onClick={() => toggleSection('catalog')}
                  >
                    <div className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span className={`transition-opacity ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
                        {item.label}
                      </span>
                    </div>
                    {isExpanded && (
                      sectionsExpanded.catalog ? 
                        <ChevronDown className="h-3 w-3 ml-auto" /> : 
                        <ChevronRight className="h-3 w-3 ml-auto" />
                    )}
                  </Button>
                  
                  {sectionsExpanded.catalog && isExpanded && item.items && (
                    <div className="ml-2 mt-1 space-y-0.5 border-l border-primary/20 pl-2">
                      {item.items.map((subItem) => (
                        <Button
                          key={subItem.id}
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-xs h-7 hover:bg-primary/10"
                          onClick={() => scrollToSection(subItem.id)}
                        >
                          <subItem.icon className="h-3 w-3 mr-2" />
                          {subItem.label}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              ) : item.link ? (
                <Link to={item.link} className="block">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs hover:bg-primary/10"
                  >
                    <item.icon className="h-4 w-4" />
                    <span className={`ml-2 transition-opacity ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
                      {item.label}
                    </span>
                    {item.badge && isExpanded && (
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                </Link>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs hover:bg-primary/10"
                  onClick={item.action}
                >
                  <item.icon className="h-4 w-4" />
                  <span className={`ml-2 transition-opacity ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
                    {item.label}
                  </span>
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Admin Section */}
        {isExpanded && (
          <>
            <div className="border-t border-primary/20 p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-between text-xs hover:bg-primary/10 mb-1"
                onClick={() => toggleSection('admin')}
              >
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>Admin</span>
                </div>
                {sectionsExpanded.admin ? 
                  <ChevronDown className="h-3 w-3" /> : 
                  <ChevronRight className="h-3 w-3" />
                }
              </Button>
              
              {sectionsExpanded.admin && (
                <div className="ml-2 space-y-0.5 border-l border-primary/20 pl-2">
                  {adminItems.filter(item => item.show).map((item) => (
                    <Link key={item.id} to={item.link} className="block">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-xs h-7 hover:bg-primary/10"
                      >
                        <item.icon className="h-3 w-3 mr-2" />
                        {item.label}
                      </Button>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Help Section */}
            <div className="border-t border-primary/20 p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-xs hover:bg-primary/10"
              >
                <HelpCircle className="h-4 w-4" />
                <span className="ml-2">Help</span>
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default RightNavigation;
