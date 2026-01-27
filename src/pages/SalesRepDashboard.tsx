import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Users, FileText, LogOut, Phone, Mail, MapPin, DollarSign, Calendar, Zap, Loader2, CheckCircle2, UserCog } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SurveyQuoteTool from '@/components/SurveyQuoteTool';
import SalesRepClientCRM from '@/components/SalesRepClientCRM';
import { useTriggerAutomation } from '@/hooks/useTriggerAutomation';

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
  status: string;
  price_range_min?: number;
  price_range_max?: number;
  interests?: any;
  last_contacted_at?: string;
  created_at: string;
}

interface ClientAutomation {
  id: string;
  client_id: string;
  status: string;
  current_step: number;
  next_action_at?: string;
}


const SalesRepDashboard = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();
  const { triggerAutomationForClient, isLoading: automationLoading } = useTriggerAutomation();
  const [clients, setClients] = useState<Client[]>([]);
  const [clientAutomations, setClientAutomations] = useState<Record<string, ClientAutomation>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showQuoteTool, setShowQuoteTool] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showCRM, setShowCRM] = useState(false);
  const [crmClient, setCrmClient] = useState<Client | null>(null);
  const [triggeringClientId, setTriggeringClientId] = useState<string | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  const PIPELINE_STAGES = [
    { value: 'new', label: 'New', icon: '🆕' },
    { value: 'contacted', label: 'Contacted', icon: '📞' },
    { value: 'qualified', label: 'Qualified', icon: '✅' },
    { value: 'proposal_sent', label: 'Proposal Sent', icon: '📄' },
    { value: 'negotiating', label: 'Negotiating', icon: '🤝' },
    { value: 'won', label: 'Won', icon: '🏆' },
    { value: 'lost', label: 'Lost', icon: '❌' },
  ];

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (profile?.role !== 'sales_rep' as any) {
      navigate('/');
      return;
    }

    fetchAssignedClients();
  }, [user, profile, navigate]);

  const fetchAssignedClients = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('assigned_sales_rep_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClients(data || []);

      // Fetch active automations for these clients
      if (data && data.length > 0) {
        const clientIds = data.map(c => c.id);
        const { data: automations } = await supabase
          .from('client_automations')
          .select('id, client_id, status, current_step, next_action_at')
          .in('client_id', clientIds)
          .in('status', ['pending', 'in_progress']);
        
        const automationMap: Record<string, ClientAutomation> = {};
        (automations || []).forEach(a => {
          automationMap[a.client_id] = a;
        });
        setClientAutomations(automationMap);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast({
        title: "Error",
        description: "Failed to load your assigned clients.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCRM = (client: Client) => {
    setCrmClient(client);
    setShowCRM(true);
  };

  const handleTriggerAutomation = async (client: Client) => {
    setTriggeringClientId(client.id);
    const result = await triggerAutomationForClient(client.id, 'manual_trigger');
    if (result.success) {
      toast({
        title: "Automation Started",
        description: `Automation triggered for ${client.first_name} ${client.last_name}`,
      });
      // Refresh to get updated automation status
      fetchAssignedClients();
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to trigger automation",
        variant: "destructive"
      });
    }
    setTriggeringClientId(null);
  };

  const handleStatusChange = async (clientId: string, newStatus: string) => {
    setUpdatingStatusId(clientId);
    try {
      const { error } = await supabase
        .from('clients')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', clientId);

      if (error) throw error;

      // Update local state
      setClients(prev => prev.map(c => 
        c.id === clientId ? { ...c, status: newStatus } : c
      ));

      toast({
        title: "Status Updated",
        description: `Client moved to "${newStatus.replace('_', ' ')}" stage`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update client status",
        variant: "destructive"
      });
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const getAutomationBadge = (clientId: string) => {
    const automation = clientAutomations[clientId];
    if (!automation) return null;
    
    if (automation.status === 'in_progress') {
      return (
        <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 font-mono text-xs">
          <Zap className="h-3 w-3 mr-1" />
          Step {automation.current_step}
        </Badge>
      );
    }
    return null;
  };


  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const handleCreateQuote = (client: Client) => {
    setSelectedClient(client);
    setShowQuoteTool(true);
  };

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

  const formatPriceRange = (min?: number, max?: number) => {
    if (!min && !max) return 'Not specified';
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `From $${min.toLocaleString()}`;
    if (max) return `Up to $${max.toLocaleString()}`;
    return 'Not specified';
  };

  if (!user || profile?.role !== 'sales_rep' as any) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="holographic-panel border-b border-cyan-500/30 sticky top-0 z-50 backdrop-blur-md bg-slate-900/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg holographic-panel flex items-center justify-center">
                <Users className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-cyan-300 font-mono tracking-wide">
                  SALES REP PORTAL
                </h1>
                <p className="text-xs text-cyan-400/60 font-mono">
                  Welcome, {profile?.first_name || profile?.email}
                </p>
              </div>
            </div>
            <Button 
              onClick={handleLogout}
              variant="outline"
              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="holographic-panel border-cyan-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-cyan-400/60 font-mono uppercase">Total Clients</p>
                  <p className="text-3xl font-bold text-cyan-300 font-mono">{clients.length}</p>
                </div>
                <Users className="h-8 w-8 text-cyan-400/40" />
              </div>
            </CardContent>
          </Card>

          <Card className="holographic-panel border-green-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-green-400/60 font-mono uppercase">Qualified</p>
                  <p className="text-3xl font-bold text-green-300 font-mono">
                    {clients.filter(c => c.status === 'qualified').length}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-green-400/40" />
              </div>
            </CardContent>
          </Card>

          <Card className="holographic-panel border-yellow-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-yellow-400/60 font-mono uppercase">Proposals Sent</p>
                  <p className="text-3xl font-bold text-yellow-300 font-mono">
                    {clients.filter(c => c.status === 'proposal_sent').length}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-yellow-400/40" />
              </div>
            </CardContent>
          </Card>

          <Card className="holographic-panel border-emerald-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-emerald-400/60 font-mono uppercase">Won</p>
                  <p className="text-3xl font-bold text-emerald-300 font-mono">
                    {clients.filter(c => c.status === 'won').length}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-emerald-400/40" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Clients List */}
        <Card className="holographic-panel border-cyan-500/30">
          <CardHeader>
            <CardTitle className="text-cyan-300 font-mono flex items-center gap-2">
              <Users className="h-5 w-5" />
              YOUR ASSIGNED CLIENTS
            </CardTitle>
            <CardDescription className="text-cyan-400/60 font-mono text-xs">
              Manage your client relationships and create quotes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
                <p className="text-cyan-400/60 font-mono text-sm mt-4">Loading clients...</p>
              </div>
            ) : clients.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-cyan-400/40 mx-auto mb-4" />
                <p className="text-cyan-400/60 font-mono text-sm">No clients assigned yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {clients.map((client) => (
                  <div
                    key={client.id}
                    className="holographic-panel border-cyan-500/20 p-4 rounded-lg hover:border-cyan-500/40 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-lg font-semibold text-cyan-300 font-mono">
                          {client.first_name} {client.last_name}
                        </h3>
                        {/* Status Selector */}
                        <Select
                          value={client.status}
                          onValueChange={(value) => handleStatusChange(client.id, value)}
                          disabled={updatingStatusId === client.id}
                        >
                          <SelectTrigger className={`w-[160px] h-8 text-xs font-mono ${getStatusColor(client.status)} border bg-transparent`}>
                            {updatingStatusId === client.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <SelectValue />
                            )}
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900 border-cyan-500/30">
                            {PIPELINE_STAGES.map((stage) => (
                              <SelectItem 
                                key={stage.value} 
                                value={stage.value}
                                className="font-mono text-xs text-cyan-300 hover:bg-cyan-500/20 focus:bg-cyan-500/20"
                              >
                                <span className="flex items-center gap-2">
                                  <span>{stage.icon}</span>
                                  <span>{stage.label}</span>
                                  {client.status === stage.value && (
                                    <CheckCircle2 className="h-3 w-3 text-green-400 ml-1" />
                                  )}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {getAutomationBadge(client.id)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenCRM(client)}
                          className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                        >
                          <UserCog className="h-4 w-4 mr-1" />
                          View Client
                        </Button>
                        {!clientAutomations[client.id] && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTriggerAutomation(client)}
                            disabled={triggeringClientId === client.id}
                            className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                          >
                            {triggeringClientId === client.id ? (
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                              <Zap className="h-4 w-4 mr-1" />
                            )}
                            Start Automation
                          </Button>
                        )}
                        <Button
                          onClick={() => handleCreateQuote(client)}
                          className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Create Quote
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-cyan-400/80">
                        <Mail className="h-4 w-4" />
                        <span className="font-mono">{client.email}</span>
                      </div>
                      
                      {client.phone && (
                        <div className="flex items-center gap-2 text-cyan-400/80">
                          <Phone className="h-4 w-4" />
                          <span className="font-mono">{client.phone}</span>
                        </div>
                      )}

                      {(client.address_street || client.address_city) && (
                        <div className="flex items-center gap-2 text-cyan-400/80">
                          <MapPin className="h-4 w-4" />
                          <span className="font-mono">
                            {[client.address_street, client.address_city, client.address_state]
                              .filter(Boolean)
                              .join(', ')}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-cyan-400/80">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-mono">{formatPriceRange(client.price_range_min, client.price_range_max)}</span>
                      </div>

                      {client.last_contacted_at && (
                        <div className="flex items-center gap-2 text-cyan-400/80">
                          <Calendar className="h-4 w-4" />
                          <span className="font-mono">
                            Last contact: {new Date(client.last_contacted_at).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quote Tool Dialog */}
      <SurveyQuoteTool
        pool={null}
        isOpen={showQuoteTool}
        onClose={() => {
          setShowQuoteTool(false);
          setSelectedClient(null);
        }}
      />

      {/* CRM Dialog */}
      {crmClient && (
        <SalesRepClientCRM
          client={crmClient}
          isOpen={showCRM}
          onClose={() => {
            setShowCRM(false);
            setCrmClient(null);
          }}
          onClientUpdated={fetchAssignedClients}
        />
      )}
    </div>
  );
};

export default SalesRepDashboard;
