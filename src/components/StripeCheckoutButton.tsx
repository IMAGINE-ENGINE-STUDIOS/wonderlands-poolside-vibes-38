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
      
      // Create comprehensive financing application with Lyon Financial
      const financingData = {
        productName,
        price,
        quantity,
        productId
      };
      
      // Enhanced Lyon Financial URL with comprehensive product data
      const lyonFinancialUrl = `https://www.lyonfinancial.net/apply/?` + 
        `amount=${price * quantity}&` +
        `product=${encodeURIComponent(productName)}&` +
        `description=${encodeURIComponent(`Complete pool configuration including ${productName}`)}&` +
        `monthly_payment=${Math.round((price * quantity) * 0.008)}&` +
        `loan_term=60&` +
        `project_type=Pool%20Installation`;
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

  // If showFinancingOptions is true, show integrated financing section
  if (showFinancingOptions) {
    return (
      <div className="flex items-center gap-3 bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/10 rounded-xl p-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Calculator className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="text-sm font-semibold">Finance from ${monthlyPayment.toFixed(0)}/mo</div>
            <div className="text-xs text-muted-foreground">60 months • Lyon Financial</div>
          </div>
        </div>
        
        <Button
          onClick={handleFinancing}
          disabled={isFinancingLoading || isLoading}
          size="sm"
          className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white border-0"
        >
          <DollarSign className="h-3 w-3 mr-1" />
          {isFinancingLoading ? 'Opening...' : 'Apply Now'}
        </Button>
      </div>
    );
  }

  // If showFinancingOptions is false, only show the payment button
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
};

export default StripeCheckoutButton;