import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Users, Crown, Briefcase, Target, UserCheck, MapPin, Loader2 } from "lucide-react";

type SalesCategory = 'bdr' | 'ae' | 'csm' | 'regional_sales' | 'head_of_sales' | null;

interface SalesRep {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  company_name: string | null;
  is_active: boolean;
  sales_category: SalesCategory;
}

const CATEGORY_CONFIG: Record<string, { label: string; rate: string; icon: typeof Crown; color: string }> = {
  head_of_sales: { label: 'Head of Sales', rate: '8%', icon: Crown, color: 'text-amber-400 bg-amber-500/20 border-amber-500/30' },
  bdr: { label: 'BDR', rate: '2%', icon: Target, color: 'text-blue-400 bg-blue-500/20 border-blue-500/30' },
  ae: { label: 'Account Executive', rate: '3%', icon: Briefcase, color: 'text-green-400 bg-green-500/20 border-green-500/30' },
  csm: { label: 'CSM', rate: '1%', icon: UserCheck, color: 'text-purple-400 bg-purple-500/20 border-purple-500/30' },
  regional_sales: { label: 'Regional Sales', rate: '1.5%', icon: MapPin, color: 'text-cyan-400 bg-cyan-500/20 border-cyan-500/30' },
};

const SalesRepCategoryManager = () => {
  const [salesReps, setSalesReps] = useState<SalesRep[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { toast } = useToast();

  const loadSalesReps = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name, company_name, is_active, sales_category')
        .eq('role', 'sales_rep' as any)
        .order('first_name');

      if (error) throw error;
      setSalesReps((data as SalesRep[]) || []);
    } catch (error) {
      console.error('Error loading sales reps:', error);
      toast({
        title: "Error",
        description: "Failed to load sales representatives",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateCategory = async (repId: string, category: SalesCategory) => {
    setUpdatingId(repId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ sales_category: category })
        .eq('id', repId);

      if (error) throw error;

      setSalesReps(prev => prev.map(rep => 
        rep.id === repId ? { ...rep, sales_category: category } : rep
      ));

      toast({
        title: "Category Updated",
        description: `Sales rep category has been updated to ${category ? CATEGORY_CONFIG[category].label : 'None'}`,
      });
    } catch (error) {
      console.error('Error updating category:', error);
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    loadSalesReps();
  }, []);

  const getCategoryStats = () => {
    const stats: Record<string, number> = {
      head_of_sales: 0,
      bdr: 0,
      ae: 0,
      csm: 0,
      regional_sales: 0,
      uncategorized: 0,
    };
    
    salesReps.forEach(rep => {
      if (rep.sales_category) {
        stats[rep.sales_category]++;
      } else {
        stats.uncategorized++;
      }
    });
    
    return stats;
  };

  const stats = getCategoryStats();

  return (
    <div className="space-y-6">
      {/* Category Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
          const IconComponent = config.icon;
          return (
            <Card key={key} className="holographic-panel border-cyan-500/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${config.color}`}>
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-cyan-300 font-mono">{stats[key] || 0}</p>
                    <p className="text-xs text-muted-foreground">{config.label}</p>
                    <p className="text-xs text-cyan-400/60">{config.rate}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        <Card className="holographic-panel border-gray-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gray-500/20 text-gray-400">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-300 font-mono">{stats.uncategorized || 0}</p>
                <p className="text-xs text-muted-foreground">Uncategorized</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Reps Table */}
      <Card className="holographic-panel border-cyan-500/30">
        <CardHeader>
          <CardTitle className="text-cyan-300 font-mono flex items-center gap-2">
            <Users className="h-5 w-5" />
            Sales Team Categories
          </CardTitle>
          <CardDescription className="text-cyan-400/60">
            Assign categories to sales reps to define their commission rates
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              Loading...
            </div>
          ) : salesReps.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No sales representatives found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Current Category</TableHead>
                  <TableHead>Commission Rate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesReps.map((rep) => {
                  const categoryConfig = rep.sales_category ? CATEGORY_CONFIG[rep.sales_category] : null;
                  return (
                    <TableRow key={rep.id}>
                      <TableCell className="font-medium">
                        {rep.first_name} {rep.last_name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{rep.email}</TableCell>
                      <TableCell>
                        {categoryConfig ? (
                          <Badge className={categoryConfig.color}>
                            {categoryConfig.label}
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Uncategorized</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-cyan-300">
                          {categoryConfig ? categoryConfig.rate : '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={rep.is_active ? "default" : "secondary"}>
                          {rep.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={rep.sales_category || 'none'}
                          onValueChange={(value) => updateCategory(rep.id, value === 'none' ? null : value as SalesCategory)}
                          disabled={updatingId === rep.id}
                        >
                          <SelectTrigger className="w-[180px]">
                            {updatingId === rep.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <SelectValue placeholder="Select category" />
                            )}
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Category</SelectItem>
                            <SelectItem value="head_of_sales">Head of Sales (8%)</SelectItem>
                            <SelectItem value="bdr">BDR (2%)</SelectItem>
                            <SelectItem value="ae">Account Executive (3%)</SelectItem>
                            <SelectItem value="csm">CSM (1%)</SelectItem>
                            <SelectItem value="regional_sales">Regional Sales (1.5%)</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesRepCategoryManager;
