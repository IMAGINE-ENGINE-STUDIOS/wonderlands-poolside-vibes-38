import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Search, Users, Mail, Building2, UserPlus, X, Check } from "lucide-react";

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

interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
  assigned_sales_rep_id: string | null;
}

const SalesRepManager = () => {
  const [salesReps, setSalesReps] = useState<SalesRep[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRep, setSelectedRep] = useState<SalesRep | null>(null);
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
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
      const { data: clientsData, error: clientError } = await supabase
        .from('clients')
        .select('assigned_sales_rep_id');

      if (clientError) throw clientError;

      // Count clients per sales rep
      const clientCounts: Record<string, number> = {};
      clientsData?.forEach(client => {
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

  const loadClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, first_name, last_name, email, status, assigned_sales_rep_id')
        .order('first_name');

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error loading clients:', error);
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

  const openClientDialog = (rep: SalesRep) => {
    setSelectedRep(rep);
    // Pre-select currently assigned clients
    const assignedClients = clients
      .filter(c => c.assigned_sales_rep_id === rep.id)
      .map(c => c.id);
    setSelectedClients(assignedClients);
    setClientSearchTerm("");
    setIsClientDialogOpen(true);
  };

  const toggleClientSelection = (clientId: string) => {
    setSelectedClients(prev => 
      prev.includes(clientId) 
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const saveClientAssignments = async () => {
    if (!selectedRep) return;

    try {
      // Get clients currently assigned to this rep
      const currentlyAssigned = clients
        .filter(c => c.assigned_sales_rep_id === selectedRep.id)
        .map(c => c.id);

      // Clients to unassign (were assigned but not in selection)
      const toUnassign = currentlyAssigned.filter(id => !selectedClients.includes(id));
      
      // Clients to assign (in selection but not currently assigned to this rep)
      const toAssign = selectedClients.filter(id => {
        const client = clients.find(c => c.id === id);
        return client && client.assigned_sales_rep_id !== selectedRep.id;
      });

      // Unassign clients
      if (toUnassign.length > 0) {
        const { error: unassignError } = await supabase
          .from('clients')
          .update({ assigned_sales_rep_id: null })
          .in('id', toUnassign);

        if (unassignError) throw unassignError;
      }

      // Assign clients
      if (toAssign.length > 0) {
        const { error: assignError } = await supabase
          .from('clients')
          .update({ assigned_sales_rep_id: selectedRep.id })
          .in('id', toAssign);

        if (assignError) throw assignError;
      }

      toast({
        title: "Clients Updated",
        description: `${toAssign.length} assigned, ${toUnassign.length} unassigned`,
      });

      setIsClientDialogOpen(false);
      setSelectedRep(null);
      loadSalesReps();
      loadClients();
    } catch (error) {
      console.error('Error saving assignments:', error);
      toast({
        title: "Error",
        description: "Failed to update client assignments",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadSalesReps();
    loadClients();
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

  const filteredClients = clients.filter(client => {
    const searchLower = clientSearchTerm.toLowerCase();
    return (
      client.first_name.toLowerCase().includes(searchLower) ||
      client.last_name.toLowerCase().includes(searchLower) ||
      client.email.toLowerCase().includes(searchLower)
    );
  });

  // Group clients for the dialog
  const assignedToCurrentRep = filteredClients.filter(c => 
    selectedRep && c.assigned_sales_rep_id === selectedRep.id
  );
  const unassignedClients = filteredClients.filter(c => !c.assigned_sales_rep_id);
  const assignedToOthers = filteredClients.filter(c => 
    c.assigned_sales_rep_id && selectedRep && c.assigned_sales_rep_id !== selectedRep.id
  );

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
              <Building2 className="h-8 w-8 text-blue-200" />
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
                          onClick={() => openClientDialog(rep)}
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          Manage Clients
                        </Button>
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

      {/* Client Assignment Dialog */}
      <Dialog open={isClientDialogOpen} onOpenChange={setIsClientDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              Manage Clients for {selectedRep?.first_name} {selectedRep?.last_name}
            </DialogTitle>
            <DialogDescription>
              Select clients to assign to this sales representative
            </DialogDescription>
          </DialogHeader>
          
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search clients..."
              value={clientSearchTerm}
              onChange={(e) => setClientSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-4">
            {/* Currently Assigned */}
            {assignedToCurrentRep.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-green-600 mb-2 flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  Assigned to this rep ({assignedToCurrentRep.length})
                </h4>
                <div className="space-y-1">
                  {assignedToCurrentRep.map(client => (
                    <div 
                      key={client.id} 
                      className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer"
                      onClick={() => toggleClientSelection(client.id)}
                    >
                      <Checkbox 
                        checked={selectedClients.includes(client.id)}
                        onCheckedChange={() => toggleClientSelection(client.id)}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{client.first_name} {client.last_name}</p>
                        <p className="text-xs text-muted-foreground">{client.email}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">{client.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Unassigned Clients */}
            {unassignedClients.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-2">
                  Unassigned Clients ({unassignedClients.length})
                </h4>
                <div className="space-y-1">
                  {unassignedClients.map(client => (
                    <div 
                      key={client.id} 
                      className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer"
                      onClick={() => toggleClientSelection(client.id)}
                    >
                      <Checkbox 
                        checked={selectedClients.includes(client.id)}
                        onCheckedChange={() => toggleClientSelection(client.id)}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{client.first_name} {client.last_name}</p>
                        <p className="text-xs text-muted-foreground">{client.email}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">{client.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Assigned to Others */}
            {assignedToOthers.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-orange-600 mb-2 flex items-center gap-2">
                  <X className="h-4 w-4" />
                  Assigned to other reps ({assignedToOthers.length})
                </h4>
                <div className="space-y-1">
                  {assignedToOthers.map(client => {
                    const assignedRep = salesReps.find(r => r.id === client.assigned_sales_rep_id);
                    return (
                      <div 
                        key={client.id} 
                        className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer"
                        onClick={() => toggleClientSelection(client.id)}
                      >
                        <Checkbox 
                          checked={selectedClients.includes(client.id)}
                          onCheckedChange={() => toggleClientSelection(client.id)}
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{client.first_name} {client.last_name}</p>
                          <p className="text-xs text-muted-foreground">{client.email}</p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {assignedRep?.first_name || 'Other'}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {filteredClients.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No clients found</p>
            )}
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              {selectedClients.length} client(s) selected
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsClientDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveClientAssignments}>
                Save Assignments
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SalesRepManager;
