import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, CheckCircle2, Clock, DollarSign } from 'lucide-react';

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
}

interface PromotionsBannerProps {
  variant?: 'dark' | 'light';
}

const PromotionsBanner = ({ variant = 'light' }: PromotionsBannerProps) => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivePromotions = async () => {
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setPromotions(data as unknown as Promotion[]);
      }
      setLoading(false);
    };
    fetchActivePromotions();
  }, []);

  if (loading || promotions.length === 0) return null;

  const isDark = variant === 'dark';

  return (
    <div className="space-y-4">
      {promotions.map((promo) => {
        const savings = promo.original_price ? promo.original_price - promo.bundle_price : 0;

        return (
          <Card
            key={promo.id}
            className={isDark
              ? 'holographic-panel border-amber-500/30 overflow-hidden'
              : 'border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 overflow-hidden'
            }
          >
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row">
                {promo.image_url && (
                  <div className="w-full md:w-48 h-40 md:h-auto flex-shrink-0">
                    <img loading="lazy" decoding="async"
                      src={promo.image_url}
                      alt={promo.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-5 flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Flame className={`h-5 w-5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                        <h3 className={`text-lg font-bold ${isDark ? 'text-amber-300 font-mono' : 'text-amber-900'}`}>
                          {promo.name}
                        </h3>
                      </div>
                      {promo.highlight_text && (
                        <Badge className={isDark
                          ? 'bg-green-500/20 text-green-300 border-green-500/30'
                          : 'bg-green-100 text-green-700 border-green-300'
                        }>
                          {promo.highlight_text}
                        </Badge>
                      )}
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${isDark ? 'text-cyan-300 font-mono' : 'text-amber-900'}`}>
                        ${promo.bundle_price.toLocaleString()}
                      </p>
                      {promo.original_price && (
                        <p className={`text-sm line-through ${isDark ? 'text-cyan-400/50' : 'text-muted-foreground'}`}>
                          ${promo.original_price.toLocaleString()}
                        </p>
                      )}
                      {savings > 0 && (
                        <Badge className={isDark
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 mt-1'
                          : 'bg-emerald-100 text-emerald-700 border-emerald-300 mt-1'
                        }>
                          <DollarSign className="h-3 w-3 mr-0.5" />
                          Save ${savings.toLocaleString()}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {promo.description && (
                    <p className={`text-sm mb-3 ${isDark ? 'text-cyan-400/80' : 'text-muted-foreground'}`}>
                      {promo.description}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    {(promo.included_items || []).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className={`h-4 w-4 flex-shrink-0 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                        <span className={`text-sm ${isDark ? 'text-cyan-300 font-mono' : 'text-foreground'}`}>
                          {item.name}
                        </span>
                      </div>
                    ))}
                  </div>

                  {promo.terms_conditions && (
                    <div className={`flex items-center gap-1 mt-3 ${isDark ? 'text-cyan-400/50' : 'text-muted-foreground'}`}>
                      <Clock className="h-3 w-3" />
                      <p className="text-xs">{promo.terms_conditions}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default PromotionsBanner;
