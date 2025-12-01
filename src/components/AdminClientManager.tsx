import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Users, 
  Eye, 
  Edit, 
  Plus,
  Phone, 
  Mail, 
  MapPin,
  Search,
  Filter,
  RefreshCw,
  DollarSign,
  TrendingUp,
  CheckCircle,
  Clock,
  Upload,
  FileText,
  MessageSquare
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address_street?: string;
  address_city?: string;
  address_state?: string;
  address_zip?: string;
  location_region?: string;
  price_range_min?: number;
  price_range_max?: number;
  interests: any;
  survey_uploaded: boolean;
  survey_file_url?: string;
  assigned_sales_rep_id?: string;
  status: string;
  source?: string;
  notes?: string;
  last_contacted_at?: string;
  created_at: string;
  updated_at: string;
}

interface ClientActivity {
  id: string;
  client_id: string;
  activity_type: string;
  description: string;
  created_by?: string;
  created_at: string;
}

interface SalesRep {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

const AdminClientManager = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [activities, setActivities] = useState<ClientActivity[]>([]);
  const [salesReps, setSalesReps] = useState<SalesRep[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parsedClients, setParsedClients] = useState<Array<{
    first_name: string;
    last_name: string;
    email: string;
    phone?: string | null;
    address_street?: string | null;
    address_city?: string | null;
    address_state?: string;
    address_zip?: string | null;
    interests: any;
    status: string;
    source: string;
    survey_uploaded: boolean;
  }>>([]);
  const [newActivity, setNewActivity] = useState({ type: 'note', description: '' });
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState<Partial<Client>>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address_street: '',
    address_city: '',
    address_state: 'FL',
    address_zip: '',
    location_region: '',
    price_range_min: undefined,
    price_range_max: undefined,
    interests: [],
    survey_uploaded: false,
    status: 'new',
    source: '',
    notes: ''
  });

  const fetchClients = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast({
        title: "Error",
        description: "Failed to fetch clients",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesReps = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .in('role', ['main_admin', 'sales_rep'])
        .order('first_name');

      if (error) throw error;
      setSalesReps(data || []);
    } catch (error) {
      console.error('Error fetching sales reps:', error);
    }
  };

  const fetchActivities = async (clientId: string) => {
    try {
      const { data, error } = await supabase
        .from('client_activities')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const addClient = async () => {
    if (!formData.first_name || !formData.last_name || !formData.email) {
      toast({
        title: "Error",
        description: "Please fill in required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('clients')
        .insert([{
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone: formData.phone,
          address_street: formData.address_street,
          address_city: formData.address_city,
          address_state: formData.address_state || 'FL',
          address_zip: formData.address_zip,
          location_region: formData.location_region,
          price_range_min: formData.price_range_min,
          price_range_max: formData.price_range_max,
          interests: formData.interests || [],
          survey_uploaded: formData.survey_uploaded || false,
          assigned_sales_rep_id: formData.assigned_sales_rep_id,
          status: formData.status || 'new',
          source: formData.source,
          notes: formData.notes
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Client added successfully",
      });

      setIsAddDialogOpen(false);
      resetForm();
      fetchClients();
    } catch (error) {
      console.error('Error adding client:', error);
      toast({
        title: "Error",
        description: "Failed to add client",
        variant: "destructive",
      });
    }
  };

  const updateClient = async () => {
    if (!selectedClient) return;

    try {
      const { error } = await supabase
        .from('clients')
        .update(formData)
        .eq('id', selectedClient.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Client updated successfully",
      });

      setIsEditDialogOpen(false);
      setSelectedClient(null);
      resetForm();
      fetchClients();
    } catch (error) {
      console.error('Error updating client:', error);
      toast({
        title: "Error",
        description: "Failed to update client",
        variant: "destructive",
      });
    }
  };

  const updateClientStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('clients')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      // Log status change activity
      await supabase.from('client_activities').insert([{
        client_id: id,
        activity_type: 'status_change',
        description: `Status changed to ${newStatus}`
      }]);

      setClients(prev => 
        prev.map(client => 
          client.id === id ? { ...client, status: newStatus } : client
        )
      );

      toast({
        title: "Success",
        description: "Client status updated",
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const addActivity = async () => {
    if (!selectedClient || !newActivity.description) return;

    try {
      const { error } = await supabase
        .from('client_activities')
        .insert([{
          client_id: selectedClient.id,
          activity_type: newActivity.type,
          description: newActivity.description
        }]);

      if (error) throw error;

      // Update last_contacted_at if it's a contact activity
      if (['call', 'email', 'meeting'].includes(newActivity.type)) {
        await supabase
          .from('clients')
          .update({ last_contacted_at: new Date().toISOString() })
          .eq('id', selectedClient.id);
      }

      toast({
        title: "Success",
        description: "Activity added successfully",
      });

      setNewActivity({ type: 'note', description: '' });
      fetchActivities(selectedClient.id);
      fetchClients();
    } catch (error) {
      console.error('Error adding activity:', error);
      toast({
        title: "Error",
        description: "Failed to add activity",
        variant: "destructive",
      });
    }
  };

  const parseCSV = (text: string): Array<{
    first_name: string;
    last_name: string;
    email: string;
    phone?: string | null;
    address_street?: string | null;
    address_city?: string | null;
    address_state?: string;
    address_zip?: string | null;
    interests: any;
    status: string;
    source: string;
    survey_uploaded: boolean;
  }> => {
    const lines = text.split('\n').filter(line => line.trim());
    const parsed: Array<{
      first_name: string;
      last_name: string;
      email: string;
      phone?: string | null;
      address_street?: string | null;
      address_city?: string | null;
      address_state?: string;
      address_zip?: string | null;
      interests: any;
      status: string;
      source: string;
      survey_uploaded: boolean;
    }> = [];

    // Skip header row
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // Split by comma but handle quoted values
      const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)?.map(v => v.replace(/^"|"$/g, '').trim()) || [];
      
      if (values.length < 3) continue; // Skip invalid rows

      const [name, phone, email, street, city, state, zip, interest] = values;

      // Skip malformed rows
      if (!name || !email || email.includes('http') || name.includes('http')) continue;

      // Split name into first and last
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Parse interests into array
      const interests = interest 
        ? interest.split(',').map(i => i.trim()).filter(Boolean)
        : ['Fiberglass pools'];

      parsed.push({
        first_name: firstName,
        last_name: lastName,
        email: email.trim(),
        phone: phone?.trim() || null,
        address_street: street?.trim() || null,
        address_city: city?.trim() || null,
        address_state: state?.trim() || 'FL',
        address_zip: zip?.trim() || null,
        interests: interests,
        status: 'new',
        source: 'csv_import',
        survey_uploaded: false
      });
    }

    return parsed;
  };

  const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseCSV(text);
      setParsedClients(parsed);
      
      toast({
        title: "CSV Parsed",
        description: `${parsed.length} clients ready to import`,
      });
    };
    reader.readAsText(file);
  };

  const importClients = async () => {
    if (parsedClients.length === 0) return;

    try {
      const { error } = await supabase
        .from('clients')
        .insert(parsedClients);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${parsedClients.length} clients imported successfully`,
      });

      setIsImportDialogOpen(false);
      setCsvFile(null);
      setParsedClients([]);
      fetchClients();
    } catch (error) {
      console.error('Error importing clients:', error);
      toast({
        title: "Error",
        description: "Failed to import clients",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      address_street: '',
      address_city: '',
      address_state: 'FL',
      address_zip: '',
      location_region: '',
      price_range_min: undefined,
      price_range_max: undefined,
      interests: [],
      survey_uploaded: false,
      status: 'new',
      source: '',
      notes: ''
    });
  };

  useEffect(() => {
    fetchClients();
    fetchSalesReps();
  }, []);

  useEffect(() => {
    if (selectedClient && isDetailsOpen) {
      fetchActivities(selectedClient.id);
    }
  }, [selectedClient, isDetailsOpen]);

  const filteredClients = clients.filter(client => {
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      client.first_name.toLowerCase().includes(searchLower) ||
      client.last_name.toLowerCase().includes(searchLower) ||
      client.email.toLowerCase().includes(searchLower) ||
      (client.phone && client.phone.includes(searchTerm)) ||
      (client.location_region && client.location_region.toLowerCase().includes(searchLower));
    
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      new: { variant: 'secondary', color: 'text-cyan-400 bg-cyan-500/10' },
      contacted: { variant: 'default', color: 'text-blue-400 bg-blue-500/10' },
      qualified: { variant: 'default', color: 'text-green-400 bg-green-500/10' },
      proposal_sent: { variant: 'default', color: 'text-purple-400 bg-purple-500/10' },
      negotiating: { variant: 'default', color: 'text-orange-400 bg-orange-500/10' },
      won: { variant: 'default', color: 'text-emerald-400 bg-emerald-500/10' },
      lost: { variant: 'destructive', color: 'text-red-400 bg-red-500/10' }
    } as const;

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.new;

    return (
      <Badge className={config.color}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  // Calculate metrics
  const totalClients = clients.length;
  const newThisMonth = clients.filter(c => {
    const createdDate = new Date(c.created_at);
    const now = new Date();
    return createdDate.getMonth() === now.getMonth() && 
           createdDate.getFullYear() === now.getFullYear();
  }).length;
  const activeDeals = clients.filter(c => 
    ['qualified', 'proposal_sent', 'negotiating'].includes(c.status)
  ).length;
  const wonDeals = clients.filter(c => c.status === 'won').length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse holographic-panel">
              <CardContent className="p-6">
                <div className="h-4 w-20 bg-cyan-500/20 rounded mb-2"></div>
                <div className="h-8 w-16 bg-cyan-500/20 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="holographic-panel neon-border-cyan">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-cyan-400/60 font-mono">TOTAL CLIENTS</p>
                <p className="text-3xl font-bold text-cyan-300 neon-glow-cyan font-mono">{totalClients}</p>
              </div>
              <Users className="h-10 w-10 text-cyan-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="holographic-panel neon-border-blue">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-400/60 font-mono">NEW THIS MONTH</p>
                <p className="text-3xl font-bold text-blue-300 neon-glow-blue font-mono">{newThisMonth}</p>
              </div>
              <TrendingUp className="h-10 w-10 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="holographic-panel neon-border-cyan">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-400/60 font-mono">ACTIVE DEALS</p>
                <p className="text-3xl font-bold text-orange-300 font-mono">{activeDeals}</p>
              </div>
              <Clock className="h-10 w-10 text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="holographic-panel neon-border-cyan">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-400/60 font-mono">WON DEALS</p>
                <p className="text-3xl font-bold text-emerald-300 neon-glow-cyan font-mono">{wonDeals}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-emerald-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Client Management */}
      <Card className="holographic-panel neon-border-cyan">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cyan-300 font-mono neon-glow-cyan">
            <Users className="h-6 w-6" />
            ⬡ CLIENT MANAGEMENT ⬡
          </CardTitle>
          <CardDescription className="text-cyan-400/60 font-mono">
            Track and manage all clients in the pipeline
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters & Actions */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-cyan-400" />
                <Input
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 holographic-panel border-cyan-500/30 text-cyan-300 placeholder:text-cyan-400/40 font-mono"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48 holographic-panel border-cyan-500/30 text-cyan-300 font-mono">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="proposal_sent">Proposal Sent</SelectItem>
                <SelectItem value="negotiating">Negotiating</SelectItem>
                <SelectItem value="won">Won</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={fetchClients} 
              variant="outline" 
              className="holographic-panel border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 font-mono"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              REFRESH
            </Button>
            
            <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
              <DialogTrigger asChild>
                <Button className="holographic-panel neon-border-blue text-blue-300 hover:bg-blue-500/20 font-mono">
                  <Upload className="h-4 w-4 mr-2" />
                  Import CSV
                </Button>
              </DialogTrigger>
              <DialogContent className="holographic-panel neon-border-cyan max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-cyan-300 font-mono neon-glow-cyan">⬡ IMPORT CLIENTS FROM CSV ⬡</DialogTitle>
                  <DialogDescription className="text-cyan-400/60 font-mono">
                    Upload a CSV file with client data
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label className="text-cyan-300 font-mono">CSV File</Label>
                    <Input
                      type="file"
                      accept=".csv"
                      onChange={handleCSVUpload}
                      className="holographic-panel border-cyan-500/30 text-cyan-300 font-mono"
                    />
                  </div>
                  
                  {parsedClients.length > 0 && (
                    <div className="space-y-2">
                      <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded">
                        <p className="text-cyan-300 font-mono">
                          <FileText className="inline h-4 w-4 mr-2" />
                          {parsedClients.length} clients ready to import
                        </p>
                      </div>
                      
                      <div className="max-h-60 overflow-y-auto space-y-1">
                        {parsedClients.slice(0, 10).map((client, idx) => (
                          <div key={idx} className="p-2 bg-cyan-500/5 border border-cyan-500/20 rounded text-xs font-mono text-cyan-400">
                            {client.first_name} {client.last_name} - {client.email}
                          </div>
                        ))}
                        {parsedClients.length > 10 && (
                          <p className="text-cyan-400/60 text-xs font-mono">
                            ...and {parsedClients.length - 10} more
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsImportDialogOpen(false);
                        setCsvFile(null);
                        setParsedClients([]);
                      }}
                      className="holographic-panel border-cyan-500/30 text-cyan-300 font-mono"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={importClients}
                      disabled={parsedClients.length === 0}
                      className="holographic-panel neon-border-cyan text-cyan-300 hover:bg-cyan-500/20 font-mono"
                    >
                      Import {parsedClients.length} Clients
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-cyan-600 hover:bg-cyan-700 text-white neon-border-cyan font-mono">
                  <Plus className="h-4 w-4 mr-2" />
                  ADD CLIENT
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl holographic-panel neon-border-cyan max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-cyan-300 font-mono neon-glow-cyan">⬡ ADD NEW CLIENT ⬡</DialogTitle>
                  <DialogDescription className="text-cyan-400/60 font-mono">
                    Enter client information
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-cyan-300 font-mono">First Name</Label>
                    <Input
                      value={formData.first_name}
                      onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                      className="holographic-panel border-cyan-500/30 text-cyan-300 font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-cyan-300 font-mono">Last Name</Label>
                    <Input
                      value={formData.last_name}
                      onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                      className="holographic-panel border-cyan-500/30 text-cyan-300 font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-cyan-300 font-mono">Email</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="holographic-panel border-cyan-500/30 text-cyan-300 font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-cyan-300 font-mono">Phone</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="holographic-panel border-cyan-500/30 text-cyan-300 font-mono"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label className="text-cyan-300 font-mono">Address</Label>
                    <Input
                      value={formData.address_street}
                      onChange={(e) => setFormData({...formData, address_street: e.target.value})}
                      className="holographic-panel border-cyan-500/30 text-cyan-300 font-mono"
                      placeholder="Street address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-cyan-300 font-mono">City</Label>
                    <Input
                      value={formData.address_city}
                      onChange={(e) => setFormData({...formData, address_city: e.target.value})}
                      className="holographic-panel border-cyan-500/30 text-cyan-300 font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-cyan-300 font-mono">State</Label>
                    <Input
                      value={formData.address_state}
                      onChange={(e) => setFormData({...formData, address_state: e.target.value})}
                      className="holographic-panel border-cyan-500/30 text-cyan-300 font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-cyan-300 font-mono">ZIP</Label>
                    <Input
                      value={formData.address_zip}
                      onChange={(e) => setFormData({...formData, address_zip: e.target.value})}
                      className="holographic-panel border-cyan-500/30 text-cyan-300 font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-cyan-300 font-mono">Region</Label>
                    <Input
                      value={formData.location_region}
                      onChange={(e) => setFormData({...formData, location_region: e.target.value})}
                      className="holographic-panel border-cyan-500/30 text-cyan-300 font-mono"
                      placeholder="e.g., South Florida"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-cyan-300 font-mono">Price Range Min</Label>
                    <Input
                      type="number"
                      value={formData.price_range_min || ''}
                      onChange={(e) => setFormData({...formData, price_range_min: parseFloat(e.target.value)})}
                      className="holographic-panel border-cyan-500/30 text-cyan-300 font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-cyan-300 font-mono">Price Range Max</Label>
                    <Input
                      type="number"
                      value={formData.price_range_max || ''}
                      onChange={(e) => setFormData({...formData, price_range_max: parseFloat(e.target.value)})}
                      className="holographic-panel border-cyan-500/30 text-cyan-300 font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-cyan-300 font-mono">Assigned Sales Rep</Label>
                    <Select 
                      value={formData.assigned_sales_rep_id} 
                      onValueChange={(value) => setFormData({...formData, assigned_sales_rep_id: value})}
                    >
                      <SelectTrigger className="holographic-panel border-cyan-500/30 text-cyan-300 font-mono">
                        <SelectValue placeholder="Select sales rep" />
                      </SelectTrigger>
                      <SelectContent>
                        {salesReps.map(rep => (
                          <SelectItem key={rep.id} value={rep.id}>
                            {rep.first_name} {rep.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-cyan-300 font-mono">Source</Label>
                    <Input
                      value={formData.source}
                      onChange={(e) => setFormData({...formData, source: e.target.value})}
                      className="holographic-panel border-cyan-500/30 text-cyan-300 font-mono"
                      placeholder="e.g., Referral, Website, Ad"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label className="text-cyan-300 font-mono">Notes</Label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      className="holographic-panel border-cyan-500/30 text-cyan-300 font-mono"
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {setIsAddDialogOpen(false); resetForm();}}
                    className="holographic-panel border-cyan-500/30 text-cyan-300 font-mono"
                  >
                    CANCEL
                  </Button>
                  <Button 
                    onClick={addClient}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white neon-border-cyan font-mono"
                  >
                    ADD CLIENT
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Clients Table */}
          <div className="border border-cyan-500/20 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-cyan-500/20 hover:bg-cyan-500/5">
                  <TableHead className="text-cyan-400 font-mono">CLIENT</TableHead>
                  <TableHead className="text-cyan-400 font-mono">LOCATION</TableHead>
                  <TableHead className="text-cyan-400 font-mono">BUDGET</TableHead>
                  <TableHead className="text-cyan-400 font-mono">SURVEY</TableHead>
                  <TableHead className="text-cyan-400 font-mono">SALES REP</TableHead>
                  <TableHead className="text-cyan-400 font-mono">STATUS</TableHead>
                  <TableHead className="text-cyan-400 font-mono">LAST CONTACT</TableHead>
                  <TableHead className="text-cyan-400 font-mono">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id} className="border-cyan-500/10 hover:bg-cyan-500/5">
                    <TableCell>
                      <div className="font-mono">
                        <p className="font-medium text-cyan-300">
                          {client.first_name} {client.last_name}
                        </p>
                        <p className="text-xs text-cyan-400/60">{client.email}</p>
                        {client.phone && (
                          <p className="text-xs text-cyan-400/60">{client.phone}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">
                      <div className="text-sm text-cyan-300">
                        {client.address_city && client.address_state && (
                          <p>{client.address_city}, {client.address_state}</p>
                        )}
                        {client.location_region && (
                          <p className="text-xs text-cyan-400/60">{client.location_region}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">
                      {client.price_range_min && client.price_range_max ? (
                        <div className="text-sm text-cyan-300">
                          ${client.price_range_min.toLocaleString()} - ${client.price_range_max.toLocaleString()}
                        </div>
                      ) : (
                        <span className="text-xs text-cyan-400/40">Not specified</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {client.survey_uploaded ? (
                        <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          UPLOADED
                        </Badge>
                      ) : (
                        <Badge className="bg-red-500/10 text-red-400 border-red-500/20">
                          PENDING
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-cyan-300">
                      {client.assigned_sales_rep_id ? (
                        salesReps.find(r => r.id === client.assigned_sales_rep_id)?.first_name || 'Assigned'
                      ) : (
                        <span className="text-cyan-400/40">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(client.status)}</TableCell>
                    <TableCell className="font-mono text-sm text-cyan-300">
                      {client.last_contacted_at ? (
                        format(new Date(client.last_contacted_at), 'MMM dd, yyyy')
                      ) : (
                        <span className="text-cyan-400/40">Never</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog 
                          open={isDetailsOpen && selectedClient?.id === client.id} 
                          onOpenChange={(open) => {
                            setIsDetailsOpen(open);
                            if (!open) setSelectedClient(null);
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedClient(client)}
                              className="holographic-panel border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 font-mono"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl holographic-panel neon-border-cyan max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="text-cyan-300 font-mono neon-glow-cyan">
                                ⬡ CLIENT DETAILS ⬡
                              </DialogTitle>
                              <DialogDescription className="text-cyan-400/60 font-mono">
                                Complete information and activity timeline
                              </DialogDescription>
                            </DialogHeader>
                            {selectedClient && (
                              <div className="space-y-6">
                                {/* Client Info */}
                                <div className="grid grid-cols-2 gap-6">
                                  <div className="space-y-4">
                                    <h4 className="font-semibold text-cyan-400 font-mono">CONTACT INFO</h4>
                                    <div className="space-y-2 text-sm font-mono">
                                      <p className="text-cyan-300">
                                        <strong>Name:</strong> {selectedClient.first_name} {selectedClient.last_name}
                                      </p>
                                      <p className="text-cyan-300"><strong>Email:</strong> {selectedClient.email}</p>
                                      {selectedClient.phone && (
                                        <p className="text-cyan-300"><strong>Phone:</strong> {selectedClient.phone}</p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="space-y-4">
                                    <h4 className="font-semibold text-blue-400 font-mono">ADDRESS</h4>
                                    <div className="space-y-2 text-sm font-mono text-cyan-300">
                                      {selectedClient.address_street && <p>{selectedClient.address_street}</p>}
                                      {selectedClient.address_city && (
                                        <p>{selectedClient.address_city}, {selectedClient.address_state} {selectedClient.address_zip}</p>
                                      )}
                                      {selectedClient.location_region && (
                                        <p className="text-cyan-400/60">{selectedClient.location_region}</p>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Status & Budget */}
                                <div className="space-y-4">
                                  <h4 className="font-semibold text-cyan-400 font-mono">PIPELINE INFO</h4>
                                  <div className="grid grid-cols-2 gap-4 text-sm font-mono">
                                    <div>
                                      <p className="text-cyan-400/60">Status</p>
                                      <Select 
                                        value={selectedClient.status} 
                                        onValueChange={(value) => updateClientStatus(selectedClient.id, value)}
                                      >
                                        <SelectTrigger className="holographic-panel border-cyan-500/30 text-cyan-300 font-mono">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="new">New</SelectItem>
                                          <SelectItem value="contacted">Contacted</SelectItem>
                                          <SelectItem value="qualified">Qualified</SelectItem>
                                          <SelectItem value="proposal_sent">Proposal Sent</SelectItem>
                                          <SelectItem value="negotiating">Negotiating</SelectItem>
                                          <SelectItem value="won">Won</SelectItem>
                                          <SelectItem value="lost">Lost</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    {selectedClient.price_range_min && selectedClient.price_range_max && (
                                      <div>
                                        <p className="text-cyan-400/60">Budget Range</p>
                                        <p className="text-cyan-300">
                                          ${selectedClient.price_range_min.toLocaleString()} - ${selectedClient.price_range_max.toLocaleString()}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Activity Timeline */}
                                <div className="space-y-4">
                                  <h4 className="font-semibold text-cyan-400 font-mono">ACTIVITY TIMELINE</h4>
                                  
                                  {/* Add Activity */}
                                  <div className="flex gap-2">
                                    <Select 
                                      value={newActivity.type} 
                                      onValueChange={(value) => setNewActivity({...newActivity, type: value})}
                                    >
                                      <SelectTrigger className="w-48 holographic-panel border-cyan-500/30 text-cyan-300 font-mono">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="call">Call</SelectItem>
                                        <SelectItem value="email">Email</SelectItem>
                                        <SelectItem value="meeting">Meeting</SelectItem>
                                        <SelectItem value="note">Note</SelectItem>
                                        <SelectItem value="survey_received">Survey Received</SelectItem>
                                        <SelectItem value="proposal_sent">Proposal Sent</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <Input
                                      placeholder="Activity description..."
                                      value={newActivity.description}
                                      onChange={(e) => setNewActivity({...newActivity, description: e.target.value})}
                                      className="flex-1 holographic-panel border-cyan-500/30 text-cyan-300 font-mono"
                                    />
                                    <Button 
                                      onClick={addActivity}
                                      className="bg-cyan-600 hover:bg-cyan-700 text-white font-mono"
                                    >
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  </div>

                                  {/* Activity List */}
                                  <div className="space-y-3 max-h-64 overflow-y-auto">
                                    {activities.map((activity) => (
                                      <div key={activity.id} className="holographic-panel p-3 border-cyan-500/20">
                                        <div className="flex items-start gap-3">
                                          <MessageSquare className="h-4 w-4 text-cyan-400 mt-1" />
                                          <div className="flex-1 font-mono">
                                            <div className="flex items-center gap-2 mb-1">
                                              <Badge className="text-xs bg-cyan-500/10 text-cyan-400">
                                                {activity.activity_type.toUpperCase().replace('_', ' ')}
                                              </Badge>
                                              <span className="text-xs text-cyan-400/60">
                                                {format(new Date(activity.created_at), 'MMM dd, yyyy HH:mm')}
                                              </span>
                                            </div>
                                            <p className="text-sm text-cyan-300">{activity.description}</p>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminClientManager;