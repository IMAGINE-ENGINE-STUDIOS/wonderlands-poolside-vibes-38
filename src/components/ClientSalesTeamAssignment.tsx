import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Users, Crown, Target, Briefcase, UserCheck, MapPin, Save, Loader2, X } from "lucide-react";
import CommissionCalculator from "./CommissionCalculator";

type SalesCategory = 'bdr' | 'ae' | 'csm' | 'regional_sales' | 'head_of_sales';

interface SalesRep {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  sales_category: SalesCategory | null;
}

interface TeamAssignment {
  category: SalesCategory;
  sales_rep_id: string | null;
}

interface ClientSalesTeamAssignmentProps {
  clientId: string;
  clientName: string;
  dealValue?: number;
  onClose?: () => void;
  onSave?: () => void;
}

const CATEGORY_CONFIG: Record<SalesCategory, { label: string; icon: typeof Crown; color: string; rate: string }> = {
  head_of_sales: { label: 'Head of Sales', icon: Crown, color: 'text-amber-400 bg-amber-500/20 border-amber-500/30', rate: '8%' },
  bdr: { label: 'BDR', icon: Target, color: 'text-blue-400 bg-blue-500/20 border-blue-500/30', rate: '2%' },
  ae: { label: 'Account Executive', icon: Briefcase, color: 'text-green-400 bg-green-500/20 border-green-500/30', rate: '3%' },
  csm: { label: 'CSM', icon: UserCheck, color: 'text-purple-400 bg-purple-500/20 border-purple-500/30', rate: '1%' },
  regional_sales: { label: 'Regional Sales', icon: MapPin, color: 'text-cyan-400 bg-cyan-500/20 border-cyan-500/30', rate: '1.5%' },
};

const ASSIGNABLE_CATEGORIES: SalesCategory[] = ['bdr', 'ae', 'csm', 'regional_sales'];

const ClientSalesTeamAssignment = ({ 
  clientId, 
  clientName, 
  dealValue = 0,
  onClose,
  onSave 
}: ClientSalesTeamAssignmentProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [salesReps, setSalesReps] = useState<SalesRep[]>([]);
  const [assignments, setAssignments] = useState<TeamAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [headOfSales, setHeadOfSales] = useState<SalesRep | null>(null);

  useEffect(() => {
    loadData();
  }, [clientId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load all sales reps with their categories
      const { data: reps, error: repsError } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name, sales_category')
        .eq('role', 'sales_rep' as any)
        .eq('is_active', true);

      if (repsError) throw repsError;

      const typedReps = (reps || []) as SalesRep[];
      setSalesReps(typedReps);

      // Find head of sales
      const hos = typedReps.find(r => r.sales_category === 'head_of_sales');
      setHeadOfSales(hos || null);

      // Load current assignments for this client
      const { data: currentAssignments, error: assignError } = await supabase
        .from('client_sales_team')
        .select('category, sales_rep_id')
        .eq('client_id', clientId)
        .eq('is_active', true);

      if (assignError) throw assignError;

      // Initialize assignments with current values
      const initialAssignments: TeamAssignment[] = ASSIGNABLE_CATEGORIES.map(category => {
        const existing = currentAssignments?.find(a => a.category === category);
        return {
          category,
          sales_rep_id: existing?.sales_rep_id || null
        };
      });

      setAssignments(initialAssignments);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load sales team data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignmentChange = (category: SalesCategory, repId: string | null) => {
    setAssignments(prev => prev.map(a => 
      a.category === category ? { ...a, sales_rep_id: repId } : a
    ));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Deactivate all current assignments for this client
      await supabase
        .from('client_sales_team')
        .update({ is_active: false })
        .eq('client_id', clientId);

      // Insert new assignments
      const newAssignments = assignments
        .filter(a => a.sales_rep_id)
        .map(a => ({
          client_id: clientId,
          sales_rep_id: a.sales_rep_id!,
          category: a.category,
          assigned_by: user?.id,
          is_active: true
        }));

      if (newAssignments.length > 0) {
        const { error } = await supabase
          .from('client_sales_team')
          .insert(newAssignments);

        if (error) throw error;
      }

      toast({
        title: "Team Updated",
        description: `Sales team assignments saved for ${clientName}`,
      });

      onSave?.();
    } catch (error) {
      console.error('Error saving assignments:', error);
      toast({
        title: "Error",
        description: "Failed to save team assignments",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getRepsByCategory = (category: SalesCategory) => {
    return salesReps.filter(r => r.sales_category === category);
  };

  const getTeamMembers = () => {
    return assignments
      .filter(a => a.sales_rep_id)
      .map(a => {
        const rep = salesReps.find(r => r.id === a.sales_rep_id);
        return {
          id: a.sales_rep_id!,
          name: rep ? `${rep.first_name || ''} ${rep.last_name || ''}`.trim() || rep.email : 'Unknown',
          category: a.category
        };
      });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-cyan-300 font-mono">
            Assign Sales Team
          </h3>
          <p className="text-sm text-cyan-400/60">
            Client: {clientName}
          </p>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assignment Form */}
        <Card className="holographic-panel border-cyan-500/30">
          <CardHeader>
            <CardTitle className="text-cyan-300 font-mono text-sm flex items-center gap-2">
              <Users className="h-4 w-4" />
              Team Assignments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Head of Sales (Display Only) */}
            {headOfSales && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <div className="flex items-center gap-2 mb-1">
                  <Crown className="h-4 w-4 text-amber-400" />
                  <span className="text-sm font-medium text-amber-300">Head of Sales</span>
                  <Badge className="ml-auto bg-amber-500/20 text-amber-300 text-xs">8%</Badge>
                </div>
                <p className="text-sm text-amber-400/80">
                  {headOfSales.first_name} {headOfSales.last_name}
                </p>
              </div>
            )}

            {/* Assignable Categories */}
            {ASSIGNABLE_CATEGORIES.map(category => {
              const config = CATEGORY_CONFIG[category];
              const IconComponent = config.icon;
              const repsInCategory = getRepsByCategory(category);
              const currentAssignment = assignments.find(a => a.category === category);

              return (
                <div key={category} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <IconComponent className={`h-4 w-4 ${config.color.split(' ')[0]}`} />
                    <span className="text-sm font-medium text-cyan-300">{config.label}</span>
                    <Badge className={`ml-auto ${config.color} text-xs`}>{config.rate}</Badge>
                  </div>
                  <Select
                    value={currentAssignment?.sales_rep_id || 'none'}
                    onValueChange={(value) => handleAssignmentChange(category, value === 'none' ? null : value)}
                  >
                    <SelectTrigger className="w-full bg-slate-800/50 border-cyan-500/30">
                      <SelectValue placeholder={`Select ${config.label}`} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Not Assigned</SelectItem>
                      {repsInCategory.map(rep => (
                        <SelectItem key={rep.id} value={rep.id}>
                          {rep.first_name} {rep.last_name} ({rep.email})
                        </SelectItem>
                      ))}
                      {repsInCategory.length === 0 && (
                        <SelectItem value="none" disabled>
                          No {config.label} reps available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              );
            })}

            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="w-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 mt-4"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Assignments
            </Button>
          </CardContent>
        </Card>

        {/* Commission Preview */}
        {dealValue > 0 && (
          <CommissionCalculator
            dealValue={dealValue}
            teamMembers={getTeamMembers()}
            headOfSalesId={headOfSales?.id}
            headOfSalesName={headOfSales ? `${headOfSales.first_name} ${headOfSales.last_name}` : undefined}
          />
        )}
      </div>
    </div>
  );
};

export default ClientSalesTeamAssignment;
