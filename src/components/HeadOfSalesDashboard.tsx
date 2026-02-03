import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format, formatDistanceToNow } from "date-fns";
import { 
  Users, Search, Crown, DollarSign, TrendingUp, 
  UserPlus, Target, Briefcase, UserCheck, MapPin, Loader2, Plus, Clock
} from "lucide-react";
import ClientSalesTeamAssignment from "./ClientSalesTeamAssignment";
import CommissionCalculator from "./CommissionCalculator";

type SalesCategory = 'bdr' | 'ae' | 'csm' | 'regional_sales' | 'head_of_sales';

interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
  price_range_min?: number;
  price_range_max?: number;
  created_at: string;
  updated_at: string;
}

interface SalesRep {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  sales_category: SalesCategory | null;
}

interface TeamAssignment {
  client_id: string;
  sales_rep_id: string;
  category: SalesCategory;
  sales_rep?: SalesRep;
}

const CATEGORY_CONFIG: Record<SalesCategory, { label: string; icon: typeof Crown; color: string }> = {
  head_of_sales: { label: 'Head of Sales', icon: Crown, color: 'text-black' },
  bdr: { label: 'BDR', icon: Target, color: 'text-black' },
  ae: { label: 'AE', icon: Briefcase, color: 'text-black' },
  csm: { label: 'CSM', icon: UserCheck, color: 'text-black' },
  regional_sales: { label: 'Regional', icon: MapPin, color: 'text-black' },
};

