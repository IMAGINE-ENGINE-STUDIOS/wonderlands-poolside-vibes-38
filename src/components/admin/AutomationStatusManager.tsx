import React, { useState, useEffect } from 'react';
import { Activity, Play, Pause, CheckCircle, AlertCircle, Clock, User, Mail, MessageSquare, Phone, PhoneCall, RefreshCw, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';

interface ClientAutomation {
  id: string;
  client_id: string;
  sequence_id: string;
  current_step: number;
  status: 'pending' | 'in_progress' | 'completed' | 'paused' | 'failed';
  started_at: string;
  last_action_at: string | null;
  next_action_at: string | null;
  error_message: string | null;
  client: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
  };
  sequence: {
    id: string;
    name: string;
  };
}

interface CommunicationLog {
  id: string;
  client_id: string;
  channel: 'email' | 'sms' | 'whatsapp' | 'voice';
  recipient: string;
  subject: string | null;
  message_content: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'opened' | 'clicked';
  external_id: string | null;
  error_message: string | null;
  sent_at: string | null;
  created_at: string;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  in_progress: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  completed: 'bg-green-500/20 text-green-400 border-green-500/30',
  paused: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  failed: 'bg-red-500/20 text-red-400 border-red-500/30',
  sent: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  delivered: 'bg-green-500/20 text-green-400 border-green-500/30',
  opened: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  clicked: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
};

const channelIcons: Record<string, React.ElementType> = {
  email: Mail,
  sms: MessageSquare,
  whatsapp: Phone,
  voice: PhoneCall
};

