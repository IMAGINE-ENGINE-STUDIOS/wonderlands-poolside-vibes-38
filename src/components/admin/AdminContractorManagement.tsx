import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  HardHat, Search, CheckCircle, Clock, AlertCircle, XCircle,
  Eye, Building2, Shield, DollarSign, FileText, Phone, Mail,
  MapPin, Calendar, RefreshCw
} from 'lucide-react';

interface Contractor {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  address_city: string;
  address_state: string;
  status: string;
  subscription_active: boolean;
  agreement_signed: boolean;
  agreement_signed_at: string;
  years_experience: number;
  created_at: string;
}

interface ContractorService {
  id: string;
  service_category: string;
  service_name: string;
  labor_price: number;
  with_materials_price: number;
  price_unit: string;
  is_active: boolean;
}

interface ContractorLicense {
  id: string;
  license_type: string;
  license_number: string;
  issuing_authority: string;
  expiration_date: string;
  is_verified: boolean;
}

const AdminContractorManagement = () => {
  const { toast } = useToast();
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedContractor, setSelectedContractor] = useState<Contractor | null>(null);
  const [contractorServices, setContractorServices] = useState<ContractorService[]>([]);
  const [contractorLicenses, setContractorLicenses] = useState<ContractorLicense[]>([]);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    loadContractors();
  }, []);

  const loadContractors = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('contractors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContractors(data || []);
    } catch (error: any) {
      toast({
        title: "Error Loading Contractors",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadContractorDetails = async (contractor: Contractor) => {
    setSelectedContractor(contractor);
    
    try {
      const [servicesRes, licensesRes] = await Promise.all([
        supabase.from('contractor_services').select('*').eq('contractor_id', contractor.id),
        supabase.from('contractor_licenses').select('*').eq('contractor_id', contractor.id)
      ]);

      setContractorServices(servicesRes.data || []);
      setContractorLicenses(licensesRes.data || []);
      setDetailsOpen(true);
    } catch (error: any) {
      toast({
        title: "Error Loading Details",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const updateContractorStatus = async (contractorId: string, newStatus: 'pending' | 'approved' | 'suspended' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('contractors')
        .update({ status: newStatus } as any)
        .eq('id', contractorId);

      if (error) throw error;

      setContractors(contractors.map(c => 
        c.id === contractorId ? { ...c, status: newStatus } : c
      ));

      if (selectedContractor?.id === contractorId) {
        setSelectedContractor({ ...selectedContractor, status: newStatus });
      }

      toast({
        title: "Status Updated",
        description: `Contractor status changed to ${newStatus}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const verifyLicense = async (licenseId: string) => {
    try {
      const { error } = await supabase
        .from('contractor_licenses')
        .update({ is_verified: true })
        .eq('id', licenseId);

      if (error) throw error;

      setContractorLicenses(contractorLicenses.map(l => 
        l.id === licenseId ? { ...l, is_verified: true } : l
      ));

      toast({
        title: "License Verified",
        description: "The license has been marked as verified.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30"><CheckCircle className="w-3 h-3 mr-1" /> Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'suspended':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30"><AlertCircle className="w-3 h-3 mr-1" /> Suspended</Badge>;
      case 'rejected':
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getUnitLabel = (unit: string) => {
    switch (unit) {
      case 'per_sq_ft': return '/ sq. ft.';
      case 'per_panel': return '/ panel';
      case 'per_unit': return '/ unit';
      default: return '';
    }
  };

  const filteredContractors = contractors.filter(c => {
    const matchesSearch = 
      c.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: contractors.length,
    pending: contractors.filter(c => c.status === 'pending').length,
    approved: contractors.filter(c => c.status === 'approved').length,
    signed: contractors.filter(c => c.agreement_signed).length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-cyan-400 flex items-center gap-2">
            <HardHat className="w-6 h-6" />
            Contractor Management
          </h2>
          <p className="text-muted-foreground">Manage subcontractor profiles, services, and agreements</p>
        </div>
        <Button onClick={loadContractors} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-cyan-500/10 to-transparent border-cyan-500/30">
          <CardContent className="pt-4">
            <div className="text-3xl font-bold text-cyan-400">{stats.total}</div>
            <p className="text-sm text-muted-foreground">Total Contractors</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-500/10 to-transparent border-yellow-500/30">
          <CardContent className="pt-4">
            <div className="text-3xl font-bold text-yellow-400">{stats.pending}</div>
            <p className="text-sm text-muted-foreground">Pending Review</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-transparent border-green-500/30">
          <CardContent className="pt-4">
            <div className="text-3xl font-bold text-green-400">{stats.approved}</div>
            <p className="text-sm text-muted-foreground">Approved</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/30">
          <CardContent className="pt-4">
            <div className="text-3xl font-bold text-blue-400">{stats.signed}</div>
            <p className="text-sm text-muted-foreground">Agreements Signed</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-cyan-500/20">
        <CardContent className="pt-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search contractors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Contractors Table */}
      <Card className="border-cyan-500/20">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-cyan-500/20">
                  <TableHead>Company</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Agreement</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContractors.map((contractor) => (
                  <TableRow key={contractor.id} className="border-cyan-500/10">
                    <TableCell>
                      <div className="font-medium">{contractor.company_name}</div>
                      <div className="text-xs text-muted-foreground">{contractor.email}</div>
                    </TableCell>
                    <TableCell>
                      <div>{contractor.contact_name}</div>
                      <div className="text-xs text-muted-foreground">{contractor.phone}</div>
                    </TableCell>
                    <TableCell>
                      {contractor.address_city}, {contractor.address_state}
                    </TableCell>
                    <TableCell>{getStatusBadge(contractor.status)}</TableCell>
                    <TableCell>
                      {contractor.agreement_signed ? (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          <FileText className="w-3 h-3 mr-1" /> Signed
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          Not Signed
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(contractor.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => loadContractorDetails(contractor)}
                      >
                        <Eye className="w-4 h-4 mr-1" /> View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredContractors.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No contractors found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Contractor Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-cyan-400" />
              {selectedContractor?.company_name}
            </DialogTitle>
          </DialogHeader>

          {selectedContractor && (
            <Tabs defaultValue="profile" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="services">Services ({contractorServices.length})</TabsTrigger>
                <TabsTrigger value="licenses">Licenses ({contractorLicenses.length})</TabsTrigger>
                <TabsTrigger value="actions">Actions</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Company:</span>
                      <span className="font-medium">{selectedContractor.company_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium">{selectedContractor.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Phone:</span>
                      <span className="font-medium">{selectedContractor.phone || '-'}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Location:</span>
                      <span className="font-medium">{selectedContractor.address_city}, {selectedContractor.address_state}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Experience:</span>
                      <span className="font-medium">{selectedContractor.years_experience || '-'} years</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Agreement:</span>
                      {selectedContractor.agreement_signed ? (
                        <span className="text-green-400">Signed {new Date(selectedContractor.agreement_signed_at).toLocaleDateString()}</span>
                      ) : (
                        <span className="text-yellow-400">Not Signed</span>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="services" className="space-y-4">
                {contractorServices.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No services configured</p>
                ) : (
                  <div className="space-y-2">
                    {contractorServices.map((service) => (
                      <div key={service.id} className="p-3 rounded-lg border border-cyan-500/20 bg-cyan-500/5">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{service.service_name}</p>
                            <p className="text-xs text-muted-foreground">{service.service_category}</p>
                          </div>
                          <div className="text-right">
                            {service.labor_price && (
                              <p className="text-sm">
                                Labor: <span className="text-cyan-400 font-medium">${service.labor_price}{getUnitLabel(service.price_unit)}</span>
                              </p>
                            )}
                            {service.with_materials_price && (
                              <p className="text-sm">
                                W/ Materials: <span className="text-green-400 font-medium">${service.with_materials_price}{getUnitLabel(service.price_unit)}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="licenses" className="space-y-4">
                {contractorLicenses.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No licenses uploaded</p>
                ) : (
                  <div className="space-y-2">
                    {contractorLicenses.map((license) => (
                      <div key={license.id} className="p-3 rounded-lg border border-cyan-500/20 bg-cyan-500/5">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{license.license_type}</p>
                            <p className="text-sm text-muted-foreground">
                              #{license.license_number} • {license.issuing_authority}
                            </p>
                            {license.expiration_date && (
                              <p className="text-xs text-muted-foreground">
                                Expires: {new Date(license.expiration_date).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {license.is_verified ? (
                              <Badge className="bg-green-500/20 text-green-400">
                                <CheckCircle className="w-3 h-3 mr-1" /> Verified
                              </Badge>
                            ) : (
                              <Button size="sm" variant="outline" onClick={() => verifyLicense(license.id)}>
                                <Shield className="w-3 h-3 mr-1" /> Verify
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="actions" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Update Status</CardTitle>
                    <CardDescription>Change the contractor's account status</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        variant={selectedContractor.status === 'approved' ? 'default' : 'outline'}
                        onClick={() => updateContractorStatus(selectedContractor.id, 'approved')}
                        className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border-green-500/30"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" /> Approve
                      </Button>
                      <Button 
                        variant={selectedContractor.status === 'pending' ? 'default' : 'outline'}
                        onClick={() => updateContractorStatus(selectedContractor.id, 'pending')}
                        className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border-yellow-500/30"
                      >
                        <Clock className="w-4 h-4 mr-2" /> Set Pending
                      </Button>
                      <Button 
                        variant={selectedContractor.status === 'suspended' ? 'default' : 'outline'}
                        onClick={() => updateContractorStatus(selectedContractor.id, 'suspended')}
                        className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-500/30"
                      >
                        <AlertCircle className="w-4 h-4 mr-2" /> Suspend
                      </Button>
                      <Button 
                        variant={selectedContractor.status === 'rejected' ? 'default' : 'outline'}
                        onClick={() => updateContractorStatus(selectedContractor.id, 'rejected')}
                        className="bg-gray-500/20 hover:bg-gray-500/30 text-gray-400 border-gray-500/30"
                      >
                        <XCircle className="w-4 h-4 mr-2" /> Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminContractorManagement;