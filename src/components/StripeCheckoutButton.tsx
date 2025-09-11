import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, Calculator, DollarSign } from 'lucide-react';
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
  showFinancingOptions?: boolean;
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
  showFinancingOptions = true,
  cartItems
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isFinancingLoading, setIsFinancingLoading] = useState(false);
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
  const handleFinancing = async () => {
    try {
      setIsFinancingLoading(true);

      // Create comprehensive financing application with Lyon Financial
      const financingData = {
        productName,
        price,
        quantity,
        productId
      };

      // Enhanced Lyon Financial URL with comprehensive product data
      const lyonFinancialUrl = `https://www.lyonfinancial.net/apply/?` + `amount=${price * quantity}&` + `product=${encodeURIComponent(productName)}&` + `description=${encodeURIComponent(`Complete pool configuration including ${productName}`)}&` + `monthly_payment=${Math.round(price * quantity * 0.008)}&` + `loan_term=60&` + `project_type=Pool%20Installation`;
      window.open(lyonFinancialUrl, '_blank');
      toast({
        title: "Financing Application",
        description: "Opening Lyon Financial application in a new tab.",
        variant: "default"
      });
    } catch (error) {
      console.error('Financing error:', error);
      toast({
        title: "Financing Error",
        description: "Failed to open financing application. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsFinancingLoading(false);
    }
  };
  const calculateMonthlyPayment = (amount: number, months: number = 60, rate: number = 0.0799) => {
    const monthlyRate = rate / 12;
    const payment = amount * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
    return payment;
  };
  const totalAmount = price * quantity;
  const monthlyPayment = calculateMonthlyPayment(totalAmount);

  // Show both Stripe checkout and Lyon Financial options
  return <div className="flex flex-col gap-2 w-full">
      
      
      {showFinancingOptions}
    </div>;
};
export default StripeCheckoutButton;