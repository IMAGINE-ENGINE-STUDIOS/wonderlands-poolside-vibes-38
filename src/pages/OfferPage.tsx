import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, Phone, MessageCircle, ArrowLeft, Check } from "lucide-react";
import Footer from "@/components/Footer";

interface Promotion {
  id: string;
  name: string;
  description: string | null;
  bundle_price: number;
  original_price: number | null;
  included_items: Array<{ name: string; value?: string }>;
  highlight_text: string | null;
  image_url: string | null;
  terms_conditions: string | null;
  end_date: string | null;
  is_active: boolean;
}

const OfferPage = () => {
  const { id } = useParams<{ id: string }>();
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      const { data } = await supabase
        .from("promotions")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      setPromotion(data as unknown as Promotion);
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!promotion) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
        <h1 className="text-2xl font-bold mb-2">Offer not found</h1>
        <p className="text-muted-foreground mb-6">This promotion may have ended or been removed.</p>
        <Link to="/">
          <Button>Back to Home</Button>
        </Link>
      </div>
    );
  }

  const savings = promotion.original_price ? promotion.original_price - promotion.bundle_price : 0;
  const items = Array.isArray(promotion.included_items) ? promotion.included_items : [];

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to Wonderlands World
          </Link>
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Exclusive Offer</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 grid lg:grid-cols-2 gap-10">
        <div className="rounded-xl overflow-hidden bg-muted aspect-[4/3]">
          {promotion.image_url ? (
            <img src={promotion.image_url} alt={promotion.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">No image</div>
          )}
        </div>

        <div>
          {promotion.highlight_text && (
            <span className="inline-block bg-[#f97066] text-white px-3 py-1 rounded text-xs font-bold uppercase tracking-wider mb-4">
              {promotion.highlight_text}
            </span>
          )}
          <h1 className="text-4xl font-bold text-foreground mb-3">{promotion.name}</h1>
          {promotion.description && (
            <p className="text-muted-foreground text-lg mb-6 leading-relaxed">{promotion.description}</p>
          )}

          <div className="flex items-baseline gap-3 mb-6 flex-wrap">
            <span className="text-4xl font-bold text-[#0891b2]">${promotion.bundle_price.toLocaleString()}</span>
            {promotion.original_price && (
              <span className="text-xl text-muted-foreground line-through">
                ${promotion.original_price.toLocaleString()}
              </span>
            )}
            {savings > 0 && (
              <span className="bg-green-500/10 text-green-700 dark:text-green-400 px-2 py-1 rounded text-sm font-semibold">
                Save ${savings.toLocaleString()}
              </span>
            )}
          </div>

          {items.length > 0 && (
            <div className="mb-8">
              <h3 className="font-semibold text-foreground mb-3">What's included:</h3>
              <ul className="space-y-2">
                {items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-foreground">
                    <Check className="h-5 w-5 text-[#0891b2] shrink-0 mt-0.5" />
                    <span>
                      {item.name}
                      {item.value && <span className="text-muted-foreground"> — {item.value}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="border-t border-border pt-6 space-y-3">
            <h3 className="font-semibold text-foreground">Claim this offer — contact us:</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <a href="tel:+12392570637" className="flex-1">
                <Button className="w-full" variant="outline">
                  <Phone className="h-4 w-4 mr-2" /> Call
                </Button>
              </a>
              <a href="mailto:sales@wonderlandsworld.com" className="flex-1">
                <Button className="w-full" variant="outline">
                  <Mail className="h-4 w-4 mr-2" /> Email
                </Button>
              </a>
              <a href="https://wa.me/12392570637" target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button className="w-full bg-[#0891b2] hover:bg-[#0e7490] text-white">
                  <MessageCircle className="h-4 w-4 mr-2" /> WhatsApp
                </Button>
              </a>
            </div>
            <a
              href="https://calendly.com/wonderlandsworlds/30min"
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button className="w-full bg-[#f97066] hover:bg-[#ea5d52] text-white">
                Schedule a Free Consultation
              </Button>
            </a>
          </div>

          {promotion.terms_conditions && (
            <p className="text-xs text-muted-foreground mt-6 leading-relaxed">{promotion.terms_conditions}</p>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default OfferPage;