const HeadOfSalesDashboard = () => {
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [salesReps, setSalesReps] = useState<SalesRep[]>([]);
  const [teamAssignments, setTeamAssignments] = useState<TeamAssignment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isAddClientDialogOpen, setIsAddClientDialogOpen] = useState(false);
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [newClient, setNewClient] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address_street: '',
    address_city: '',
    address_state: 'Florida',
    address_zip: '',
    price_range_min: '',
    price_range_max: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load all clients
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('id, first_name, last_name, email, status, price_range_min, price_range_max, created_at, updated_at')
        .order('updated_at', { ascending: false });

      if (clientsError) throw clientsError;
      setClients(clientsData || []);

      // Load all sales reps
      const { data: repsData, error: repsError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, sales_category')
        .eq('role', 'sales_rep' as any)
        .eq('is_active', true);

      if (repsError) throw repsError;
      setSalesReps((repsData as SalesRep[]) || []);

      // Load team assignments
      const { data: assignmentsData, error: assignError } = await supabase
        .from('client_sales_team')
        .select('client_id, sales_rep_id, category')
        .eq('is_active', true);

      if (assignError) throw assignError;
      setTeamAssignments((assignmentsData as TeamAssignment[]) || []);

    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getClientTeam = (clientId: string) => {
    return teamAssignments
      .filter(a => a.client_id === clientId)
      .map(a => {
        const rep = salesReps.find(r => r.id === a.sales_rep_id);
        return { ...a, sales_rep: rep };
      });
  };

  const getTeamStats = () => {
    const stats: Record<SalesCategory, number> = {
      head_of_sales: 0,
      bdr: 0,
      ae: 0,
      csm: 0,
      regional_sales: 0
    };

    salesReps.forEach(rep => {
      if (rep.sales_category) {
        stats[rep.sales_category]++;
      }
    });

    return stats;
  };

  const filteredClients = clients.filter(client => {
    const searchLower = searchTerm.toLowerCase();
    return (
      client.first_name.toLowerCase().includes(searchLower) ||
      client.last_name.toLowerCase().includes(searchLower) ||
      client.email.toLowerCase().includes(searchLower)
    );
  });

  const openAssignDialog = (client: Client) => {
    setSelectedClient(client);
    setIsAssignDialogOpen(true);
  };

  const handleAssignmentSaved = () => {
    setIsAssignDialogOpen(false);
    setSelectedClient(null);
    loadData();
  };

  const handleAddClient = async () => {
    if (!newClient.first_name || !newClient.last_name || !newClient.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in first name, last name, and email",
        variant: "destructive",
      });
      return;
    }

    setIsAddingClient(true);
    try {
      const { error } = await supabase
        .from('clients')
        .insert({
          first_name: newClient.first_name,
          last_name: newClient.last_name,
          email: newClient.email,
          phone: newClient.phone || null,
          address_street: newClient.address_street || null,
          address_city: newClient.address_city || null,
          address_state: newClient.address_state || null,
          address_zip: newClient.address_zip || null,
          price_range_min: newClient.price_range_min ? parseFloat(newClient.price_range_min) : null,
          price_range_max: newClient.price_range_max ? parseFloat(newClient.price_range_max) : null,
          notes: newClient.notes || null,
          status: 'new',
          source: 'head_of_sales'
        });

      if (error) throw error;

      toast({
        title: "Client Added",
        description: `${newClient.first_name} ${newClient.last_name} has been added successfully`,
      });

      setNewClient({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        address_street: '',
        address_city: '',
        address_state: 'Florida',
        address_zip: '',
        price_range_min: '',
        price_range_max: '',
        notes: ''
      });
      setIsAddClientDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Error adding client:', error);
      toast({
        title: "Error",
        description: "Failed to add client",
        variant: "destructive",
      });
    } finally {
      setIsAddingClient(false);
    }
  };

  const teamStats = getTeamStats();

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      contacted: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      qualified: 'bg-green-500/20 text-green-300 border-green-500/30',
      proposal_sent: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      negotiating: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      won: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      lost: 'bg-red-500/20 text-red-300 border-red-500/30'
    };
    return colors[status] || colors.new;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
          const IconComponent = config.icon;
          const count = teamStats[key as SalesCategory] || 0;
          return (
            <Card key={key} className="bg-white border-slate-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <IconComponent className={`h-5 w-5 ${config.color}`} />
                  <div>
                    <p className="text-xl font-bold text-black font-mono">{count}</p>
                    <p className="text-xs text-black/60">{config.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="clients" className="space-y-4">
        <TabsList className="bg-slate-100 border border-slate-300">
          <TabsTrigger value="clients" className="data-[state=active]:bg-white text-black data-[state=active]:text-black">
            <Users className="h-4 w-4 mr-2" />
            All Clients
          </TabsTrigger>
          <TabsTrigger value="pipeline" className="data-[state=active]:bg-white text-black data-[state=active]:text-black">
            <TrendingUp className="h-4 w-4 mr-2" />
            Pipeline
          </TabsTrigger>
          <TabsTrigger value="commissions" className="data-[state=active]:bg-white text-black data-[state=active]:text-black">
            <DollarSign className="h-4 w-4 mr-2" />
            Commissions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="clients" className="space-y-4">
          {/* Search and Add Button */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/60" />
              <Input
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border-slate-300 text-black placeholder:text-black/50"
              />
            </div>
            <Button
              onClick={() => setIsAddClientDialogOpen(true)}
              className="bg-slate-800 hover:bg-slate-900 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </Button>
          </div>

          {/* Clients Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClients.map(client => {
              const team = getClientTeam(client.id);
              const dealValue = client.price_range_max || client.price_range_min || 0;
              
              return (
                <Card key={client.id} className="bg-white border-slate-200 hover:border-slate-400 transition-all shadow-sm">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-black font-mono text-base">
                          {client.first_name} {client.last_name}
                        </CardTitle>
                        <CardDescription className="text-black/60 text-xs">
                          {client.email}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(client.status)}>
                        {client.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Last Updated */}
                    <div className="flex items-center gap-2 text-xs text-black/70">
                      <Clock className="h-3 w-3" />
                      <span>
                        Updated {formatDistanceToNow(new Date(client.updated_at), { addSuffix: true })}
                      </span>
                      <span className="text-black/50">•</span>
                      <span>{format(new Date(client.updated_at), 'MMM d, h:mm a')}</span>
                    </div>

                    {/* Deal Value */}
                    {dealValue > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-black" />
                        <span className="font-mono text-black">
                          ${dealValue.toLocaleString()}
                        </span>
                      </div>
                    )}

                    {/* Team Assignments */}
                    <div className="flex flex-wrap gap-1">
                      {team.length === 0 ? (
                        <Badge variant="secondary" className="text-xs text-black">No team assigned</Badge>
                      ) : (
                        team.map(assignment => {
                          const config = CATEGORY_CONFIG[assignment.category];
                          return (
                            <Badge 
                              key={`${assignment.client_id}-${assignment.category}`}
                              variant="outline"
                              className="text-xs text-black"
                            >
                              <span className="text-black">{config.label}</span>
                            </Badge>
                          );
                        })
                      )}
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openAssignDialog(client)}
                      className="w-full border-slate-300 text-black hover:bg-slate-100"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Manage Team
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredClients.length === 0 && (
            <div className="text-center py-12 text-black/60">
              No clients found
            </div>
          )}
        </TabsContent>

        <TabsContent value="pipeline">
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-black font-mono">Sales Pipeline</CardTitle>
              <CardDescription className="text-black/60">
                Track deals through the pipeline
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {['new', 'contacted', 'qualified', 'proposal_sent', 'negotiating', 'won', 'lost'].map(stage => {
                  const stageClients = clients.filter(c => c.status === stage);
                  return (
                    <div key={stage} className="space-y-2">
                      <div className="text-center">
                        <Badge className={getStatusColor(stage)}>
                          {stage.replace('_', ' ')}
                        </Badge>
                        <p className="text-lg font-bold text-black mt-1">{stageClients.length}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commissions">
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-black font-mono">Commission Tracker</CardTitle>
              <CardDescription className="text-black/60">
                View and manage team commissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-black/60 text-center py-8">
                Commission tracking coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Assignment Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="max-w-4xl bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-black font-mono">
              Manage Sales Team
            </DialogTitle>
          </DialogHeader>
          {selectedClient && (
            <ClientSalesTeamAssignment
              clientId={selectedClient.id}
              clientName={`${selectedClient.first_name} ${selectedClient.last_name}`}
              dealValue={selectedClient.price_range_max || selectedClient.price_range_min || 50000}
              onClose={() => setIsAssignDialogOpen(false)}
              onSave={handleAssignmentSaved}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Add Client Dialog */}
      <Dialog open={isAddClientDialogOpen} onOpenChange={setIsAddClientDialogOpen}>
        <DialogContent className="max-w-2xl bg-white border-slate-200 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-black font-mono flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Add New Client
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-black">First Name *</Label>
                <Input
                  value={newClient.first_name}
                  onChange={(e) => setNewClient({ ...newClient, first_name: e.target.value })}
                  placeholder="John"
                  className="bg-white border-slate-300 text-black"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-black">Last Name *</Label>
                <Input
                  value={newClient.last_name}
                  onChange={(e) => setNewClient({ ...newClient, last_name: e.target.value })}
                  placeholder="Smith"
                  className="bg-white border-slate-300 text-black"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-black">Email *</Label>
                <Input
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                  placeholder="john@example.com"
                  className="bg-white border-slate-300 text-black"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-black">Phone</Label>
                <Input
                  value={newClient.phone}
                  onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                  className="bg-white border-slate-300 text-black"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-black">Street Address</Label>
              <Input
                value={newClient.address_street}
                onChange={(e) => setNewClient({ ...newClient, address_street: e.target.value })}
                placeholder="123 Main St"
                className="bg-white border-slate-300 text-black"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-black">City</Label>
                <Input
                  value={newClient.address_city}
                  onChange={(e) => setNewClient({ ...newClient, address_city: e.target.value })}
                  placeholder="Jacksonville"
                  className="bg-white border-slate-300 text-black"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-black">State</Label>
                <Input
                  value={newClient.address_state}
                  onChange={(e) => setNewClient({ ...newClient, address_state: e.target.value })}
                  placeholder="Florida"
                  className="bg-white border-slate-300 text-black"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-black">ZIP Code</Label>
                <Input
                  value={newClient.address_zip}
                  onChange={(e) => setNewClient({ ...newClient, address_zip: e.target.value })}
                  placeholder="32256"
                  className="bg-white border-slate-300 text-black"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-black">Budget Min ($)</Label>
                <Input
                  type="number"
                  value={newClient.price_range_min}
                  onChange={(e) => setNewClient({ ...newClient, price_range_min: e.target.value })}
                  placeholder="50000"
                  className="bg-white border-slate-300 text-black"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-black">Budget Max ($)</Label>
                <Input
                  type="number"
                  value={newClient.price_range_max}
                  onChange={(e) => setNewClient({ ...newClient, price_range_max: e.target.value })}
                  placeholder="100000"
                  className="bg-white border-slate-300 text-black"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-black">Notes</Label>
              <Input
                value={newClient.notes}
                onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })}
                placeholder="Interested in fiberglass pools..."
                className="bg-white border-slate-300 text-black"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsAddClientDialogOpen(false)}
                className="flex-1 border-slate-300 text-black"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddClient}
                disabled={isAddingClient}
                className="flex-1 bg-slate-800 hover:bg-slate-900 text-white"
              >
                {isAddingClient ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Add Client
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HeadOfSalesDashboard;
