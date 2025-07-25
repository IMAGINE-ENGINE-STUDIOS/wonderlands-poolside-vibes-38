import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, ShoppingCart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface StripeCheckoutButtonProps {
  productId: string;
  productName: string;
  price: number;
  quantity?: number;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "gradient";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

const StripeCheckoutButton: React.FC<StripeCheckoutButtonProps> = ({
  productId,
  productName,
  price,
  quantity = 1,
  variant = "default",
  size = "default",
  className = ""
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCheckout = async () => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: {
          productId,
          quantity
        }
      });

      if (error) throw error;

      if (data?.url) {
        // Open Stripe checkout in new tab
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout Error",
        description: "Failed to create checkout session. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleCheckout}
      disabled={isLoading}
      variant={variant}
      size={size}
      className={`${className} ${isLoading ? 'opacity-50' : ''}`}
    >
      <CreditCard className="h-4 w-4 mr-2" />
      {isLoading ? 'Processing...' : `Buy Now - $${price.toLocaleString()}`}
    </Button>
  );
};

export default StripeCheckoutButton;