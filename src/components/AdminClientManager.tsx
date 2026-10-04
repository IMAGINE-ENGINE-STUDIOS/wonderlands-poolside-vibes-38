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
import { Checkbox } from '@/components/ui/checkbox';
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
  MessageSquare,
  Zap,
  Play,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTriggerAutomation } from '@/hooks/useTriggerAutomation';
import { format } from 'date-fns';
import ClientMapDialog from '@/components/admin/ClientMapDialog';


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
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [zipFilter, setZipFilter] = useState('');
  const [isMapOpen, setIsMapOpen] = useState(false);

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
  const [clientAutomationStatus, setClientAutomationStatus] = useState<Record<string, boolean>>({});
  const [isBulkAssignDialogOpen, setIsBulkAssignDialogOpen] = useState(false);
  const [bulkAssignRepId, setBulkAssignRepId] = useState<string>('');
  const [isBulkAssigning, setIsBulkAssigning] = useState(false);
  const { toast } = useToast();
  const { isLoading: automationLoading, triggerAutomationForClient, triggerAutomationForMultiple, triggerAutomationForAll } = useTriggerAutomation();

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
      
      // Fetch automation status for all clients
      if (data && data.length > 0) {
        const { data: automations } = await supabase
          .from('client_automations')
          .select('client_id')
          .in('status', ['pending', 'in_progress']);
        
        const statusMap: Record<string, boolean> = {};
        automations?.forEach(a => {
          statusMap[a.client_id] = true;
        });
        setClientAutomationStatus(statusMap);
      }
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

  const assignSalesRep = async (clientId: string, salesRepId: string | null) => {
    try {
      const { error } = await supabase
        .from('clients')
        .update({ assigned_sales_rep_id: salesRepId })
        .eq('id', clientId);

      if (error) throw error;

      // Log assignment activity
      const repName = salesRepId 
        ? salesReps.find(r => r.id === salesRepId)?.first_name + ' ' + salesReps.find(r => r.id === salesRepId)?.last_name
        : 'Unassigned';
      
      await supabase.from('client_activities').insert([{
        client_id: clientId,
        activity_type: 'assignment',
        description: `Assigned to ${repName}`
      }]);

      setClients(prev => 
        prev.map(client => 
          client.id === clientId ? { ...client, assigned_sales_rep_id: salesRepId || undefined } : client
        )
      );

      toast({
        title: "Success",
        description: salesRepId ? "Client assigned to sales rep" : "Client unassigned",
      });
    } catch (error) {
      console.error('Error assigning sales rep:', error);
      toast({
        title: "Error",
        description: "Failed to assign sales rep",
        variant: "destructive",
      });
    }
  };

  const bulkAssignSalesRep = async () => {
    if (selectedClients.size === 0) return;
    
    setIsBulkAssigning(true);
    try {
      const clientIds = Array.from(selectedClients);
      const newRepId = bulkAssignRepId === 'unassign' ? null : bulkAssignRepId || null;
      
      // Batch update all selected clients
      const { error } = await supabase
        .from('clients')
        .update({ assigned_sales_rep_id: newRepId })
        .in('id', clientIds);

      if (error) throw error;

      // Log activity for each client
      const activityLogs = clientIds.map(clientId => ({
        client_id: clientId,
        activity_type: 'assignment',
        description: newRepId 
          ? `Assigned to ${salesReps.find(r => r.id === newRepId)?.first_name || 'sales rep'} ${salesReps.find(r => r.id === newRepId)?.last_name || ''} (bulk action)`
          : 'Unassigned from sales rep (bulk action)'
      }));

      await supabase.from('client_activities').insert(activityLogs);

      // Update local state
      setClients(prev => prev.map(client => 
        clientIds.includes(client.id) 
          ? { ...client, assigned_sales_rep_id: newRepId || undefined }
          : client
      ));

      toast({
        title: "Success",
        description: `${clientIds.length} clients ${newRepId ? 'assigned' : 'unassigned'} successfully`,
      });

      setSelectedClients(new Set());
      setIsBulkAssignDialogOpen(false);
      setBulkAssignRepId('');
    } catch (error) {
      console.error('Error bulk assigning:', error);
      toast({
        title: "Error",
        description: "Failed to bulk assign clients",
        variant: "destructive",
      });
    } finally {
      setIsBulkAssigning(false);
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

  // Automation trigger handlers
  const handleTriggerAutomation = async (clientId: string) => {
    const result = await triggerAutomationForClient(clientId);
    if (result.success) {
      toast({
        title: "Automation Started",
        description: "Client automation has been triggered successfully",
      });
      setClientAutomationStatus(prev => ({ ...prev, [clientId]: true }));
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to trigger automation",
        variant: "destructive",
      });
    }
  };

  const handleTriggerSelectedAutomations = async () => {
    const clientIds = Array.from(selectedClients);
    if (clientIds.length === 0) {
      toast({
        title: "No clients selected",
        description: "Please select clients to trigger automations",
        variant: "destructive",
      });
      return;
    }

    const result = await triggerAutomationForMultiple(clientIds);
    toast({
      title: "Automations Triggered",
      description: `${result.successful} successful, ${result.failed} failed`,
    });
    setSelectedClients(new Set());
    fetchClients();
  };

  const handleTriggerAllAutomations = async () => {
    const result = await triggerAutomationForAll();
    toast({
      title: "Bulk Automation Complete",
      description: `${result.successful} automations started, ${result.failed} failed`,
    });
    fetchClients();
  };

  const toggleClientSelection = (clientId: string) => {
    setSelectedClients(prev => {
      const newSet = new Set(prev);
      if (newSet.has(clientId)) {
        newSet.delete(clientId);
      } else {
        newSet.add(clientId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedClients.size === filteredClients.length) {
      setSelectedClients(new Set());
    } else {
      setSelectedClients(new Set(filteredClients.map(c => c.id)));
    }
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

  // Unique sorted list of cities for the location filter dropdown
  const uniqueCities = Array.from(new Set(
    clients.map(c => (c.address_city || '').trim()).filter(Boolean)
  )).sort((a, b) => a.localeCompare(b));

  const filteredClients = clients.filter(client => {
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      client.first_name.toLowerCase().includes(searchLower) ||
      client.last_name.toLowerCase().includes(searchLower) ||
      client.email.toLowerCase().includes(searchLower) ||
      (client.phone && client.phone.includes(searchTerm)) ||
      (client.location_region && client.location_region.toLowerCase().includes(searchLower));
    
    // Location (city) filter — matches city or region
    const matchesCity = cityFilter === 'all' ||
      (client.address_city || '').trim().toLowerCase() === cityFilter.toLowerCase() ||
      (client.location_region || '').trim().toLowerCase() === cityFilter.toLowerCase();

    // ZIP code filter — prefix match so partial ZIPs (e.g. "322") work
    const matchesZip = !zipFilter.trim() ||
      (client.address_zip || '').trim().startsWith(zipFilter.trim());

    return matchesStatus && matchesSearch && matchesCity && matchesZip;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      new: { variant: 'secondary', color: 'text-black bg-neutral-100' },
      contacted: { variant: 'default', color: 'text-black bg-neutral-100' },
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
      <div className="space-y-6 bg-white min-h-screen p-6 -m-6 -mt-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse bg-white border border-neutral-200 rounded-xl shadow-sm">
              <CardContent className="p-6">
                <div className="h-4 w-20 bg-neutral-100 rounded mb-2"></div>
                <div className="h-8 w-16 bg-neutral-100 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white min-h-screen p-6 -m-6 -mt-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border border-neutral-200 rounded-xl shadow-sm neon-border-cyan">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 ">TOTAL CLIENTS</p>
                <p className="text-3xl font-bold text-black neon-glow-cyan ">{totalClients}</p>
              </div>
              <Users className="h-10 w-10 text-black" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border border-neutral-200 rounded-xl shadow-sm neon-border-blue">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-black ">NEW THIS MONTH</p>
                <p className="text-3xl font-bold text-blue-100 neon-glow-blue ">{newThisMonth}</p>
              </div>
              <TrendingUp className="h-10 w-10 text-black" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-neutral-200 rounded-xl shadow-sm neon-border-cyan">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-400/60 ">ACTIVE DEALS</p>
                <p className="text-3xl font-bold text-orange-300 ">{activeDeals}</p>
              </div>
              <Clock className="h-10 w-10 text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-neutral-200 rounded-xl shadow-sm neon-border-cyan">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-400/60 ">WON DEALS</p>
                <p className="text-3xl font-bold text-emerald-300 neon-glow-cyan ">{wonDeals}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-emerald-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Client Management */}
      <Card className="bg-white border border-neutral-200 rounded-xl shadow-sm neon-border-cyan">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-black  neon-glow-cyan">
            <Users className="h-6 w-6" />
            ⬡ CLIENT MANAGEMENT ⬡
          </CardTitle>
          <CardDescription className="text-neutral-600 ">
            Track and manage all clients in the pipeline
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters & Actions */}
          <div className="flex flex-wrap items-center gap-3 mb-6 min-w-0">
            <div className="flex-1 min-w-[220px] basis-full lg:basis-auto">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-black" />
                <Input
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white border border-neutral-200 rounded-xl shadow-sm border-neutral-200 text-black placeholder:text-neutral-500 "
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48 bg-white border border-neutral-200 rounded-xl shadow-sm border-neutral-200 text-black ">
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
            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger className="w-full md:w-48 bg-white border border-neutral-200 rounded-xl shadow-sm border-neutral-200 text-black ">
                <MapPin className="h-4 w-4 mr-2 text-black" />
                <SelectValue placeholder="All locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {uniqueCities.map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative w-full md:w-36">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-black" />
              <Input
                placeholder="ZIP code..."
                value={zipFilter}
                onChange={(e) => setZipFilter(e.target.value)}
                className="pl-10 bg-white border border-neutral-200 rounded-xl shadow-sm border-neutral-200 text-black placeholder:text-neutral-500 "
              />
            </div>
            <Button
              onClick={() => setIsMapOpen(true)}
              className="bg-white border border-neutral-200 rounded-xl shadow-sm neon-border-cyan text-black hover:bg-neutral-100 "
            >
              <MapPin className="h-4 w-4 mr-2" />
              VIEW MAP
            </Button>

            <Button 
              onClick={fetchClients} 
              variant="outline" 
              className="bg-white border border-neutral-200 rounded-xl shadow-sm border-neutral-200 text-black hover:bg-neutral-100 "
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              REFRESH
            </Button>

            
            <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-white border border-neutral-200 rounded-xl shadow-sm neon-border-blue text-black hover:bg-neutral-100 ">
                  <Upload className="h-4 w-4 mr-2" />
                  Import CSV
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white border border-neutral-200 rounded-xl shadow-sm neon-border-cyan max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-black  neon-glow-cyan">⬡ IMPORT CLIENTS FROM CSV ⬡</DialogTitle>
                  <DialogDescription className="text-neutral-600 ">
                    Upload a CSV file with client data
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label className="text-black ">CSV File</Label>
                    <Input
                      type="file"
                      accept=".csv"
                      onChange={handleCSVUpload}
                      className="bg-white border border-neutral-200 rounded-xl shadow-sm border-neutral-200 text-black "
                    />
                  </div>
                  
                  {parsedClients.length > 0 && (
                    <div className="space-y-2">
                      <div className="p-4 bg-neutral-100 border border-neutral-200 rounded">
                        <p className="text-black ">
                          <FileText className="inline h-4 w-4 mr-2" />
                          {parsedClients.length} clients ready to import
                        </p>
                      </div>
                      
                      <div className="max-h-60 overflow-y-auto space-y-1">
                        {parsedClients.slice(0, 10).map((client, idx) => (
                          <div key={idx} className="p-2 bg-neutral-100 border border-neutral-200 rounded text-xs  text-black">
                            {client.first_name} {client.last_name} - {client.email}
                          </div>
                        ))}
                        {parsedClients.length > 10 && (
                          <p className="text-neutral-600 text-xs ">
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
                      className="bg-white border border-neutral-200 rounded-xl shadow-sm border-neutral-200 text-black "
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={importClients}
                      disabled={parsedClients.length === 0}
                      className="bg-white border border-neutral-200 rounded-xl shadow-sm neon-border-cyan text-black hover:bg-neutral-100 "
                    >
                      Import {parsedClients.length} Clients
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Bulk Assign Button - appears when clients are selected */}
            {selectedClients.size > 0 && (
              <Dialog open={isBulkAssignDialogOpen} onOpenChange={setIsBulkAssignDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="bg-white border border-neutral-200 rounded-xl shadow-sm neon-border-cyan text-black hover:bg-neutral-100 "
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Bulk Assign ({selectedClients.size})
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white border border-neutral-200 rounded-xl shadow-sm neon-border-cyan">
                  <DialogHeader>
                    <DialogTitle className="text-black  neon-glow-cyan">⬡ BULK ASSIGN CLIENTS ⬡</DialogTitle>
                    <DialogDescription className="text-neutral-600 ">
                      Assign {selectedClients.size} selected clients to a sales representative
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-black ">Select Sales Representative</Label>
                      <Select value={bulkAssignRepId} onValueChange={setBulkAssignRepId}>
                        <SelectTrigger className="bg-white border border-neutral-200 rounded-xl shadow-sm border-neutral-200 text-black ">
                          <SelectValue placeholder="Choose a sales rep..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassign">
                            <span className="text-red-400">✕ Unassign (remove assignment)</span>
                          </SelectItem>
                          {salesReps.map((rep) => (
                            <SelectItem key={rep.id} value={rep.id}>
                              {rep.first_name} {rep.last_name} ({rep.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsBulkAssignDialogOpen(false);
                          setBulkAssignRepId('');
                        }}
                        className="bg-white border border-neutral-200 rounded-xl shadow-sm border-neutral-200 text-black "
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={bulkAssignSalesRep}
                        disabled={!bulkAssignRepId || isBulkAssigning}
                        className="bg-cyan-600 hover:bg-cyan-700 text-black neon-border-cyan "
                      >
                        {isBulkAssigning ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Users className="h-4 w-4 mr-2" />}
                        {bulkAssignRepId === 'unassign' ? 'Unassign' : 'Assign'} {selectedClients.size} Clients
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {/* Automation Bulk Actions */}
            {selectedClients.size > 0 && (
              <Button 
                onClick={handleTriggerSelectedAutomations}
                disabled={automationLoading}
                className="bg-white border border-neutral-200 rounded-xl shadow-sm neon-border-blue text-black hover:bg-neutral-100 "
              >
                {automationLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Zap className="h-4 w-4 mr-2" />}
                Automate Selected ({selectedClients.size})
              </Button>
            )}
            
            <Button 
              onClick={handleTriggerAllAutomations}
              disabled={automationLoading}
              variant="outline"
              className="bg-white border border-neutral-200 rounded-xl shadow-sm border-purple-500/30 text-purple-300 hover:bg-purple-500/10 "
            >
              {automationLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
              Automate All
            </Button>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-cyan-600 hover:bg-cyan-700 text-black neon-border-cyan ">
                  <Plus className="h-4 w-4 mr-2" />
                  ADD CLIENT
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl bg-white border border-neutral-200 rounded-xl shadow-sm neon-border-cyan max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-black  neon-glow-cyan">⬡ ADD NEW CLIENT ⬡</DialogTitle>
                  <DialogDescription className="text-neutral-600 ">
                    Enter client information
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-black ">First Name</Label>
                    <Input
                      value={formData.first_name}
                      onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                      className="bg-white border border-neutral-200 rounded-xl shadow-sm border-neutral-200 text-black "
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-black ">Last Name</Label>
                    <Input
                      value={formData.last_name}
                      onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                      className="bg-white border border-neutral-200 rounded-xl shadow-sm border-neutral-200 text-black "
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-black ">Email</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="bg-white border border-neutral-200 rounded-xl shadow-sm border-neutral-200 text-black "
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-black ">Phone</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="bg-white border border-neutral-200 rounded-xl shadow-sm border-neutral-200 text-black "
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label className="text-black ">Address</Label>
                    <Input
                      value={formData.address_street}
                      onChange={(e) => setFormData({...formData, address_street: e.target.value})}
                      className="bg-white border border-neutral-200 rounded-xl shadow-sm border-neutral-200 text-black "
                      placeholder="Street address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-black ">City</Label>
                    <Input
                      value={formData.address_city}
                      onChange={(e) => setFormData({...formData, address_city: e.target.value})}
                      className="bg-white border border-neutral-200 rounded-xl shadow-sm border-neutral-200 text-black "
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-black ">State</Label>
                    <Input
                      value={formData.address_state}
                      onChange={(e) => setFormData({...formData, address_state: e.target.value})}
                      className="bg-white border border-neutral-200 rounded-xl shadow-sm border-neutral-200 text-black "
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-black ">ZIP</Label>
                    <Input
                      value={formData.address_zip}
                      onChange={(e) => setFormData({...formData, address_zip: e.target.value})}
                      className="bg-white border border-neutral-200 rounded-xl shadow-sm border-neutral-200 text-black "
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-black ">Region</Label>
                    <Input
                      value={formData.location_region}
                      onChange={(e) => setFormData({...formData, location_region: e.target.value})}
                      className="bg-white border border-neutral-200 rounded-xl shadow-sm border-neutral-200 text-black "
                      placeholder="e.g., South Florida"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-black ">Price Range Min</Label>
                    <Input
                      type="number"
                      value={formData.price_range_min || ''}
                      onChange={(e) => setFormData({...formData, price_range_min: parseFloat(e.target.value)})}
                      className="bg-white border border-neutral-200 rounded-xl shadow-sm border-neutral-200 text-black "
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-black ">Price Range Max</Label>
                    <Input
                      type="number"
                      value={formData.price_range_max || ''}
                      onChange={(e) => setFormData({...formData, price_range_max: parseFloat(e.target.value)})}
                      className="bg-white border border-neutral-200 rounded-xl shadow-sm border-neutral-200 text-black "
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-black ">Assigned Sales Rep</Label>
                    <Select 
                      value={formData.assigned_sales_rep_id} 
                      onValueChange={(value) => setFormData({...formData, assigned_sales_rep_id: value})}
                    >
                      <SelectTrigger className="bg-white border border-neutral-200 rounded-xl shadow-sm border-neutral-200 text-black ">
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
                    <Label className="text-black ">Source</Label>
                    <Input
                      value={formData.source}
                      onChange={(e) => setFormData({...formData, source: e.target.value})}
                      className="bg-white border border-neutral-200 rounded-xl shadow-sm border-neutral-200 text-black "
                      placeholder="e.g., Referral, Website, Ad"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label className="text-black ">Notes</Label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      className="bg-white border border-neutral-200 rounded-xl shadow-sm border-neutral-200 text-black "
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {setIsAddDialogOpen(false); resetForm();}}
                    className="bg-white border border-neutral-200 rounded-xl shadow-sm border-neutral-200 text-black "
                  >
                    CANCEL
                  </Button>
                  <Button 
                    onClick={addClient}
                    className="bg-cyan-600 hover:bg-cyan-700 text-black neon-border-cyan "
                  >
                    ADD CLIENT
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Edit Client Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
            setIsEditDialogOpen(open);
            if (!open) {
              setSelectedClient(null);
              resetForm();
            }
          }}>
            <DialogContent className="max-w-3xl bg-white border border-neutral-200 rounded-xl shadow-sm neon-border-cyan max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-black  neon-glow-cyan">⬡ EDIT CLIENT ⬡</DialogTitle>
                <DialogDescription className="text-neutral-600 ">
                  Update client information
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-black ">First Name</Label>
                  <Input
                    value={formData.first_name}
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                    className="bg-white border border-neutral-200 rounded-xl shadow-sm border-neutral-200 text-black "
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-black ">Last Name</Label>
                  <Input
                    value={formData.last_name}
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                    className="bg-white border border-neutral-200 rounded-xl shadow-sm border-neutral-200 text-black "
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-black ">Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="bg-white border border-neutral-200 rounded-xl shadow-sm border-neutral-200 text-black "
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-black ">Phone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="bg-white border border-neutral-200 rounded-xl shadow-sm border-neutral-200 text-black "
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label className="text-black ">Address</Label>
                  <Input
                    value={formData.address_street}
                    onChange={(e) => setFormData({...formData, address_street: e.target.value})}
                    className="bg-white border border-neutral-200 rounded-xl shadow-sm border-neutral-200 text-black "
                    placeholder="Street address"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-black ">City</Label>
                  <Input
                    value={formData.address_city}
                    onChange={(e) => setFormData({...formData, address_city: e.target.value})}
                    className="bg-white border border-neutral-200 rounded-xl shadow-sm border-neutral-200 text-black "
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-black ">State</Label>
                  <Input
                    value={formData.address_state}
                    onChange={(e) => setFormData({...formData, address_state: e.target.value})}
                    className="bg-white border border-neutral-200 rounded-xl shadow-sm border-neutral-200 text-black "
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-black ">ZIP</Label>
                  <Input
                    value={formData.address_zip}
                    onChange={(e) => setFormData({...formData, address_zip: e.target.value})}
                    className="bg-white border border-neutral-200 rounded-xl shadow-sm border-neutral-200 text-black "
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-black ">Region</Label>
                  <Input
                    value={formData.location_region}
                    onChange={(e) => setFormData({...formData, location_region: e.target.value})}
                    className="bg-white border border-neutral-200 rounded-xl shadow-sm border-neutral-200 text-black "
                    placeholder="e.g., South Florida"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-black ">Price Range Min</Label>
                  <Input
                    type="number"
                    value={formData.price_range_min || ''}
                    onChange={(e) => setFormData({...formData, price_range_min: parseFloat(e.target.value)})}
                    className="bg-white border border-neutral-200 rounded-xl shadow-sm border-neutral-200 text-black "
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-black ">Price Range Max</Label>
                  <Input
                    type="number"
                    value={formData.price_range_max || ''}
                    onChange={(e) => setFormData({...formData, price_range_max: parseFloat(e.target.value)})}
                    className="bg-white border border-neutral-200 rounded-xl shadow-sm border-neutral-200 text-black "
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-black ">Assigned Sales Rep</Label>
                  <Select 
                    value={formData.assigned_sales_rep_id || 'unassigned'} 
                    onValueChange={(value) => setFormData({...formData, assigned_sales_rep_id: value === 'unassigned' ? undefined : value})}
                  >
                    <SelectTrigger className="bg-white border border-neutral-200 rounded-xl shadow-sm border-neutral-200 text-black ">
                      <SelectValue placeholder="Select sales rep" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {salesReps.map(rep => (
                        <SelectItem key={rep.id} value={rep.id}>
                          {rep.first_name} {rep.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-black ">Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => setFormData({...formData, status: value})}
                  >
                    <SelectTrigger className="bg-white border border-neutral-200 rounded-xl shadow-sm border-neutral-200 text-black ">
                      <SelectValue placeholder="Select status" />
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
                <div className="space-y-2">
                  <Label className="text-black ">Source</Label>
                  <Input
                    value={formData.source}
                    onChange={(e) => setFormData({...formData, source: e.target.value})}
                    className="bg-white border border-neutral-200 rounded-xl shadow-sm border-neutral-200 text-black "
                    placeholder="e.g., Referral, Website, Ad"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label className="text-black ">Notes</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="bg-white border border-neutral-200 rounded-xl shadow-sm border-neutral-200 text-black "
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {setIsEditDialogOpen(false); setSelectedClient(null); resetForm();}}
                  className="bg-white border border-neutral-200 rounded-xl shadow-sm border-neutral-200 text-black "
                >
                  CANCEL
                </Button>
                <Button 
                  onClick={updateClient}
                  className="bg-cyan-600 hover:bg-cyan-700 text-black neon-border-cyan "
                >
                  SAVE CHANGES
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Clients Table */}
          <div className="border border-neutral-200 rounded-lg overflow-x-auto max-w-full">
            <Table>
              <TableHeader>
                <TableRow className="border-neutral-200 hover:bg-neutral-100">
                  <TableHead className="w-10">
                    <Checkbox
                      checked={selectedClients.size === filteredClients.length && filteredClients.length > 0}
                      onCheckedChange={toggleSelectAll}
                      className="border-neutral-200"
                    />
                  </TableHead>
                  <TableHead className="text-black ">CLIENT</TableHead>
                  <TableHead className="text-black ">LOCATION</TableHead>
                  <TableHead className="text-black ">BUDGET</TableHead>
                  <TableHead className="text-black ">SURVEY</TableHead>
                  <TableHead className="text-black ">SALES REP</TableHead>
                  <TableHead className="text-black ">STATUS</TableHead>
                  <TableHead className="text-black ">LAST CONTACT</TableHead>
                  <TableHead className="text-black ">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id} className="border-neutral-200 hover:bg-neutral-100">
                    <TableCell>
                      <Checkbox
                        checked={selectedClients.has(client.id)}
                        onCheckedChange={() => toggleClientSelection(client.id)}
                        className="border-neutral-200"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="">
                        <p className="font-medium text-black">
                          {client.first_name} {client.last_name}
                        </p>
                        <p className="text-xs text-neutral-600">{client.email}</p>
                        {client.phone && (
                          <p className="text-xs text-neutral-600">{client.phone}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="">
                      <div className="text-sm text-black">
                        {client.address_city && client.address_state && (
                          <p>{client.address_city}, {client.address_state}</p>
                        )}
                        {client.location_region && (
                          <p className="text-xs text-neutral-600">{client.location_region}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="">
                      {client.price_range_min && client.price_range_max ? (
                        <div className="text-sm text-black">
                          ${client.price_range_min.toLocaleString()} - ${client.price_range_max.toLocaleString()}
                        </div>
                      ) : (
                        <span className="text-xs text-neutral-600">Not specified</span>
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
                    <TableCell className=" text-sm">
                      <Select
                        value={client.assigned_sales_rep_id || 'unassigned'}
                        onValueChange={(value) => assignSalesRep(client.id, value === 'unassigned' ? null : value)}
                      >
                        <SelectTrigger className="w-32 h-8 bg-white border border-neutral-200 rounded-xl shadow-sm border-neutral-200 text-black  text-xs">
                          <SelectValue placeholder="Assign" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">Unassigned</SelectItem>
                          {salesReps.map(rep => (
                            <SelectItem key={rep.id} value={rep.id}>
                              {rep.first_name} {rep.last_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>{getStatusBadge(client.status)}</TableCell>
                    <TableCell className=" text-sm text-black">
                      {client.last_contacted_at ? (
                        format(new Date(client.last_contacted_at), 'MMM dd, yyyy')
                      ) : (
                        <span className="text-neutral-600">Never</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {/* Automation Button */}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleTriggerAutomation(client.id)}
                          disabled={clientAutomationStatus[client.id] || automationLoading}
                          className={`bg-white border border-neutral-200 rounded-xl shadow-sm  ${
                            clientAutomationStatus[client.id] 
                              ? 'border-green-500/30 text-green-400' 
                              : 'border-purple-500/30 text-purple-300 hover:bg-purple-500/10'
                          }`}
                          title={clientAutomationStatus[client.id] ? 'Automation active' : 'Start automation'}
                        >
                          {clientAutomationStatus[client.id] ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <Zap className="h-4 w-4" />
                          )}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedClient(client);
                            setFormData({
                              first_name: client.first_name,
                              last_name: client.last_name,
                              email: client.email,
                              phone: client.phone || '',
                              address_street: client.address_street || '',
                              address_city: client.address_city || '',
                              address_state: client.address_state || 'FL',
                              address_zip: client.address_zip || '',
                              location_region: client.location_region || '',
                              price_range_min: client.price_range_min,
                              price_range_max: client.price_range_max,
                              interests: client.interests || [],
                              survey_uploaded: client.survey_uploaded,
                              assigned_sales_rep_id: client.assigned_sales_rep_id,
                              status: client.status,
                              source: client.source || '',
                              notes: client.notes || ''
                            });
                            setIsEditDialogOpen(true);
                          }}
                          className="bg-white border border-neutral-200 rounded-xl shadow-sm border-neutral-200 text-black hover:bg-neutral-100 "
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
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
                              className="bg-white border border-neutral-200 rounded-xl shadow-sm border-neutral-200 text-black hover:bg-neutral-100 "
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl bg-white border border-neutral-200 rounded-xl shadow-sm neon-border-cyan max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="text-black  neon-glow-cyan">
                                ⬡ CLIENT DETAILS ⬡
                              </DialogTitle>
                              <DialogDescription className="text-neutral-600 ">
                                Complete information and activity timeline
                              </DialogDescription>
                            </DialogHeader>
                            {selectedClient && (
                              <div className="space-y-6">
                                {/* Client Info */}
                                <div className="grid grid-cols-2 gap-6">
                                  <div className="space-y-4">
                                    <h4 className="font-semibold text-black ">CONTACT INFO</h4>
                                    <div className="space-y-2 text-sm ">
                                      <p className="text-black">
                                        <strong>Name:</strong> {selectedClient.first_name} {selectedClient.last_name}
                                      </p>
                                      <p className="text-black"><strong>Email:</strong> {selectedClient.email}</p>
                                      {selectedClient.phone && (
                                        <p className="text-black"><strong>Phone:</strong> {selectedClient.phone}</p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="space-y-4">
                                    <h4 className="font-semibold text-black ">ADDRESS</h4>
                                    <div className="space-y-2 text-sm  text-black">
                                      {selectedClient.address_street && <p>{selectedClient.address_street}</p>}
                                      {selectedClient.address_city && (
                                        <p>{selectedClient.address_city}, {selectedClient.address_state} {selectedClient.address_zip}</p>
                                      )}
                                      {selectedClient.location_region && (
                                        <p className="text-neutral-600">{selectedClient.location_region}</p>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Status & Budget */}
                                <div className="space-y-4">
                                  <h4 className="font-semibold text-black ">PIPELINE INFO</h4>
                                  <div className="grid grid-cols-2 gap-4 text-sm ">
                                    <div>
                                      <p className="text-neutral-600">Status</p>
                                      <Select 
                                        value={selectedClient.status} 
                                        onValueChange={(value) => updateClientStatus(selectedClient.id, value)}
                                      >
                                        <SelectTrigger className="bg-white border border-neutral-200 rounded-xl shadow-sm border-neutral-200 text-black ">
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
                                        <p className="text-neutral-600">Budget Range</p>
                                        <p className="text-black">
                                          ${selectedClient.price_range_min.toLocaleString()} - ${selectedClient.price_range_max.toLocaleString()}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Activity Timeline */}
                                <div className="space-y-4">
                                  <h4 className="font-semibold text-black ">ACTIVITY TIMELINE</h4>
                                  
                                  {/* Add Activity */}
                                  <div className="flex gap-2">
                                    <Select 
                                      value={newActivity.type} 
                                      onValueChange={(value) => setNewActivity({...newActivity, type: value})}
                                    >
                                      <SelectTrigger className="w-48 bg-white border border-neutral-200 rounded-xl shadow-sm border-neutral-200 text-black ">
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
                                      className="flex-1 bg-white border border-neutral-200 rounded-xl shadow-sm border-neutral-200 text-black "
                                    />
                                    <Button 
                                      onClick={addActivity}
                                      className="bg-cyan-600 hover:bg-cyan-700 text-black "
                                    >
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  </div>

                                  {/* Activity List */}
                                  <div className="space-y-3 max-h-64 overflow-y-auto">
                                    {activities.map((activity) => (
                                      <div key={activity.id} className="bg-white border border-neutral-200 rounded-xl shadow-sm p-3 border-neutral-200">
                                        <div className="flex items-start gap-3">
                                          <MessageSquare className="h-4 w-4 text-black mt-1" />
                                          <div className="flex-1 ">
                                            <div className="flex items-center gap-2 mb-1">
                                              <Badge className="text-xs bg-neutral-100 text-black">
                                                {activity.activity_type.toUpperCase().replace('_', ' ')}
                                              </Badge>
                                              <span className="text-xs text-neutral-600">
                                                {format(new Date(activity.created_at), 'MMM dd, yyyy HH:mm')}
                                              </span>
                                            </div>
                                            <p className="text-sm text-black">{activity.description}</p>
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

      {/* Free OpenStreetMap client map with distance-to-base ranking */}
      <ClientMapDialog open={isMapOpen} onOpenChange={setIsMapOpen} clients={filteredClients} />
    </div>

  );
};

export default AdminClientManager;