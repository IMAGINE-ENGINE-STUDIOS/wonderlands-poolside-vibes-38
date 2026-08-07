import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, Calculator } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import SurveyQuoteTool from './SurveyQuoteTool';
interface StripeCheckoutButtonProps {
  productId: string;
  productName: string;
  price: number;
  quantity?: number;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "gradient";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  cartItems?: any[]; // Optional cart items for cart checkout
}
const StripeCheckoutButton: React.FC<StripeCheckoutButtonProps> = ({
  productId,
  productName,
  price,
  quantity = 1,
  variant = "default",
  size = "default",
  className = "",
  cartItems
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showQuoteTool, setShowQuoteTool] = useState(false);
  const {
    toast
  } = useToast();
  const handleCheckout = async () => {
    try {
      setIsLoading(true);
      const {
        data,
        error
      } = await supabase.functions.invoke('stripe-checkout', {
        body: {
          productId,
          productName,
          price,
          quantity,
          cartItems
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
  const totalAmount = price * quantity;

  // Prepare cart items data for quote
  const quoteCartItems = cartItems || [{
    name: productName,
    price: price,
    quantity: quantity
  }];

  return <>
      <div className="flex flex-col gap-2 w-full">
        <Button onClick={handleCheckout} disabled={isLoading} variant={variant} size={size} className={`${className} gap-2`}>
          {isLoading ? <>
              <Calculator className="h-4 w-4 animate-spin" />
              Processing...
            </> : <>
              <CreditCard className="h-4 w-4" />
              Checkout ${totalAmount.toLocaleString()}
            </>}
        </Button>
      </div>

      <SurveyQuoteTool pool={null} isOpen={showQuoteTool} onClose={() => setShowQuoteTool(false)} customProduct={{
      name: cartItems ? `Cart Items (${cartItems.length})` : productName,
      price: totalAmount,
      type: 'product',
      image: undefined
    }} />
    </>;
};
export default StripeCheckoutButton;