export default function AutomationStatusManager() {
  const [automations, setAutomations] = useState<ClientAutomation[]>([]);
  const [logs, setLogs] = useState<CommunicationLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [clientLogs, setClientLogs] = useState<CommunicationLog[]>([]);
  const [isLogsDialogOpen, setIsLogsDialogOpen] = useState(false);

  useEffect(() => {
    fetchAutomations();
    fetchRecentLogs();
  }, [statusFilter]);

  const fetchAutomations = async () => {
    setIsLoading(true);
    
    let query = supabase
      .from('client_automations')
      .select(`
        *,
        client:clients(id, first_name, last_name, email, phone),
        sequence:automation_sequences(id, name)
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter as 'pending' | 'in_progress' | 'completed' | 'paused' | 'failed');
    }

    const { data, error } = await query;

    if (error) {
      toast.error('Failed to load automations');
      console.error(error);
    } else {
      setAutomations(data as ClientAutomation[] || []);
    }
    setIsLoading(false);
  };

  const fetchRecentLogs = async () => {
    const { data, error } = await supabase
      .from('communication_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (!error) {
      setLogs(data as CommunicationLog[] || []);
    }
  };

  const fetchClientLogs = async (clientId: string) => {
    const { data, error } = await supabase
      .from('communication_logs')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (!error) {
      setClientLogs(data as CommunicationLog[] || []);
      setSelectedClient(clientId);
      setIsLogsDialogOpen(true);
    }
  };

  const toggleAutomationStatus = async (automation: ClientAutomation) => {
    const newStatus = automation.status === 'paused' ? 'in_progress' : 'paused';
    
    const { error } = await supabase
      .from('client_automations')
      .update({ status: newStatus })
      .eq('id', automation.id);

    if (error) {
      toast.error('Failed to update status');
    } else {
      toast.success(`Automation ${newStatus === 'paused' ? 'paused' : 'resumed'}`);
      fetchAutomations();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-400" />;
      case 'paused': return <Pause className="h-4 w-4 text-gray-400" />;
      case 'in_progress': return <Activity className="h-4 w-4 text-blue-400" />;
      default: return <Clock className="h-4 w-4 text-yellow-400" />;
    }
  };

  // Stats
  const stats = {
    total: automations.length,
    inProgress: automations.filter(a => a.status === 'in_progress').length,
    completed: automations.filter(a => a.status === 'completed').length,
    failed: automations.filter(a => a.status === 'failed').length
  };

  const recentLogStats = {
    sent: logs.filter(l => l.status === 'sent' || l.status === 'delivered').length,
    failed: logs.filter(l => l.status === 'failed').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-cyan-300">Automation Status</h2>
          <p className="text-cyan-400/60 text-sm">Monitor client automations and communication logs</p>
        </div>
        <Button onClick={() => { fetchAutomations(); fetchRecentLogs(); }} variant="outline" className="border-cyan-500/30">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gray-900/50 border-cyan-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/20">
                <Activity className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-cyan-300">{stats.total}</p>
                <p className="text-xs text-cyan-400/60">Total Automations</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900/50 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Play className="h-5 w-5 text-blue-200" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-100">{stats.inProgress}</p>
                <p className="text-xs text-blue-300/80">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900/50 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-300">{stats.completed}</p>
                <p className="text-xs text-green-400/60">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900/50 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Mail className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-300">{recentLogStats.sent}</p>
                <p className="text-xs text-purple-400/60">Messages Sent</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48 bg-gray-800 border-cyan-500/30">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Automations Table */}
      <Card className="bg-gray-900/50 border-cyan-500/20">
        <CardHeader>
          <CardTitle className="text-cyan-300">Client Automations</CardTitle>
          <CardDescription className="text-cyan-400/60">
            Track the status of automated outreach for each client
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-cyan-400/60">Loading...</div>
          ) : automations.length === 0 ? (
            <div className="text-center py-12 text-cyan-400/60">
              No automations found. Add a new client to trigger an automation.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-cyan-500/20">
                  <TableHead className="text-cyan-400">Client</TableHead>
                  <TableHead className="text-cyan-400">Sequence</TableHead>
                  <TableHead className="text-cyan-400">Step</TableHead>
                  <TableHead className="text-cyan-400">Status</TableHead>
                  <TableHead className="text-cyan-400">Next Action</TableHead>
                  <TableHead className="text-cyan-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {automations.map((automation) => (
                  <TableRow key={automation.id} className="border-cyan-500/10">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-cyan-400/60" />
                        <div>
                          <p className="font-medium text-cyan-300">
                            {automation.client?.first_name} {automation.client?.last_name}
                          </p>
                          <p className="text-xs text-cyan-400/60">{automation.client?.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-cyan-400/80">
                      {automation.sequence?.name || 'Unknown'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-cyan-400">
                        Step {automation.current_step}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[automation.status]}>
                        {getStatusIcon(automation.status)}
                        <span className="ml-1 capitalize">{automation.status.replace('_', ' ')}</span>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-cyan-400/60 text-sm">
                      {automation.next_action_at ? (
                        formatDistanceToNow(new Date(automation.next_action_at), { addSuffix: true })
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-cyan-500/10"
                          onClick={() => fetchClientLogs(automation.client_id)}
                        >
                          <Eye className="h-4 w-4 text-cyan-400" />
                        </Button>
                        {(automation.status === 'in_progress' || automation.status === 'paused') && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-cyan-500/10"
                            onClick={() => toggleAutomationStatus(automation)}
                          >
                            {automation.status === 'paused' ? (
                              <Play className="h-4 w-4 text-green-400" />
                            ) : (
                              <Pause className="h-4 w-4 text-yellow-400" />
                            )}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Recent Communication Logs */}
      <Card className="bg-gray-900/50 border-cyan-500/20">
        <CardHeader>
          <CardTitle className="text-cyan-300">Recent Communications</CardTitle>
          <CardDescription className="text-cyan-400/60">
            Latest messages sent across all channels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {logs.slice(0, 10).map((log) => {
              const Icon = channelIcons[log.channel] || Mail;
              return (
                <div
                  key={log.id}
                  className="flex items-center gap-4 p-3 rounded-lg bg-gray-800/50 border border-cyan-500/10"
                >
                  <div className={`p-2 rounded-lg ${
                    log.channel === 'email' ? 'bg-blue-500/20' :
                    log.channel === 'sms' ? 'bg-green-500/20' :
                    log.channel === 'whatsapp' ? 'bg-emerald-500/20' : 'bg-purple-500/20'
                  }`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-cyan-300 truncate">
                      {log.subject || log.message_content.substring(0, 50)}...
                    </p>
                    <p className="text-xs text-cyan-400/60">
                      To: {log.recipient}
                    </p>
                  </div>
                  <Badge className={statusColors[log.status]}>
                    {log.status}
                  </Badge>
                  <span className="text-xs text-cyan-400/40">
                    {log.sent_at ? format(new Date(log.sent_at), 'MMM d, HH:mm') : '-'}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Client Logs Dialog */}
      <Dialog open={isLogsDialogOpen} onOpenChange={setIsLogsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-gray-900 border-cyan-500/30">
          <DialogHeader>
            <DialogTitle className="text-cyan-300">Communication History</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {clientLogs.length === 0 ? (
              <p className="text-center text-cyan-400/60 py-8">No communications yet</p>
            ) : (
              clientLogs.map((log) => {
                const Icon = channelIcons[log.channel] || Mail;
                return (
                  <div
                    key={log.id}
                    className="p-4 rounded-lg bg-gray-800/50 border border-cyan-500/10"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        log.channel === 'email' ? 'bg-blue-500/20' :
                        log.channel === 'sms' ? 'bg-green-500/20' :
                        log.channel === 'whatsapp' ? 'bg-emerald-500/20' : 'bg-purple-500/20'
                      }`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {log.channel.toUpperCase()}
                          </Badge>
                          <Badge className={statusColors[log.status]}>
                            {log.status}
                          </Badge>
                          <span className="text-xs text-cyan-400/40">
                            {log.created_at ? format(new Date(log.created_at), 'MMM d, yyyy HH:mm') : '-'}
                          </span>
                        </div>
                        {log.subject && (
                          <p className="text-sm font-medium text-cyan-300 mb-1">
                            Subject: {log.subject}
                          </p>
                        )}
                        <p className="text-sm text-cyan-400/80 whitespace-pre-wrap">
                          {log.message_content}
                        </p>
                        {log.error_message && (
                          <p className="text-xs text-red-400 mt-2">
                            Error: {log.error_message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
