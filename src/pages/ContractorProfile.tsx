import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  HardHat, FileText, DollarSign, Upload, CheckCircle, Clock, 
  AlertCircle, Building2, Shield, Wrench, Save
} from 'lucide-react';
import ContractorAgreement from '@/components/ContractorAgreement';

interface Service {
  id?: string;
  service_category: string;
  service_name: string;
  labor_price: number | null;
  with_materials_price: number | null;
  price_unit: string;
  is_active: boolean;
}

interface License {
  id?: string;
  license_type: string;
  license_number: string;
  issuing_authority: string;
  expiration_date: string;
  document_url?: string;
  is_verified: boolean;
}

const SERVICE_CATEGORIES = [
  { category: 'Pool Installation', services: [
    { name: 'Fiberglass Pool Installation', unit: 'per_sq_ft' },
    { name: 'Concrete Pool Installation with Reinforce', unit: 'per_sq_ft' },
    { name: 'Concrete Installation (General)', unit: 'per_sq_ft' },
  ]},
  { category: 'Trades', services: [
    { name: 'Plumbing Services', unit: 'flat' },
    { name: 'Electrical Services', unit: 'flat' },
  ]},
  { category: 'Finishing', services: [
    { name: 'Paver Installation', unit: 'per_sq_ft' },
    { name: 'Pool Tile Installation', unit: 'per_sq_ft' },
    { name: 'Mosaic Installation (Pool/Decorative)', unit: 'per_sq_ft' },
  ]},
  { category: 'Structures', services: [
    { name: 'Screen Enclosure Installation', unit: 'flat' },
    { name: 'Sauna Installation', unit: 'flat' },
  ]},
  { category: 'Other Services', services: [
    { name: 'Landscaping Services', unit: 'flat' },
    { name: 'Solar Panel Installation', unit: 'per_panel' },
    { name: 'Air Conditioner Installation (Pool/Patio HVAC)', unit: 'per_unit' },
    { name: 'Excavation/Digging', unit: 'flat' },
    { name: 'Site Cleaning / Dumping', unit: 'flat' },
  ]},
];

const ContractorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [contractor, setContractor] = useState<any>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [customServices, setCustomServices] = useState<Service[]>([]);
  const [showAgreement, setShowAgreement] = useState(false);

  useEffect(() => {
    if (id) {
      loadContractorData();
    }
  }, [id]);

  const loadContractorData = async () => {
    try {
      const { data: contractorData, error: contractorError } = await supabase
        .from('contractors')
        .select('*')
        .eq('id', id)
        .single();

      if (contractorError) throw contractorError;
      setContractor(contractorData);

      const { data: servicesData } = await supabase
        .from('contractor_services')
        .select('*')
        .eq('contractor_id', id);

      if (servicesData) {
        const standardServices: Service[] = [];
        const custom: Service[] = [];
        
        servicesData.forEach(s => {
          const isStandard = SERVICE_CATEGORIES.some(cat => 
            cat.services.some(svc => svc.name === s.service_name)
          );
          if (isStandard) {
            standardServices.push(s as Service);
          } else {
            custom.push(s as Service);
          }
        });
        
        setServices(standardServices);
        setCustomServices(custom);
      }

      const { data: licensesData } = await supabase
        .from('contractor_licenses')
        .select('*')
        .eq('contractor_id', id);

      if (licensesData) {
        setLicenses(licensesData as License[]);
      }
    } catch (error: any) {
      toast({
        title: "Error Loading Profile",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleServiceToggle = (serviceName: string, category: string, unit: string) => {
    const existing = services.find(s => s.service_name === serviceName);
    if (existing) {
      setServices(services.filter(s => s.service_name !== serviceName));
    } else {
      setServices([...services, {
        service_category: category,
        service_name: serviceName,
        labor_price: null,
        with_materials_price: null,
        price_unit: unit,
        is_active: true
      }]);
    }
  };

  const handleServicePriceChange = (serviceName: string, field: 'labor_price' | 'with_materials_price', value: string) => {
    setServices(services.map(s => 
      s.service_name === serviceName 
        ? { ...s, [field]: value ? parseFloat(value) : null }
        : s
    ));
  };

  const addCustomService = () => {
    setCustomServices([...customServices, {
      service_category: 'Custom',
      service_name: '',
      labor_price: null,
      with_materials_price: null,
      price_unit: 'flat',
      is_active: true
    }]);
  };

  const updateCustomService = (index: number, field: string, value: any) => {
    const updated = [...customServices];
    updated[index] = { ...updated[index], [field]: value };
    setCustomServices(updated);
  };

  const removeCustomService = (index: number) => {
    setCustomServices(customServices.filter((_, i) => i !== index));
  };

  const addLicense = () => {
    setLicenses([...licenses, {
      license_type: '',
      license_number: '',
      issuing_authority: '',
      expiration_date: '',
      is_verified: false
    }]);
  };

  const updateLicense = (index: number, field: string, value: any) => {
    const updated = [...licenses];
    updated[index] = { ...updated[index], [field]: value };
    setLicenses(updated);
  };

  const removeLicense = (index: number) => {
    setLicenses(licenses.filter((_, i) => i !== index));
  };

  const handleSaveServices = async () => {
    setSaving(true);
    try {
      // Delete existing services
      await supabase
        .from('contractor_services')
        .delete()
        .eq('contractor_id', id);

      // Insert all services
      const allServices = [...services, ...customServices.filter(s => s.service_name)];
      if (allServices.length > 0) {
        const { error } = await supabase
          .from('contractor_services')
          .insert(allServices.map(s => ({
            contractor_id: id,
            service_category: s.service_category,
            service_name: s.service_name,
            labor_price: s.labor_price,
            with_materials_price: s.with_materials_price,
            price_unit: s.price_unit,
            is_active: s.is_active
          })));

        if (error) throw error;
      }

      toast({
        title: "Services Saved",
        description: "Your service pricing has been updated.",
      });
    } catch (error: any) {
      toast({
        title: "Error Saving Services",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveLicenses = async () => {
    setSaving(true);
    try {
      // Delete existing licenses
      await supabase
        .from('contractor_licenses')
        .delete()
        .eq('contractor_id', id);

      // Insert all licenses
      const validLicenses = licenses.filter(l => l.license_type);
      if (validLicenses.length > 0) {
        const { error } = await supabase
          .from('contractor_licenses')
          .insert(validLicenses.map(l => ({
            contractor_id: id,
            license_type: l.license_type,
            license_number: l.license_number,
            issuing_authority: l.issuing_authority,
            expiration_date: l.expiration_date || null,
            document_url: l.document_url,
            is_verified: false
          })));

        if (error) throw error;
      }

      toast({
        title: "Licenses Saved",
        description: "Your license information has been updated.",
      });
    } catch (error: any) {
      toast({
        title: "Error Saving Licenses",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAgreementSigned = () => {
    setShowAgreement(false);
    loadContractorData();
    toast({
      title: "Agreement Signed",
      description: "Your subcontractor agreement has been signed and submitted.",
    });
  };

  const getUnitLabel = (unit: string) => {
    switch (unit) {
      case 'per_sq_ft': return '/ sq. ft.';
      case 'per_panel': return '/ panel';
      case 'per_unit': return '/ unit';
      default: return '';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30"><CheckCircle className="w-3 h-3 mr-1" /> Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30"><Clock className="w-3 h-3 mr-1" /> Pending Review</Badge>;
      case 'suspended':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30"><AlertCircle className="w-3 h-3 mr-1" /> Suspended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!contractor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Contractor Not Found</h2>
            <p className="text-muted-foreground mb-4">This contractor profile doesn't exist or you don't have access.</p>
            <Button onClick={() => navigate('/contractor-registration')}>Register as Contractor</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showAgreement) {
    return (
      <ContractorAgreement 
        contractorId={id!} 
        contractorName={contractor.contact_name}
        companyName={contractor.company_name}
        onSigned={handleAgreementSigned}
        onCancel={() => setShowAgreement(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <HardHat className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{contractor.company_name}</h1>
                <p className="text-muted-foreground">{contractor.contact_name}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {getStatusBadge(contractor.status)}
            {!contractor.agreement_signed && (
              <Button onClick={() => setShowAgreement(true)}>
                <FileText className="w-4 h-4 mr-2" /> Sign Agreement
              </Button>
            )}
          </div>
        </div>

        {/* Agreement Alert */}
        {!contractor.agreement_signed && (
          <Card className="mb-6 border-yellow-500/30 bg-yellow-500/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-yellow-500 shrink-0" />
                <div>
                  <h3 className="font-semibold text-yellow-500 mb-1">Agreement Required</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    You must sign the Subcontractor Agreement before you can receive job assignments. 
                    Please review and sign the agreement to complete your registration.
                  </p>
                  <Button size="sm" onClick={() => setShowAgreement(true)}>
                    Review & Sign Agreement
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="services" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="services" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" /> Service Pricing
            </TabsTrigger>
            <TabsTrigger value="licenses" className="flex items-center gap-2">
              <Shield className="w-4 h-4" /> Licenses
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" /> Company Info
            </TabsTrigger>
          </TabsList>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Service Categories & Pricing</CardTitle>
                <CardDescription>
                  Select the services you offer and set your pricing. Check the services you provide and enter labor-only prices. 
                  If you can provide materials, also enter your with-materials price.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {SERVICE_CATEGORIES.map((category) => (
                  <div key={category.category}>
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <Wrench className="w-5 h-5 text-primary" />
                      {category.category}
                    </h3>
                    <div className="space-y-4">
                      {category.services.map((service) => {
                        const selectedService = services.find(s => s.service_name === service.name);
                        const isSelected = !!selectedService;

                        return (
                          <div key={service.name} className={`p-4 rounded-lg border ${isSelected ? 'border-primary/50 bg-primary/5' : 'border-border'}`}>
                            <div className="flex items-start gap-4">
                              <Checkbox 
                                checked={isSelected}
                                onCheckedChange={() => handleServiceToggle(service.name, category.category, service.unit)}
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <Label className="font-medium">{service.name}</Label>
                                {isSelected && (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                                    <div className="space-y-1">
                                      <Label className="text-xs text-muted-foreground">Labor Only Price</Label>
                                      <div className="flex items-center gap-2">
                                        <span className="text-muted-foreground">$</span>
                                        <Input
                                          type="number"
                                          step="0.01"
                                          placeholder="0.00"
                                          value={selectedService?.labor_price || ''}
                                          onChange={(e) => handleServicePriceChange(service.name, 'labor_price', e.target.value)}
                                          className="max-w-32"
                                        />
                                        <span className="text-sm text-muted-foreground">{getUnitLabel(service.unit)}</span>
                                      </div>
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-xs text-muted-foreground">With Materials Price</Label>
                                      <div className="flex items-center gap-2">
                                        <span className="text-muted-foreground">$</span>
                                        <Input
                                          type="number"
                                          step="0.01"
                                          placeholder="0.00"
                                          value={selectedService?.with_materials_price || ''}
                                          onChange={(e) => handleServicePriceChange(service.name, 'with_materials_price', e.target.value)}
                                          className="max-w-32"
                                        />
                                        <span className="text-sm text-muted-foreground">{getUnitLabel(service.unit)}</span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Custom Services */}
                <div>
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-primary" />
                    Other Services
                  </h3>
                  <div className="space-y-4">
                    {customServices.map((service, index) => (
                      <div key={index} className="p-4 rounded-lg border border-primary/50 bg-primary/5">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="md:col-span-2">
                            <Label className="text-xs text-muted-foreground">Service Name</Label>
                            <Input
                              placeholder="Specify service..."
                              value={service.service_name}
                              onChange={(e) => updateCustomService(index, 'service_name', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Labor Price</Label>
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">$</span>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={service.labor_price || ''}
                                onChange={(e) => updateCustomService(index, 'labor_price', e.target.value ? parseFloat(e.target.value) : null)}
                              />
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">With Materials</Label>
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">$</span>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={service.with_materials_price || ''}
                                onChange={(e) => updateCustomService(index, 'with_materials_price', e.target.value ? parseFloat(e.target.value) : null)}
                              />
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="mt-2 text-destructive" onClick={() => removeCustomService(index)}>
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" onClick={addCustomService}>
                      + Add Custom Service
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <Button onClick={handleSaveServices} disabled={saving}>
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Services'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Licenses Tab */}
          <TabsContent value="licenses" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Licenses & Certifications</CardTitle>
                <CardDescription>
                  Add your professional licenses and certifications. Specialty trades (electrical, HVAC, plumbing) 
                  require valid state licenses.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {licenses.map((license, index) => (
                  <div key={index} className="p-4 rounded-lg border">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">License Type</Label>
                        <Input
                          placeholder="e.g., Electrical Contractor"
                          value={license.license_type}
                          onChange={(e) => updateLicense(index, 'license_type', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">License Number</Label>
                        <Input
                          placeholder="License #"
                          value={license.license_number}
                          onChange={(e) => updateLicense(index, 'license_number', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Issuing Authority</Label>
                        <Input
                          placeholder="e.g., FL DBPR"
                          value={license.issuing_authority}
                          onChange={(e) => updateLicense(index, 'issuing_authority', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Expiration Date</Label>
                        <Input
                          type="date"
                          value={license.expiration_date}
                          onChange={(e) => updateLicense(index, 'expiration_date', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        {license.is_verified ? (
                          <Badge className="bg-green-500/20 text-green-400">
                            <CheckCircle className="w-3 h-3 mr-1" /> Verified
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            <Clock className="w-3 h-3 mr-1" /> Pending Verification
                          </Badge>
                        )}
                      </div>
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => removeLicense(index)}>
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}

                <Button variant="outline" onClick={addLicense}>
                  + Add License
                </Button>

                <div className="flex justify-end pt-4 border-t">
                  <Button onClick={handleSaveLicenses} disabled={saving}>
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Licenses'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>Your registered business information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-muted-foreground text-sm">Company Name</Label>
                    <p className="font-medium">{contractor.company_name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-sm">Contact Name</Label>
                    <p className="font-medium">{contractor.contact_name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-sm">Email</Label>
                    <p className="font-medium">{contractor.email}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-sm">Phone</Label>
                    <p className="font-medium">{contractor.phone || '-'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-muted-foreground text-sm">Address</Label>
                    <p className="font-medium">
                      {contractor.address_street && `${contractor.address_street}, `}
                      {contractor.address_city && `${contractor.address_city}, `}
                      {contractor.address_state} {contractor.address_zip}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-sm">Tax ID</Label>
                    <p className="font-medium">{contractor.tax_id || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-sm">Years of Experience</Label>
                    <p className="font-medium">{contractor.years_experience || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-sm">Agreement Status</Label>
                    <p className="font-medium">
                      {contractor.agreement_signed ? (
                        <span className="text-green-500 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" /> Signed on {new Date(contractor.agreement_signed_at).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-yellow-500 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" /> Not Signed
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-sm">Member Since</Label>
                    <p className="font-medium">{new Date(contractor.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ContractorProfile;