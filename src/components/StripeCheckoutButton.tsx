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
}

const StripeCheckoutButton: React.FC<StripeCheckoutButtonProps> = ({
  productId,
  productName,
  price,
  quantity = 1,
  variant = "default",
  size = "default",
  className = "",
  showFinancingOptions = true
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isFinancingLoading, setIsFinancingLoading] = useState(false);
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

  const handleFinancing = async () => {
    try {
      setIsFinancingLoading(true);
      
      // Create financing application with Lyon Financial
      const financingData = {
        productName,
        price,
        quantity,
        productId
      };
      
      // Open Lyon Financial application in new tab
      const lyonFinancialUrl = `https://www.lyonfinancial.net/apply/?amount=${price * quantity}&product=${encodeURIComponent(productName)}`;
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
    const payment = (amount * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                   (Math.pow(1 + monthlyRate, months) - 1);
    return payment;
  };

  const totalAmount = price * quantity;
  const monthlyPayment = calculateMonthlyPayment(totalAmount);

  if (!showFinancingOptions) {
    return (
      <Button
        onClick={handleCheckout}
        disabled={isLoading}
        variant={variant}
        size={size}
        className={`${className} ${isLoading ? 'opacity-50' : ''}`}
      >
        <CreditCard className="h-4 w-4 mr-2" />
        {isLoading ? 'Processing...' : `Buy Now - $${totalAmount.toLocaleString()}`}
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Pay in Full Option */}
      <Button
        onClick={handleCheckout}
        disabled={isLoading || isFinancingLoading}
        variant={variant}
        size={size}
        className={`${className} ${isLoading ? 'opacity-50' : ''}`}
      >
        <CreditCard className="h-4 w-4 mr-2" />
        {isLoading ? 'Processing...' : `Pay in Full - $${totalAmount.toLocaleString()}`}
      </Button>

      {/* Financing Option */}
      <div className="border rounded-lg p-3 bg-gradient-to-r from-muted/30 to-muted/50 border-primary/20">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Calculator className="h-4 w-4 text-primary" />
            <span className="font-medium text-sm">Finance This Purchase</span>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">As low as</div>
            <div className="text-sm font-bold text-primary">${monthlyPayment.toFixed(0)}/mo</div>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs text-muted-foreground">
            60 months at 7.99% APR*
          </div>
          <div className="text-xs text-green-600 font-medium">
            Lyon Financial
          </div>
        </div>
        
        <Button
          onClick={handleFinancing}
          disabled={isFinancingLoading || isLoading}
          variant="outline"
          size="sm"
          className={`w-full border-primary/30 hover:border-primary ${isFinancingLoading ? 'opacity-50' : ''}`}
        >
          <DollarSign className="h-3 w-3 mr-2" />
          {isFinancingLoading ? 'Opening...' : 'Apply for Financing'}
        </Button>
      </div>
    </div>
  );
};

export default StripeCheckoutButton;