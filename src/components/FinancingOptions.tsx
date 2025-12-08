import { Button } from "@/components/ui/button";
import { CreditCard, ExternalLink } from "lucide-react";

interface FinancingOptionsProps {
  totalPrice: number;
  productName?: string;
  compact?: boolean;
}

const FinancingOptions = ({ totalPrice, productName = "Product", compact = false }: FinancingOptionsProps) => {
  const monthlyPayment36 = Math.round(totalPrice / 36);
  const monthlyPayment72 = Math.round(totalPrice / 72);
  const monthlyPayment24 = Math.round(totalPrice / 24);
  const monthlyPayment48 = Math.round(totalPrice / 48);

  const handleLyonFinancial = () => {
    const lyonFinancialUrl =
      `https://www.lyonfinancial.net/apply/?` +
      `amount=${totalPrice}&` +
      `product=${encodeURIComponent(productName)}&` +
      `description=${encodeURIComponent(`Complete configuration including ${productName}`)}&` +
      `monthly_payment=${Math.round(totalPrice * 0.008)}&` +
      `loan_term=60&` +
      `project_type=Pool%20Installation`;
    window.open(lyonFinancialUrl, "_blank");
  };

  const handleKlarna = () => {
    // Klarna financing application - opens their checkout flow
    window.open(`https://www.klarna.com/us/`, "_blank");
  };

  const handleAffirm = () => {
    // Affirm financing application
    window.open(`https://www.affirm.com/`, "_blank");
  };

  if (compact) {
    return (
      <div className="p-2 sm:p-3 bg-muted/50 rounded-lg">
        <p className="text-[10px] sm:text-xs font-medium mb-1.5 sm:mb-2 flex items-center gap-1">
          <CreditCard className="h-3 w-3" />
          Financing Options:
        </p>
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2 text-[10px] sm:text-xs mb-2">
          <div className="text-center p-1.5 sm:p-2 bg-background rounded border">
            <div className="font-semibold text-[10px] sm:text-xs">36 months</div>
            <div className="text-primary text-[10px] sm:text-xs">${monthlyPayment36.toLocaleString()}/mo</div>
          </div>
          <div className="text-center p-1.5 sm:p-2 bg-background rounded border">
            <div className="font-semibold text-[10px] sm:text-xs">72 months</div>
            <div className="text-primary text-[10px] sm:text-xs">${monthlyPayment72.toLocaleString()}/mo</div>
          </div>
        </div>
        
        {/* Financing Provider Logos */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
          <button
            onClick={handleKlarna}
            className="flex items-center gap-1 px-2 py-1 bg-[#FFB3C7] hover:bg-[#FF9AB2] rounded text-[10px] font-bold text-black transition-colors"
          >
            Klarna
            <ExternalLink className="h-2.5 w-2.5" />
          </button>
          <button
            onClick={handleAffirm}
            className="flex items-center gap-1 px-2 py-1 bg-[#0FA0EA] hover:bg-[#0D8AD0] rounded text-[10px] font-bold text-white transition-colors"
          >
            Affirm
            <ExternalLink className="h-2.5 w-2.5" />
          </button>
          <button
            onClick={handleLyonFinancial}
            className="flex items-center gap-1 px-2 py-1 bg-[#1E3A5F] hover:bg-[#152B47] rounded text-[10px] font-bold text-white transition-colors"
          >
            Lyon
            <ExternalLink className="h-2.5 w-2.5" />
          </button>
        </div>
        
        <p className="text-[8px] sm:text-[10px] text-muted-foreground text-center mt-1.5">
          *Subject to credit approval. APR varies.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 bg-gradient-to-r from-teal/5 to-primary/5 rounded-lg border border-teal/20">
      <h5 className="font-semibold text-sm text-foreground flex items-center gap-2">
        <CreditCard className="h-4 w-4" />
        Flexible Financing Options
      </h5>

      {/* Payment Terms Grid */}
      <div className="grid grid-cols-4 gap-2 text-xs">
        <div className="text-center p-2 bg-background rounded border">
          <div className="font-semibold">24 mo</div>
          <div className="text-teal-600">${monthlyPayment24.toLocaleString()}/mo</div>
        </div>
        <div className="text-center p-2 bg-background rounded border">
          <div className="font-semibold">36 mo</div>
          <div className="text-teal-600">${monthlyPayment36.toLocaleString()}/mo</div>
        </div>
        <div className="text-center p-2 bg-background rounded border">
          <div className="font-semibold">48 mo</div>
          <div className="text-teal-600">${monthlyPayment48.toLocaleString()}/mo</div>
        </div>
        <div className="text-center p-2 bg-background rounded border">
          <div className="font-semibold">72 mo</div>
          <div className="text-teal-600">${monthlyPayment72.toLocaleString()}/mo</div>
        </div>
      </div>

      {/* Financing Provider Buttons */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Choose a financing provider:</p>
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleKlarna}
            className="w-full bg-[#FFB3C7] hover:bg-[#FF9AB2] border-[#FFB3C7] text-black font-bold"
          >
            <span className="flex items-center gap-1">
              Klarna
              <ExternalLink className="h-3 w-3" />
            </span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAffirm}
            className="w-full bg-[#0FA0EA] hover:bg-[#0D8AD0] border-[#0FA0EA] text-white font-bold"
          >
            <span className="flex items-center gap-1">
              Affirm
              <ExternalLink className="h-3 w-3" />
            </span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLyonFinancial}
            className="w-full bg-[#1E3A5F] hover:bg-[#152B47] border-[#1E3A5F] text-white font-bold"
          >
            <span className="flex items-center gap-1">
              Lyon
              <ExternalLink className="h-3 w-3" />
            </span>
          </Button>
        </div>
      </div>

      <div className="text-xs text-muted-foreground text-center">
        *Financing subject to credit approval. APR varies by provider.
      </div>
    </div>
  );
};

export default FinancingOptions;
