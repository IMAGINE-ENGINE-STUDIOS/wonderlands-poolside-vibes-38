import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
const Footer = () => {
  return <footer className="bg-gradient-to-br from-primary/5 via-background to-teal/5 border-t border-border/50">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src="/lovable-uploads/155c5b3a-8bd3-4060-8141-7cf76cb9f153.png" alt="Wonderlands Logo" className="w-12 h-12" />
              <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-coral to-teal">
                Wonderlands
              </h3>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Transform your backyard into your personal oasis with premium fiberglass pools and patios. Where lifestyle meets luxury.
            </p>
            <div className="flex items-center gap-2">
              <div className="flex items-center text-orange">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <span className="text-sm text-muted-foreground">500+ Happy Customers</span>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">+1 4077604873</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-teal" />
                <span className="text-muted-foreground">sales@wonderlandsworld.com</span>
              </div>
              
              <div className="flex items-center gap-3 text-sm">
                <Clock className="w-4 h-4 text-orange" />
                <span className="text-muted-foreground">Opens 24/7 </span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            
            <div className="space-y-2">
              {["Pool Installation", "Pool Renovation", "LED Lighting Systems", "Salt Water Systems", "Pool Equipment", "Maintenance & Repair"].map((service, idx) => <div key={idx} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-gradient-to-r from-primary to-teal rounded-full"></div>
                  <span className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {service}
                  </span>
                </div>)}
              {/* Referral Program Link */}
              <Link to="/referral" className="flex items-center gap-2 group">
                <div className="w-1.5 h-1.5 bg-gradient-to-r from-coral to-orange rounded-full"></div>
                <span className="text-sm text-coral hover:text-orange transition-colors font-medium">
                  REFER TO EARN - 5% Commission
                </span>
              </Link>
            </div>
          </div>

          {/* Social & CTA */}
          
        </div>

        <Separator className="my-8" />
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">© 2025 Wonderlands Worlds Entertainment. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <span className="hover:text-foreground cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">Warranty</span>
          </div>
        </div>
      </div>
    </footer>;
};
export default Footer;