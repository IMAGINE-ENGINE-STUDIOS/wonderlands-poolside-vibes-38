import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Users, Crown, Target, Briefcase, UserCheck, MapPin } from "lucide-react";

type SalesCategory = 'bdr' | 'ae' | 'csm' | 'regional_sales' | 'head_of_sales';

interface TeamMember {
  id: string;
  name: string;
  category: SalesCategory;
}

interface CommissionCalculatorProps {
  dealValue: number;
  teamMembers: TeamMember[];
  headOfSalesId?: string;
  headOfSalesName?: string;
}

const COMMISSION_RATES: Record<SalesCategory, number> = {
  head_of_sales: 0.08, // 8%
  bdr: 0.02,           // 2%
  ae: 0.03,            // 3%
  csm: 0.01,           // 1%
  regional_sales: 0.015 // 1.5%
};

const CATEGORY_CONFIG: Record<SalesCategory, { label: string; icon: typeof Crown; color: string }> = {
  head_of_sales: { label: 'Head of Sales', icon: Crown, color: 'text-amber-400' },
  bdr: { label: 'BDR', icon: Target, color: 'text-blue-400' },
  ae: { label: 'Account Executive', icon: Briefcase, color: 'text-green-400' },
  csm: { label: 'CSM', icon: UserCheck, color: 'text-purple-400' },
  regional_sales: { label: 'Regional Sales', icon: MapPin, color: 'text-cyan-400' },
};

const CommissionCalculator = ({ 
  dealValue, 
  teamMembers, 
  headOfSalesId,
  headOfSalesName = "Head of Sales"
}: CommissionCalculatorProps) => {
  const calculations = useMemo(() => {
    const isSoloDeal = teamMembers.length === 0;
    
    if (isSoloDeal && headOfSalesId) {
      // Solo deal - Head of Sales gets full 8%
      return {
        isSolo: true,
        totalRate: 0.08,
        totalCommission: dealValue * 0.08,
        breakdown: [{
          id: headOfSalesId,
          name: headOfSalesName,
          category: 'head_of_sales' as SalesCategory,
          rate: 0.08,
          amount: dealValue * 0.08
        }]
      };
    }

    // Team deal - split commissions
    const breakdown = teamMembers.map(member => ({
      id: member.id,
      name: member.name,
      category: member.category,
      rate: COMMISSION_RATES[member.category],
      amount: dealValue * COMMISSION_RATES[member.category]
    }));

    const totalRate = breakdown.reduce((sum, item) => sum + item.rate, 0);
    const totalCommission = breakdown.reduce((sum, item) => sum + item.amount, 0);

    return {
      isSolo: false,
      totalRate,
      totalCommission,
      breakdown
    };
  }, [dealValue, teamMembers, headOfSalesId, headOfSalesName]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercent = (rate: number) => {
    return `${(rate * 100).toFixed(1)}%`;
  };

  return (
    <Card className="holographic-panel border-cyan-500/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-cyan-300 font-mono flex items-center gap-2 text-sm">
          <DollarSign className="h-4 w-4" />
          Commission Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Deal Value */}
        <div className="flex justify-between items-center py-2 border-b border-cyan-500/20">
          <span className="text-cyan-400/80 text-sm">Deal Value</span>
          <span className="text-xl font-bold text-cyan-300 font-mono">
            {formatCurrency(dealValue)}
          </span>
        </div>

        {/* Commission Type Badge */}
        <div className="flex justify-center">
          <Badge 
            className={calculations.isSolo 
              ? "bg-amber-500/20 text-amber-300 border-amber-500/30" 
              : "bg-blue-500/20 text-blue-300 border-blue-500/30"
            }
          >
            {calculations.isSolo ? (
              <>
                <Crown className="h-3 w-3 mr-1" />
                Solo Close
              </>
            ) : (
              <>
                <Users className="h-3 w-3 mr-1" />
                Team Split
              </>
            )}
          </Badge>
        </div>

        {/* Commission Breakdown */}
        <div className="space-y-2">
          {calculations.breakdown.map((item) => {
            const config = CATEGORY_CONFIG[item.category];
            const IconComponent = config.icon;
            return (
              <div 
                key={item.id} 
                className="flex items-center justify-between p-2 rounded-lg bg-slate-800/50 border border-cyan-500/10"
              >
                <div className="flex items-center gap-2">
                  <IconComponent className={`h-4 w-4 ${config.color}`} />
                  <div>
                    <p className="text-sm font-medium text-cyan-300">{item.name}</p>
                    <p className="text-xs text-cyan-400/60">{config.label}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm text-green-400">
                    {formatCurrency(item.amount)}
                  </p>
                  <p className="text-xs text-cyan-400/60 font-mono">
                    {formatPercent(item.rate)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Total */}
        <div className="flex justify-between items-center pt-3 border-t border-cyan-500/20">
          <span className="text-cyan-400/80 font-medium">Total Commission</span>
          <div className="text-right">
            <p className="text-lg font-bold text-green-400 font-mono">
              {formatCurrency(calculations.totalCommission)}
            </p>
            <p className="text-xs text-cyan-400/60 font-mono">
              {formatPercent(calculations.totalRate)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CommissionCalculator;
