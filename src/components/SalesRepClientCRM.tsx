import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Phone, Mail, MapPin, DollarSign, Calendar, History, 
  MessageSquare, FileText, Loader2, Plus, CheckCircle2, 
  Clock, User, Activity, Send
} from 'lucide-react';

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
  notes?: string;
}

interface ClientActivity {
  id: string;
  client_id: string;
  activity_type: string;
  description: string;
  created_by?: string;
  created_at: string;
}

interface CommunicationLog {
  id: string;
  channel: string;
  status: string;
  sent_at?: string;
  message_content: string;
  subject?: string;
}

interface SalesRepClientCRMProps {
  client: Client;
  isOpen: boolean;
  onClose: () => void;
  onClientUpdated: () => void;
}

const ACTIVITY_TYPES = [
  { value: 'call', label: 'Call', icon: '📞' },
  { value: 'email', label: 'Email', icon: '📧' },
  { value: 'meeting', label: 'Meeting', icon: '🤝' },
  { value: 'note', label: 'Note', icon: '📝' },
  { value: 'proposal_sent', label: 'Proposal Sent', icon: '📄' },
];

const PIPELINE_STAGES = [
  { value: 'new', label: 'New', icon: '🆕', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  { value: 'contacted', label: 'Contacted', icon: '📞', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
  { value: 'qualified', label: 'Qualified', icon: '✅', color: 'bg-green-500/20 text-green-300 border-green-500/30' },
  { value: 'proposal_sent', label: 'Proposal Sent', icon: '📄', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
  { value: 'negotiating', label: 'Negotiating', icon: '🤝', color: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
  { value: 'won', label: 'Won', icon: '🏆', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  { value: 'lost', label: 'Lost', icon: '❌', color: 'bg-red-500/20 text-red-300 border-red-500/30' },
];

const SalesRepClientCRM = ({ client, isOpen, onClose, onClientUpdated }: SalesRepClientCRMProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [activities, setActivities] = useState<ClientActivity[]>([]);
  const [communicationLogs, setCommunicationLogs] = useState<CommunicationLog[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [savingActivity, setSavingActivity] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingNotes, setUpdatingNotes] = useState(false);
  
  const [newActivity, setNewActivity] = useState({ type: 'note', description: '' });
  const [clientNotes, setClientNotes] = useState(client.notes || '');
  const [currentStatus, setCurrentStatus] = useState(client.status);

  useEffect(() => {
    if (isOpen && client) {
      fetchActivities();
      fetchCommunicationLogs();
      setClientNotes(client.notes || '');
      setCurrentStatus(client.status);
    }
  }, [isOpen, client]);

  const fetchActivities = async () => {
    setLoadingActivities(true);
    try {
      const { data, error } = await supabase
        .from('client_activities')
        .select('*')
        .eq('client_id', client.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoadingActivities(false);
    }
  };

  const fetchCommunicationLogs = async () => {
    setLoadingLogs(true);
    try {
      const { data, error } = await supabase
        .from('communication_logs')
        .select('id, channel, status, sent_at, message_content, subject')
        .eq('client_id', client.id)
        .order('sent_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setCommunicationLogs(data || []);
    } catch (error) {
      console.error('Error fetching communication logs:', error);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleAddActivity = async () => {
    if (!newActivity.description.trim()) {
      toast({
        title: "Error",
        description: "Please enter a description for the activity.",
        variant: "destructive"
      });
      return;
    }

    setSavingActivity(true);
    try {
      const { error } = await supabase
        .from('client_activities')
        .insert({
          client_id: client.id,
          activity_type: newActivity.type,
          description: newActivity.description,
          created_by: user?.id
        });

      if (error) throw error;

      // Update last_contacted_at if it was a contact activity
      if (['call', 'email', 'meeting'].includes(newActivity.type)) {
        await supabase
          .from('clients')
          .update({ last_contacted_at: new Date().toISOString() })
          .eq('id', client.id);
      }

      toast({
        title: "Activity Added",
        description: "Your activity has been logged successfully."
      });

      setNewActivity({ type: 'note', description: '' });
      fetchActivities();
      onClientUpdated();
    } catch (error) {
      console.error('Error adding activity:', error);
      toast({
        title: "Error",
        description: "Failed to add activity.",
        variant: "destructive"
      });
    } finally {
      setSavingActivity(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setUpdatingStatus(true);
    try {
      const { error } = await supabase
        .from('clients')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', client.id);

      if (error) throw error;

      // Log the status change as an activity
      await supabase
        .from('client_activities')
        .insert({
          client_id: client.id,
          activity_type: 'status_change',
          description: `Status changed from "${currentStatus}" to "${newStatus}"`,
          created_by: user?.id
        });

      setCurrentStatus(newStatus);
      toast({
        title: "Status Updated",
        description: `Client moved to "${newStatus.replace('_', ' ')}" stage`
      });
      
      fetchActivities();
      onClientUpdated();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update status.",
        variant: "destructive"
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSaveNotes = async () => {
    setUpdatingNotes(true);
    try {
      const { error } = await supabase
        .from('clients')
        .update({ 
          notes: clientNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', client.id);

      if (error) throw error;

      toast({
        title: "Notes Saved",
        description: "Client notes have been updated."
      });
      onClientUpdated();
    } catch (error) {
      console.error('Error saving notes:', error);
      toast({
        title: "Error",
        description: "Failed to save notes.",
        variant: "destructive"
      });
    } finally {
      setUpdatingNotes(false);
    }
  };

  const getStatusBadge = () => {
    const stage = PIPELINE_STAGES.find(s => s.value === currentStatus);
    return stage ? (
      <Badge className={`${stage.color} font-mono text-xs`}>
        {stage.icon} {stage.label}
      </Badge>
    ) : (
      <Badge className="bg-gray-500/20 text-gray-300 border-gray-500/30 font-mono text-xs">
        {currentStatus}
      </Badge>
    );
  };

  const formatPriceRange = (min?: number, max?: number) => {
    if (!min && !max) return 'Not specified';
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `From $${min.toLocaleString()}`;
    if (max) return `Up to $${max.toLocaleString()}`;
    return 'Not specified';
  };

  const getActivityIcon = (type: string) => {
    const activity = ACTIVITY_TYPES.find(a => a.value === type);
    return activity ? activity.icon : '📋';
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'sms': return <MessageSquare className="h-4 w-4" />;
      case 'whatsapp': return <MessageSquare className="h-4 w-4" />;
      case 'voice': return <Phone className="h-4 w-4" />;
      default: return <Mail className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-cyan-500/30 max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-cyan-300 font-mono flex items-center gap-3">
            <User className="h-5 w-5" />
            {client.first_name} {client.last_name}
            {getStatusBadge()}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="h-full">
          <TabsList className="bg-slate-800/50 border border-cyan-500/20">
            <TabsTrigger value="overview" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300 font-mono text-xs">
              Overview
            </TabsTrigger>
            <TabsTrigger value="activities" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300 font-mono text-xs">
              Activities
            </TabsTrigger>
            <TabsTrigger value="communications" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300 font-mono text-xs">
              Communications
            </TabsTrigger>
            <TabsTrigger value="notes" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300 font-mono text-xs">
              Notes
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-4">
            <div className="grid grid-cols-2 gap-6">
              {/* Contact Info */}
              <div className="space-y-4">
                <h4 className="font-semibold text-cyan-400 font-mono text-sm">CONTACT INFO</h4>
                <div className="space-y-3 text-sm">
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
                        {[client.address_street, client.address_city, client.address_state, client.address_zip]
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

              {/* Pipeline Status */}
              <div className="space-y-4">
                <h4 className="font-semibold text-cyan-400 font-mono text-sm">PIPELINE STATUS</h4>
                <Select
                  value={currentStatus}
                  onValueChange={handleStatusChange}
                  disabled={updatingStatus}
                >
                  <SelectTrigger className="holographic-panel border-cyan-500/30 text-cyan-300 font-mono">
                    {updatingStatus ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
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
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Quick Add Activity */}
                <div className="pt-4 space-y-3">
                  <h4 className="font-semibold text-cyan-400 font-mono text-sm">QUICK LOG</h4>
                  <Select
                    value={newActivity.type}
                    onValueChange={(value) => setNewActivity({ ...newActivity, type: value })}
                  >
                    <SelectTrigger className="holographic-panel border-cyan-500/30 text-cyan-300 font-mono text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-cyan-500/30">
                      {ACTIVITY_TYPES.map((type) => (
                        <SelectItem 
                          key={type.value} 
                          value={type.value}
                          className="font-mono text-xs text-cyan-300 hover:bg-cyan-500/20 focus:bg-cyan-500/20"
                        >
                          {type.icon} {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Textarea
                    value={newActivity.description}
                    onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                    placeholder="Add notes about this interaction..."
                    className="holographic-panel border-cyan-500/30 text-cyan-300 font-mono text-xs min-h-[80px] placeholder:text-cyan-400/40"
                  />
                  <Button
                    onClick={handleAddActivity}
                    disabled={savingActivity || !newActivity.description.trim()}
                    className="w-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30"
                  >
                    {savingActivity ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    Log Activity
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Activities Tab */}
          <TabsContent value="activities" className="mt-4">
            <ScrollArea className="h-[400px]">
              {loadingActivities ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
                </div>
              ) : activities.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="h-10 w-10 text-cyan-400/40 mx-auto mb-2" />
                  <p className="text-cyan-400/60 font-mono text-sm">No activities logged yet</p>
                </div>
              ) : (
                <div className="space-y-3 pr-4">
                  {activities.map((activity) => (
                    <div key={activity.id} className="holographic-panel border-cyan-500/20 p-3 rounded-lg">
                      <div className="flex items-start gap-3">
                        <span className="text-lg">{getActivityIcon(activity.activity_type)}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className="font-mono text-xs capitalize bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                              {activity.activity_type.replace('_', ' ')}
                            </Badge>
                            <span className="text-xs text-cyan-400/60 font-mono">
                              {new Date(activity.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-cyan-400/80">{activity.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* Communications Tab */}
          <TabsContent value="communications" className="mt-4">
            <ScrollArea className="h-[400px]">
              {loadingLogs ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
                </div>
              ) : communicationLogs.length === 0 ? (
                <div className="text-center py-8">
                  <History className="h-10 w-10 text-cyan-400/40 mx-auto mb-2" />
                  <p className="text-cyan-400/60 font-mono text-sm">No communication history yet</p>
                </div>
              ) : (
                <div className="space-y-3 pr-4">
                  {communicationLogs.map((log) => (
                    <div key={log.id} className="holographic-panel border-cyan-500/20 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 rounded bg-cyan-500/20">
                          {getChannelIcon(log.channel)}
                        </div>
                        <Badge className="font-mono text-xs capitalize bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                          {log.channel}
                        </Badge>
                        <Badge className={`font-mono text-xs ${log.status === 'sent' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                          {log.status}
                        </Badge>
                        {log.sent_at && (
                          <span className="text-xs text-cyan-400/60 font-mono ml-auto">
                            {new Date(log.sent_at).toLocaleString()}
                          </span>
                        )}
                      </div>
                      {log.subject && (
                        <p className="text-sm text-cyan-300 font-medium mb-1">{log.subject}</p>
                      )}
                      <p className="text-sm text-cyan-400/80 line-clamp-3">{log.message_content}</p>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes" className="mt-4">
            <div className="space-y-4">
              <Textarea
                value={clientNotes}
                onChange={(e) => setClientNotes(e.target.value)}
                placeholder="Add private notes about this client..."
                className="holographic-panel border-cyan-500/30 text-cyan-300 font-mono text-sm min-h-[300px] placeholder:text-cyan-400/40"
              />
              <Button
                onClick={handleSaveNotes}
                disabled={updatingNotes || clientNotes === (client.notes || '')}
                className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30"
              >
                {updatingNotes ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                )}
                Save Notes
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default SalesRepClientCRM;
