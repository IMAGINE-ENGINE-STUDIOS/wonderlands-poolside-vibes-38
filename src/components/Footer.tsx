import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { OptimizedImage } from "./OptimizedImage";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-background" itemScope itemType="https://schema.org/LocalBusiness">
      <div className="mx-auto max-w-[1600px] px-6 py-16 md:px-12">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3">
          {/* Brand */}
          <div className="space-y-6">
            <OptimizedImage
              src="/logo/wonderlands-logo.webp"
              alt="Wonderlands Logo"
              className="h-10 w-auto"
              sizeConfig="logoSmall"
            />
            <p className="text-sm leading-relaxed text-muted-foreground">
              Transform your backyard into your personal oasis with premium fiberglass pools and patios. Where lifestyle meets luxury.
            </p>
          </div>

          {/* Contact */}
          <div className="space-y-6">
            <h4 className="font-serif text-lg tracking-tight text-foreground">Contact</h4>
            <dl className="space-y-4 text-sm text-muted-foreground">
              <div>
                <dt className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground/70">Phone</dt>
                <dd className="mt-1">
                  <a href="tel:+14077604873" className="hover:text-foreground transition-colors" itemProp="telephone">
                    +1 (407) 760-4873
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground/70">Email</dt>
                <dd className="mt-1">
                  <a href="mailto:sales@wonderlandsworld.com" className="hover:text-foreground transition-colors" itemProp="email">
                    sales@wonderlandsworld.com
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground/70">Address</dt>
                <dd className="mt-1" itemProp="address">
                  6900 Tavistock Lakes Boulevard Southeast Orlando, Suite 400, Lake Nona Center, Orlando, FL 32827
                </dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground/70">Hours</dt>
                <dd className="mt-1">Open 24/7</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground/70">License</dt>
                <dd className="mt-1">Powered by Wonderlands Platform. Installed by Licensed GC Tech Terra Corp #CGC1537275</dd>
              </div>
            </dl>
          </div>

          {/* Resources */}
          <div className="space-y-6">
            <h4 className="font-serif text-lg tracking-tight text-foreground">Resources</h4>
            <nav className="flex flex-col gap-3 text-sm text-muted-foreground">
              <Link to="/referral" className="hover:text-foreground transition-colors">
                Refer to Earn — 5% Commission
              </Link>
              <Link to="/sales-rep-register" className="hover:text-foreground transition-colors">
                Join Our Sales Team
              </Link>
              <Link to="/sales-rep-login" className="hover:text-foreground transition-colors">
                Sales Rep Login
              </Link>
              <Link to="/contractor-registration" className="hover:text-foreground transition-colors">
                Register as Contractor
              </Link>
              <Link to="/contractor-login" className="hover:text-foreground transition-colors">
                Contractor Login
              </Link>
              <Link to="/jobs" className="hover:text-foreground transition-colors">
                Careers — We're Hiring!
              </Link>
            </nav>
          </div>
        </div>

        <Separator className="my-12" />

        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground">© 2025 Wonderlands Worlds Entertainment. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <span className="cursor-pointer transition-colors hover:text-foreground">Privacy Policy</span>
            <span className="cursor-pointer transition-colors hover:text-foreground">Terms of Service</span>
            <span className="cursor-pointer transition-colors hover:text-foreground">Warranty</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
