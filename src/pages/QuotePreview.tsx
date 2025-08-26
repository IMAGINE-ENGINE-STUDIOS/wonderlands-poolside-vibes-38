
import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FileText, Download, Printer } from "lucide-react";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ImageCard from "@/components/ImageCard";

interface QuoteCustomer {
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

interface QuotePayload {
  type: string;
  pool?: any;
  spa?: any;
  product?: any;
  extras?: any;
  customer?: QuoteCustomer;
}

const QuotePreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [payload, setPayload] = useState<QuotePayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [customerForm, setCustomerForm] = useState<QuoteCustomer>({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [showCustomerForm, setShowCustomerForm] = useState(false);

  const readPayload = useCallback(() => {
    try {
      if (!id) {
        console.log('No quote ID provided');
        return null;
      }
      
      console.log('Reading quote data for ID:', id);
      const raw = sessionStorage.getItem(`quote:${id}`);
      
      if (!raw) {
        console.log('No quote data found in sessionStorage for ID:', id);
        return null;
      }
      
      const parsed = JSON.parse(raw) as QuotePayload;
      console.log('Successfully parsed quote data:', parsed);
      return parsed;
    } catch (error) {
      console.error('Error reading quote payload:', error);
      return null;
    }
  }, [id]);

  useEffect(() => {
    setIsLoading(true);
    const data = readPayload();
    setPayload(data);
    setIsLoading(false);
    
    if (data && data.customer) {
      setCustomerForm(data.customer);
    } else if (data) {
      setShowCustomerForm(true);
    }
  }, [readPayload]);

  useEffect(() => {
    document.title = `Quote Preview ${id ? `#${id}` : ""}`;
  }, [id]);

  const handleCustomerSave = () => {
    if (!payload || !customerForm.name || !customerForm.email) return;
    
    const updatedPayload = { ...payload, customer: customerForm };
    sessionStorage.setItem(`quote:${id}`, JSON.stringify(updatedPayload));
    setPayload(updatedPayload);
    setShowCustomerForm(false);
  };

  const handlePrint = () => window.print();
  const handleDownload = () => window.print(); // Allows user to "Save as PDF"
  const handleBack = () => navigate(-1);

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;

  const collectAddedFeatures = () => {
    if (!payload) return [];
    
    const features: any[] = [];
    
    // Collect from extras
    if (payload.extras) {
      // Handle different structures of extras
      const extrasData = payload.extras.items || payload.extras.selected || payload.extras;
      
      if (Array.isArray(extrasData)) {
        features.push(...extrasData);
      } else if (typeof extrasData === 'object') {
        // Handle extras object structure
        Object.entries(extrasData).forEach(([key, value]: [string, any]) => {
          if (value && typeof value === 'object' && value.enabled) {
            features.push({
              name: key.charAt(0).toUpperCase() + key.slice(1),
              price: value.price || 0,
              image: value.image,
              ...value
            });
          } else if (value === true) {
            // Handle boolean flags
            const prices: Record<string, number> = {
              automaticCover: 5000,
              heater: 3000,
              spa: 8000,
              tanningLedge: 4000
            };
            features.push({
              name: key.charAt(0).toUpperCase() + key.slice(1),
              price: prices[key] || 0
            });
          }
        });
      }
    }

    // Add spa if present
    if (payload.spa) {
      features.push({
        name: payload.spa.model || payload.spa.name || "Spa",
        price: payload.spa.price || 0,
        image: payload.spa.image
      });
    }

    return features;
  };

  const calculateTotals = () => {
    const basePrice = payload?.pool?.price || 0;
    const features = collectAddedFeatures();
    const featuresTotal = features.reduce((sum, feature) => sum + (feature.price || 0), 0);
    const total = basePrice + featuresTotal;
    
    return { basePrice, featuresTotal, total, features };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="pt-20 container mx-auto px-4 flex-1">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading quote...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!payload) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="pt-20 container mx-auto px-4 flex-1">
          <section className="rounded-lg border bg-card text-card-foreground shadow-lg p-6 md:p-8">
            <div className="text-center text-muted-foreground py-12">
              <FileText size={64} className="mx-auto mb-4 text-primary/50" />
              <h2 className="text-xl font-semibold mb-2 text-foreground">Quote Not Found</h2>
              <p className="text-lg mb-4">No quote data found for this session.</p>
              <Button onClick={handleBack} variant="default">
                Go Back to Products
              </Button>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  if (showCustomerForm) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="pt-20 container mx-auto px-4 flex-1">
          <section className="rounded-lg border bg-card text-card-foreground shadow-lg p-6 md:p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Customer Information Required</h2>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={customerForm.name}
                    onChange={(e) => setCustomerForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerForm.email}
                    onChange={(e) => setCustomerForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="name@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={customerForm.phone}
                    onChange={(e) => setCustomerForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(XXX) XXX-XXXX"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Property Address</Label>
                  <Input
                    id="address"
                    value={customerForm.address}
                    onChange={(e) => setCustomerForm(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Street, City, State"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button 
                  onClick={handleCustomerSave}
                  disabled={!customerForm.name || !customerForm.email}
                >
                  Continue to Quote
                </Button>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  const { basePrice, featuresTotal, total, features } = calculateTotals();

  return (
    <div className="min-h-screen flex flex-col">
      <main className="pt-20 container mx-auto px-4 flex-1">
        <div className="flex justify-end gap-2 mb-4 print:hidden">
          <Button onClick={handleDownload} variant="default">
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          <Button onClick={handlePrint} variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button onClick={handleBack} variant="ghost">Go Back</Button>
        </div>

        <section className="rounded-lg border bg-card text-card-foreground shadow-lg p-6 md:p-8">
          {/* Header with Wonderlands Logo and Quote Info */}
          <div className="bg-gradient-to-r from-orange-400 via-orange-500 to-teal-500 rounded-xl p-6 md:p-8 text-white mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 bg-white rounded-lg flex items-center justify-center">
                  <img 
                    src="/lovable-uploads/0491db41-90e0-48c5-ba33-3772268815aa.png" 
                    alt="Wonderlands" 
                    className="w-20 h-20 object-contain"
                    style={{ width: '1in', height: '1in' }}
                  />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold">POOL QUOTATION</h1>
                  <p className="text-white/90">Your Dream Pool Awaits</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold">Quote Date: {new Date().toLocaleDateString()}</p>
                <p className="text-white/90">Valid for 30 days</p>
              </div>
            </div>
          </div>

          {/* Customer and Contact Information */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-orange-50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-orange-600 mb-4">Customer Information</h3>
              <div className="space-y-2">
                <p><span className="font-semibold">Name:</span> {payload.customer?.name || "-"}</p>
                <p><span className="font-semibold">Email:</span> {payload.customer?.email || "-"}</p>
                <p><span className="font-semibold">Phone:</span> {payload.customer?.phone || "-"}</p>
                <p><span className="font-semibold">Property Address:</span> {payload.customer?.address || "-"}</p>
              </div>
            </div>
            
            <div className="bg-teal-50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-teal-600 mb-4">Contact Information</h3>
              <div className="space-y-2 text-gray-700">
                <p className="flex items-center gap-2">
                  <span className="text-orange-500">📞</span>
                  (407) 760-4873
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-teal-500">📧</span>
                  sales@wonderlandsworld.com
                </p>
                <p className="text-sm">Business Hours: Mon–Fri 8AM–6PM, Sat 9AM–4PM</p>
              </div>
            </div>
          </div>

          {/* Pool Specifications */}
          {payload.pool && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-orange-600 mb-6">Pool Specifications</h2>
              
              <div className="grid md:grid-cols-2 gap-6 items-start">
                <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold mb-4">Pool Model: {payload.pool.model}</h3>
                  <div className="space-y-2 text-gray-700">
                    <p>Dimensions: {payload.pool.dimensions || "Custom"}</p>
                    <p>Depth: {payload.pool.depth || "3' 6\" – 5'"}</p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-lg font-semibold">Base Pool Price:</p>
                    <p className="text-3xl font-bold text-green-600">{formatCurrency(basePrice)}</p>
                  </div>
                </div>
                
                <div className="rounded-xl overflow-hidden border">
                  <div className="aspect-video bg-gray-100">
                    <ImageCard
                      src={payload.pool.image}
                      alt={payload.pool.model}
                      className="w-full h-full"
                      enableZoom={false}
                    />
                  </div>
                  <div className="p-3 text-center font-semibold text-gray-700">
                    {payload.pool.model}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Added Features */}
          {features.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-orange-600 mb-6">Added Features from Product Card</h2>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature, index) => (
                  <div key={index} className="bg-white rounded-lg border shadow-sm p-4">
                    <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                      <ImageCard
                        src={feature.image || "/lovable-uploads/0491db41-90e0-48c5-ba33-3772268815aa.png"}
                        alt={feature.name}
                        className="w-full h-full"
                        enableZoom={false}
                      />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">{feature.name}</h4>
                    {feature.description && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{feature.description}</p>
                    )}
                    <p className="text-right font-bold text-green-600">
                      Price: +{formatCurrency(feature.price || 0)}
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 text-right">
                <p className="text-lg font-semibold">
                  Total Added Features: <span className="text-green-600">{formatCurrency(featuresTotal)}</span>
                </p>
              </div>
            </div>
          )}

          {/* All Pools Include */}
          <div className="bg-gradient-to-r from-teal-50 to-green-50 rounded-xl p-6 mb-8">
            <h3 className="text-xl font-bold text-orange-600 mb-2">ALL POOLS INCLUDE</h3>
            <p className="text-gray-800 font-medium">LED lights, Water pump, Waterfall, Salt system</p>
            <p className="text-sm text-gray-600 mt-1">FREE Finish of choice (included in pool price - promotional offer)</p>
          </div>

          {/* Total Investment */}
          <div className="bg-gradient-to-r from-orange-400 via-orange-500 to-teal-500 rounded-2xl p-8 text-white text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Total Investment</h2>
            <p className="text-5xl md:text-6xl font-extrabold mb-4">{formatCurrency(total)}</p>
            <p className="text-lg opacity-90">Complete installation including permits, excavation, and all selected features</p>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-600 border-t pt-6">
            <p className="mb-1">This quote is valid for 30 days from the date of issue.</p>
            <p>Final pricing may vary based on site conditions and customization options.</p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default QuotePreview;
