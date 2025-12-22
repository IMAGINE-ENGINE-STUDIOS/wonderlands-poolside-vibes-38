import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Search, Users, Mail, Building2, Eye } from "lucide-react";
import { Link } from "react-router-dom";

interface SalesRep {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  company_name: string | null;
  is_active: boolean;
  created_at: string;
  client_count?: number;
}

const SalesRepManager = () => {
  const [salesReps, setSalesReps] = useState<SalesRep[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadSalesReps = async () => {
    setIsLoading(true);
    try {
      // Get all sales reps from profiles
      const { data: reps, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'sales_rep' as any)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get client counts for each sales rep
      const { data: clients, error: clientError } = await supabase
        .from('clients')
        .select('assigned_sales_rep_id');

      if (clientError) throw clientError;

      // Count clients per sales rep
      const clientCounts: Record<string, number> = {};
      clients?.forEach(client => {
        if (client.assigned_sales_rep_id) {
          clientCounts[client.assigned_sales_rep_id] = (clientCounts[client.assigned_sales_rep_id] || 0) + 1;
        }
      });

      const repsWithCounts = reps?.map(rep => ({
        ...rep,
        client_count: clientCounts[rep.id] || 0
      })) || [];

      setSalesReps(repsWithCounts);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load sales representatives",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStatus = async (repId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !currentStatus })
        .eq('id', repId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Sales rep has been ${!currentStatus ? 'activated' : 'deactivated'}`,
      });

      loadSalesReps();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadSalesReps();
  }, []);

  const filteredReps = salesReps.filter(rep => {
    const searchLower = searchTerm.toLowerCase();
    return (
      rep.email.toLowerCase().includes(searchLower) ||
      (rep.first_name?.toLowerCase() || '').includes(searchLower) ||
      (rep.last_name?.toLowerCase() || '').includes(searchLower) ||
      (rep.company_name?.toLowerCase() || '').includes(searchLower)
    );
  });

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{salesReps.length}</p>
                <p className="text-sm text-muted-foreground">Total Sales Reps</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{salesReps.filter(r => r.is_active).length}</p>
                <p className="text-sm text-muted-foreground">Active Reps</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{salesReps.reduce((sum, r) => sum + (r.client_count || 0), 0)}</p>
                <p className="text-sm text-muted-foreground">Total Assigned Clients</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : filteredReps.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No sales representatives found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Assigned Clients</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReps.map((rep) => (
                  <TableRow key={rep.id}>
                    <TableCell className="font-medium">
                      {rep.first_name} {rep.last_name}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {rep.email}
                      </div>
                    </TableCell>
                    <TableCell>{rep.company_name || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{rep.client_count} clients</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={rep.is_active ? "default" : "secondary"}>
                        {rep.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(rep.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleStatus(rep.id, rep.is_active)}
                        >
                          {rep.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesRepManager;
