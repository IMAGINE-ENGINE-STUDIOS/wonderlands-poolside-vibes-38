import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Phone, Mail, Printer, Calendar, DollarSign, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { OptimizedImage } from '@/components/OptimizedImage';
import ImageCard from '@/components/ImageCard';
import poolHeaterImg from '@/assets/pool-heater.png';
import InvoiceGenerator from '@/components/InvoiceGenerator';

interface UserQuotation {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  pool_model: string;
  pool_category: string;
  pool_price?: number;
  total_quote_amount: number;
  status: string;
  created_at: string;
  yard_size?: string;
  budget?: string;
  timeline?: string;
  deck_width?: string;
  selected_options?: any;
  recommendations?: string[];
  special_requests?: string;
  uploaded_image_url?: string;
  processed_image_url?: string;
}

const QuoteDetailPage = () => {
  const { quoteId } = useParams<{ quoteId: string }>();
  const navigate = useNavigate();
  const [quote, setQuote] = useState<UserQuotation | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInvoiceGenerator, setShowInvoiceGenerator] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (quoteId) {
      fetchQuote();
    }
  }, [quoteId]);

  const fetchQuote = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_quotations')
        .select('*')
        .eq('id', quoteId)
        .single();

      if (error) {
        throw error;
      }

      setQuote(data);
    } catch (error) {
      console.error('Error fetching quote:', error);
      toast({
        title: "Error",
        description: "Failed to fetch quote details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'contacted': return 'bg-blue-100 text-blue-800 border-blue-200';  
      case 'converted': return 'bg-green-100 text-green-800 border-green-200';
      case 'lost': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handlePrintQuote = () => {
    window.print();
  };

  const getIncludedItems = () => {
    if (quote?.recommendations && Array.isArray(quote.recommendations)) {
      return quote.recommendations.filter((item: string) => !item.startsWith("FREE"));
    }
    return [
      "Professional installation and setup",
      "Electrical connections and startup",
      "Water balancing and testing",
      "30-day warranty on installation",
      "Operator training and documentation"
    ];
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Quote Not Found</h2>
            <p className="text-muted-foreground mb-4">The requested quote could not be found.</p>
            <Button onClick={() => navigate('/admin')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Navigation Header */}
      <div className="mb-6 flex items-center justify-between print:hidden no-print">
        <Button
          variant="outline"
          onClick={() => navigate('/admin')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Quote Management
        </Button>
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(quote.status)}>
            {quote.status}
          </Badge>
          <Button onClick={handlePrintQuote} variant="outline">
            <Printer className="h-4 w-4 mr-2" />
            Print Quote
          </Button>
        </div>
      </div>

      {/* Quote Content - Exact match to SurveyQuoteTool format */}
      <div className="space-y-6 bg-white p-6" data-quote-content>
        <div className="bg-white border-2 border-orange-400 rounded-lg overflow-hidden">
          
          {/* Header with Logo */}
          <div className="bg-gradient-to-r from-orange-400 via-pink-400 to-teal-400 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <ImageCard 
                  src="/lovable-uploads/1c6556f8-0571-434d-a877-e5152aee1726.png" 
                  alt="Wonderlands Logo" 
                  className="h-16 w-16" 
                  enableZoom={false} 
                />
                <div>
                  <h1 className="text-2xl font-bold">POOL QUOTATION</h1>
                  <p className="text-orange-100">Your Dream Pool Awaits</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm">Quote Date: {new Date(quote.created_at).toLocaleDateString()}</p>
                <p className="text-sm">Valid for 30 days</p>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="p-6 bg-gradient-to-r from-orange-50 to-teal-50 dark:from-gray-800 dark:to-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-lg mb-3 text-orange-600">Customer Information</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Name:</span> {quote.name}</p>
                  <p><span className="font-medium">Email:</span> {quote.email}</p>
                  <p><span className="font-medium">Phone:</span> {quote.phone || 'Not provided'}</p>
                  <p><span className="font-medium">Property Address:</span> {quote.address}</p>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-3 text-teal-600">Contact Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-orange-500" />
                    <span>(407) 760-4873</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-teal-500" />
                    <span>sales@wonderlandsworld.com</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Business Hours: Mon-Fri 8AM-6PM, Sat 9AM-4PM
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Pool Details with Images */}
          <div className="p-6">
            <h3 className="font-bold text-xl mb-4 text-orange-600">Pool Specifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-orange-100 to-teal-100 dark:from-gray-800 dark:to-gray-700 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Pool Model: {quote.pool_model || 'N/A'}</h4>
                  <p className="text-sm">Category: {quote.pool_category || 'N/A'}</p>
                  <div className="flex justify-between mt-2 pt-2 border-t border-orange-200 dark:border-gray-600">
                    <span>Base Pool Price:</span>
                    <span className="font-semibold">${(quote.pool_price || 0).toLocaleString()}</span>
                  </div>
                </div>
                
                {/* Paver Deck Information */}
                <div className="bg-gradient-to-br from-teal-100 to-orange-100 dark:from-gray-700 dark:to-gray-800 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Paver Deck ({quote.deck_width || 3}ft Width)</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Standard 3-foot paver deck included in base price
                  </p>
                </div>

                {/* Project Details */}
                <div className="bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-700 dark:to-gray-800 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Project Details</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Yard Size:</span> {quote.yard_size || 'Not specified'}</p>
                    <p><span className="font-medium">Budget:</span> {quote.budget || 'Not specified'}</p>
                    <p><span className="font-medium">Timeline:</span> {quote.timeline || 'Not specified'}</p>
                  </div>
                </div>
              </div>
              
              <div>
                {/* Pool Image - Get from actual pool data if available */}
                <div className="mb-4">
                  {quote.pool_model ? (
                    <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 p-4 rounded-lg h-48 flex items-center justify-center border border-orange-200">
                      <div className="text-center">
                        <span className="text-gray-500 text-lg font-medium">{quote.pool_model}</span>
                        <p className="text-xs text-muted-foreground mt-1">Pool Design Preview</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 p-4 rounded-lg h-48 flex items-center justify-center border border-orange-200">
                      <span className="text-gray-500">Pool Image</span>
                    </div>
                  )}
                  <p className="text-xs text-center mt-1 text-muted-foreground">{quote.pool_model || 'Pool Model'}</p>
                </div>

                {/* Customer Uploaded Images */}
                {(quote.uploaded_image_url || quote.processed_image_url) && (
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2 text-teal-600">Property Photos</h4>
                    {quote.processed_image_url && (
                      <div className="mb-2">
                        <img 
                          src={quote.processed_image_url} 
                          alt="Processed property" 
                          className="w-full h-32 rounded-lg border border-teal-200 object-cover"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Selected Options with Images */}
            {quote.selected_options && Array.isArray(quote.selected_options) && quote.selected_options.length > 0 && (
              <div className="mb-6">
                <h4 className="font-bold text-lg mb-3 text-teal-600">Selected Features</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {quote.selected_options.map((option: any, index: number) => (
                    <div key={index} className="border border-orange-200 dark:border-gray-600 rounded-lg p-3 bg-gradient-to-br from-orange-50 to-teal-50 dark:from-gray-800 dark:to-gray-700">
                      {/* Add images for different types of features */}
                      {(() => {
                        // Screen enclosures
                        if (option.category === 'screen-enclosure') {
                          return (
                            <div className="mb-3">
                              <OptimizedImage 
                                src="/lovable-uploads/8bf11ea9-c402-4834-a163-0876545498bd.png" 
                                alt={option.name} 
                                className="w-full h-20 rounded-md border border-orange-200 object-cover"
                                sizeConfig="quoteImage"
                              />
                            </div>
                          );
                        }
                        // Pool heaters
                        if (option.name?.toLowerCase().includes('heater') || option.name?.toLowerCase().includes('heat pump')) {
                          return (
                            <div className="mb-3">
                              <img 
                                src={poolHeaterImg} 
                                alt={option.name} 
                                className="w-full h-20 rounded-md border border-orange-200 object-cover"
                              />
                            </div>
                          );
                        }
                        // Pool covers
                        if (option.name?.toLowerCase().includes('cover')) {
                          return (
                            <div className="mb-3">
                              <OptimizedImage 
                                src="/lovable-uploads/1fd97401-223a-4a79-bf65-e7734138513e.png" 
                                alt={option.name} 
                                className="w-full h-20 rounded-md border border-orange-200 object-cover"
                                sizeConfig="quoteImage"
                              />
                            </div>
                          );
                        }
                        // Spas
                        if (option.name?.toLowerCase().includes('spa')) {
                          return (
                            <div className="mb-3">
                              <OptimizedImage 
                                src="/lovable-uploads/46c5f140-bd7e-4a4d-9a19-1f15b078b899.png" 
                                alt={option.name} 
                                className="w-full h-20 rounded-md border border-orange-200 object-cover"
                                sizeConfig="quoteImage"
                              />
                            </div>
                          );
                        }
                        // Default feature icon
                        return null;
                      })()}
                      <h5 className="font-semibold text-sm">{option.name}</h5>
                      <p className="text-xs text-muted-foreground mb-2">{option.description}</p>
                      <div className="flex justify-between text-sm">
                        <span>Price:</span>
                        <span className="font-semibold text-teal-600">+${option.price?.toLocaleString() || '0'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Special Requests */}
            {quote.special_requests && (
              <div className="mb-6">
                <div className="bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-700 dark:to-gray-800 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-bold text-lg mb-2 text-blue-600">Special Requests</h4>
                  <p className="text-sm">{quote.special_requests}</p>
                </div>
              </div>
            )}

            {/* Items Included */}
            <div className="mb-6">
              <div className="bg-gradient-to-br from-teal-100 to-orange-100 dark:from-gray-700 dark:to-gray-800 p-6 rounded-lg">
                <h4 className="font-bold text-lg mb-3 text-orange-600">ALL POOLS INCLUDE</h4>
                <p className="text-sm">
                  {getIncludedItems().join(", ")}
                </p>
                <p className="text-xs mt-2 opacity-80">Architectural Design, Construction and permiting is included in all products, unless project scope is modified.</p>
              </div>
            </div>

            {/* Warranty Information */}
            <div className="mb-6">
              <div className="bg-gradient-to-br from-green-100 to-blue-100 dark:from-gray-700 dark:to-gray-800 p-4 rounded-lg border border-green-200">
                <h4 className="font-bold text-lg mb-2 text-green-600">Warranty & Status</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Quote Status:</span>
                    <Badge className={getStatusColor(quote.status)}>
                      {quote.status}
                    </Badge>
                  </div>
                  <p><span className="font-medium">Created:</span> {new Date(quote.created_at).toLocaleDateString()}</p>
                  <p className="font-semibold">Pool Structure: <span className="text-green-600">Lifetime Warranty</span></p>
                  <p className="text-xs text-muted-foreground">Standard structural warranty coverage</p>
                </div>
              </div>
            </div>

            {/* Estimated Build Time */}
            <div className="mb-6">
              <div className="bg-gradient-to-br from-blue-100 to-green-100 dark:from-gray-700 dark:to-gray-800 p-4 rounded-lg">
                <h4 className="font-bold text-lg mb-2 text-blue-600">Estimated Build Time</h4>
                <p className="text-sm">8+ weeks</p>
                <p className="text-xs mt-1 text-muted-foreground">
                  Fiber pool construction timeline includes delivery and installation
                </p>
              </div>
            </div>

            {/* Total Investment */}
            <div className="bg-gradient-to-r from-orange-500 via-pink-500 to-teal-500 p-6 rounded-lg text-white text-center">
              <h3 className="text-2xl font-bold mb-2">Total Investment</h3>
              <div className="text-4xl font-bold mb-2">${quote.total_quote_amount?.toLocaleString() || '0'}</div>
              <p className="text-orange-100">Complete installation including permits, excavation, and {quote.deck_width || 3}ft paver deck</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteDetailPage;