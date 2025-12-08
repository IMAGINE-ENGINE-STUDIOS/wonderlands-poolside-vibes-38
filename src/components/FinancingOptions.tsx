import { useState } from "react";
import { CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface FinancingOptionsProps {
  totalPrice: number;
  productName?: string;
  compact?: boolean;
  productId?: string;
}

const FinancingOptions = ({ totalPrice, productName = "Product", compact = false, productId = "product" }: FinancingOptionsProps) => {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const { toast } = useToast();

  // Accurate monthly payment calculation with APR
  const calculateMonthly = (months: number, apr: number = 0.0999) => {
    const monthlyRate = apr / 12;
    const payment = totalPrice * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
    return Math.round(payment);
  };

  const handleCheckoutWithProvider = async (provider: 'klarna' | 'affirm' | 'card') => {
    try {
      setLoadingProvider(provider);
      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: {
          productId,
          productName,
          price: totalPrice,
          quantity: 1,
          paymentMethod: provider
        }
      });

      if (error) throw error;
      if (data?.url) {
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
      setLoadingProvider(null);
    }
  };

  const handleLyonFinancial = () => {
    const lyonFinancialUrl =
      `https://www.lyonfinancial.net/apply/?` +
      `amount=${totalPrice}&` +
      `product=${encodeURIComponent(productName)}&` +
      `description=${encodeURIComponent(`Complete configuration including ${productName}`)}&` +
      `monthly_payment=${calculateMonthly(60)}&` +
      `loan_term=60&` +
      `project_type=Pool%20Installation`;
    window.open(lyonFinancialUrl, "_blank");
  };

  if (compact) {
    return (
      <div className="p-3 bg-muted/50 rounded-lg">
        <p className="text-xs font-medium mb-2 flex items-center gap-1.5">
          <CreditCard className="h-3.5 w-3.5" />
          Pay Over Time
        </p>
        
        {/* Monthly estimates */}
        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
          <div className="text-center p-2 bg-background rounded-md border">
            <div className="font-semibold">24 mo</div>
            <div className="text-primary font-bold">${calculateMonthly(24).toLocaleString()}</div>
          </div>
          <div className="text-center p-2 bg-background rounded-md border">
            <div className="font-semibold">48 mo</div>
            <div className="text-primary font-bold">${calculateMonthly(48).toLocaleString()}</div>
          </div>
        </div>
        
        {/* Provider buttons */}
        <div className="flex gap-1.5">
          <button
            onClick={() => handleCheckoutWithProvider('klarna')}
            disabled={loadingProvider === 'klarna'}
            className="flex-1 py-1.5 px-2 bg-[#FFB3C7] hover:bg-[#FF9AB2] rounded text-[10px] font-bold text-black transition-colors disabled:opacity-50"
          >
            {loadingProvider === 'klarna' ? '...' : 'Klarna'}
          </button>
          <button
            onClick={() => handleCheckoutWithProvider('affirm')}
            disabled={loadingProvider === 'affirm'}
            className="flex-1 py-1.5 px-2 bg-[#0FA0EA] hover:bg-[#0D8AD0] rounded text-[10px] font-bold text-white transition-colors disabled:opacity-50"
          >
            {loadingProvider === 'affirm' ? '...' : 'Affirm'}
          </button>
          <button
            onClick={handleLyonFinancial}
            className="flex-1 py-1.5 px-2 bg-[#1E3A5F] hover:bg-[#152B47] rounded text-[10px] font-bold text-white transition-colors"
          >
            Lyon
          </button>
        </div>
        
        <p className="text-[9px] text-muted-foreground text-center mt-2">
          *Subject to credit approval
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4 bg-gradient-to-r from-teal/5 to-primary/5 rounded-lg border border-teal/20">
      <h5 className="font-semibold text-sm text-foreground flex items-center gap-2">
        <CreditCard className="h-4 w-4" />
        Financing Options
      </h5>

      {/* Payment Terms Grid */}
      <div className="grid grid-cols-4 gap-1.5 text-xs">
        {[24, 36, 48, 60].map((months) => (
          <div key={months} className="text-center p-2 bg-background rounded border">
            <div className="font-semibold text-muted-foreground">{months} mo</div>
            <div className="text-primary font-bold">${calculateMonthly(months).toLocaleString()}</div>
          </div>
        ))}
      </div>

      {/* Provider buttons */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => handleCheckoutWithProvider('klarna')}
          disabled={loadingProvider === 'klarna'}
          className="py-2 px-3 bg-[#FFB3C7] hover:bg-[#FF9AB2] rounded-md text-xs font-bold text-black transition-colors disabled:opacity-50"
        >
          {loadingProvider === 'klarna' ? '...' : 'Klarna'}
        </button>
        <button
          onClick={() => handleCheckoutWithProvider('affirm')}
          disabled={loadingProvider === 'affirm'}
          className="py-2 px-3 bg-[#0FA0EA] hover:bg-[#0D8AD0] rounded-md text-xs font-bold text-white transition-colors disabled:opacity-50"
        >
          {loadingProvider === 'affirm' ? '...' : 'Affirm'}
        </button>
        <button
          onClick={handleLyonFinancial}
          className="py-2 px-3 bg-[#1E3A5F] hover:bg-[#152B47] rounded-md text-xs font-bold text-white transition-colors"
        >
          Lyon Financial
        </button>
      </div>

      <p className="text-[10px] text-muted-foreground text-center">
        *Financing subject to credit approval. APR ~9.99%
      </p>
    </div>
  );
};

export default FinancingOptions;
