import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Gift, 
  Eye, 
  Edit, 
  DollarSign, 
  Users, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Phone, 
  Mail, 
  Building,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Referral {
  id: string;
  referrer_name: string;
  referrer_email: string;
  referrer_phone?: string;
  lead_name: string;
  lead_email: string;
  lead_phone?: string;
  lead_company?: string;
  project_type: string;
  estimated_budget?: number;
  project_description: string;
  lead_urgency: string;
  status: string;
  commission_rate: number;
  estimated_commission: number;
  created_at: string;
  updated_at: string;
}

const AdminReferralsManager = () => {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { toast } = useToast();

  const fetchReferrals = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReferrals(data || []);
    } catch (error) {
      console.error('Error fetching referrals:', error);
      toast({
        title: "Error",
        description: "Failed to fetch referrals",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateReferralStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('referrals')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      setReferrals(prev => 
        prev.map(ref => 
          ref.id === id ? { ...ref, status: newStatus } : ref
        )
      );

      toast({
        title: "Success",
        description: "Referral status updated successfully",
      });
    } catch (error) {
      console.error('Error updating referral:', error);
      toast({
        title: "Error",
        description: "Failed to update referral status",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, []);

  const filteredReferrals = referrals.filter(ref => {
    const matchesStatus = statusFilter === 'all' || ref.status === statusFilter;
    const matchesSearch = 
      ref.referrer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ref.lead_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ref.lead_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ref.project_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary', icon: Clock, color: 'text-yellow-600' },
      contacted: { variant: 'default', icon: Phone, color: 'text-blue-600' },
      qualified: { variant: 'default', icon: CheckCircle, color: 'text-green-600' },
      converted: { variant: 'default', icon: TrendingUp, color: 'text-emerald-600' },
      rejected: { variant: 'destructive', icon: XCircle, color: 'text-red-600' }
    } as const;

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getUrgencyColor = (urgency: string) => {
    const colors = {
      low: 'text-green-600',
      medium: 'text-yellow-600',
      high: 'text-orange-600',
      urgent: 'text-red-600'
    };
    return colors[urgency as keyof typeof colors] || colors.medium;
  };

  // Calculate summary metrics
  const totalCommissionValue = referrals
    .filter(r => r.status === 'converted')
    .reduce((sum, r) => sum + (r.estimated_commission || 0), 0);
  
  const potentialCommissions = referrals
    .filter(r => ['pending', 'contacted', 'qualified'].includes(r.status))
    .reduce((sum, r) => sum + (r.estimated_commission || 0), 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 w-20 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 w-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="h-64 bg-gray-100 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Referrals</p>
                <p className="text-2xl font-bold text-primary">{referrals.length}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Converted</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {referrals.filter(r => r.status === 'converted').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Commissions Paid</p>
                <p className="text-2xl font-bold text-green-600">
                  ${totalCommissionValue.toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Potential Value</p>
                <p className="text-2xl font-bold text-orange-600">
                  ${potentialCommissions.toLocaleString()}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referrals Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            Referral Management
          </CardTitle>
          <CardDescription>
            Manage and track all referrals from the REFERN TO EERN program
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search referrals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={fetchReferrals} variant="outline" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>

          {/* Referrals Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Referrer</TableHead>
                  <TableHead>Lead</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Urgency</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReferrals.map((referral) => (
                  <TableRow key={referral.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{referral.referrer_name}</p>
                        <p className="text-sm text-muted-foreground">{referral.referrer_email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{referral.lead_name}</p>
                        <p className="text-sm text-muted-foreground">{referral.lead_email}</p>
                        {referral.lead_company && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Building className="h-3 w-3" />
                            {referral.lead_company}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{referral.project_type}</Badge>
                    </TableCell>
                    <TableCell>
                      {referral.estimated_budget ? 
                        `$${referral.estimated_budget.toLocaleString()}` : 
                        'Not specified'
                      }
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-green-600">
                        ${referral.estimated_commission?.toLocaleString() || '0'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ({referral.commission_rate}%)
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(referral.status)}</TableCell>
                    <TableCell>
                      <span className={`text-sm font-medium ${getUrgencyColor(referral.lead_urgency)}`}>
                        {referral.lead_urgency.charAt(0).toUpperCase() + referral.lead_urgency.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {format(new Date(referral.created_at), 'MMM dd, yyyy')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog open={isDetailsOpen && selectedReferral?.id === referral.id} 
                                onOpenChange={(open) => {
                                  setIsDetailsOpen(open);
                                  if (!open) setSelectedReferral(null);
                                }}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedReferral(referral)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Referral Details</DialogTitle>
                              <DialogDescription>
                                Complete information about this referral
                              </DialogDescription>
                            </DialogHeader>
                            {selectedReferral && (
                              <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                  <div className="space-y-4">
                                    <h4 className="font-semibold text-primary">Referrer Information</h4>
                                    <div className="space-y-2 text-sm">
                                      <p><strong>Name:</strong> {selectedReferral.referrer_name}</p>
                                      <p><strong>Email:</strong> {selectedReferral.referrer_email}</p>
                                      {selectedReferral.referrer_phone && (
                                        <p><strong>Phone:</strong> {selectedReferral.referrer_phone}</p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="space-y-4">
                                    <h4 className="font-semibold text-teal">Lead Information</h4>
                                    <div className="space-y-2 text-sm">
                                      <p><strong>Name:</strong> {selectedReferral.lead_name}</p>
                                      <p><strong>Email:</strong> {selectedReferral.lead_email}</p>
                                      {selectedReferral.lead_phone && (
                                        <p><strong>Phone:</strong> {selectedReferral.lead_phone}</p>
                                      )}
                                      {selectedReferral.lead_company && (
                                        <p><strong>Company:</strong> {selectedReferral.lead_company}</p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="space-y-4">
                                  <h4 className="font-semibold text-coral">Project Details</h4>
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <p><strong>Type:</strong> {selectedReferral.project_type}</p>
                                    <p><strong>Urgency:</strong> 
                                      <span className={`ml-2 ${getUrgencyColor(selectedReferral.lead_urgency)}`}>
                                        {selectedReferral.lead_urgency}
                                      </span>
                                    </p>
                                    {selectedReferral.estimated_budget && (
                                      <p><strong>Budget:</strong> ${selectedReferral.estimated_budget.toLocaleString()}</p>
                                    )}
                                    <p><strong>Commission:</strong> 
                                      <span className="text-green-600 font-medium ml-2">
                                        ${selectedReferral.estimated_commission?.toLocaleString() || '0'}
                                      </span>
                                    </p>
                                  </div>
                                  <div>
                                    <p className="font-medium mb-2">Project Description:</p>
                                    <div className="bg-muted p-3 rounded text-sm">
                                      {selectedReferral.project_description}
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-4">
                                  <h4 className="font-semibold">Update Status</h4>
                                  <div className="flex gap-2 flex-wrap">
                                    {['pending', 'contacted', 'qualified', 'converted', 'rejected'].map(status => (
                                      <Button
                                        key={status}
                                        variant={selectedReferral.status === status ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => updateReferralStatus(selectedReferral.id, status)}
                                      >
                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                      </Button>
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

          {filteredReferrals.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || statusFilter !== 'all' 
                ? 'No referrals match your current filters' 
                : 'No referrals found'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminReferralsManager;