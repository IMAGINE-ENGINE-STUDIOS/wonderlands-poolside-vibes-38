import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Eye, Mail, Phone, MapPin, Calendar, DollarSign, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserQuotation {
  id: string;
  user_id?: string | null;
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
  selected_options?: any;
  recommendations?: string[];
  special_requests?: string;
}

const AdminQuotesManager = () => {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState<UserQuotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedQuote, setSelectedQuote] = useState<UserQuotation | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const { toast } = useToast();

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_quotations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setQuotes(data || []);
    } catch (error) {
      console.error('Error fetching quotes:', error);
      toast({
        title: "Error",
        description: "Failed to fetch quotes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = 
      quote.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.pool_model?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'contacted': return 'bg-blue-100 text-blue-800 border-blue-200';  
      case 'converted': return 'bg-green-100 text-green-800 border-green-200';
      case 'lost': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleViewQuote = (quote: UserQuotation) => {
    setSelectedQuote(quote);
    setIsDetailModalOpen(true);
  };

  const totalQuotes = quotes.length;
  const pendingQuotes = quotes.filter(q => q.status === 'pending').length;
  const convertedQuotes = quotes.filter(q => q.status === 'converted').length;
  const totalQuoteValue = quotes.reduce((sum, q) => sum + (q.total_quote_amount || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quote Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Quotes</p>
                <p className="text-2xl font-bold">{totalQuotes}</p>
              </div>
              <Calendar className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-amber-600">{pendingQuotes}</p>
              </div>
              <Search className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Converted</p>
                <p className="text-2xl font-bold text-green-600">{convertedQuotes}</p>
              </div>
              <Eye className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold text-primary">${totalQuoteValue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Pool Quotes Management</span>
            <div className="text-sm text-muted-foreground">
              Click "View Quote" to see the complete quote with all images
            </div>
          </CardTitle>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or pool model..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Pool Model</TableHead>
                <TableHead>Quote Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuotes.map((quote) => (
                <TableRow key={quote.id}>
                  <TableCell>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{quote.name}</p>
                        {!quote.user_id ? (
                          <Badge variant="outline" className="text-xs">Guest</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs bg-primary/10">Registered</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{quote.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{quote.pool_model || 'N/A'}</p>
                      <p className="text-sm text-muted-foreground">{quote.pool_category || ''}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-bold">
                    ${quote.total_quote_amount?.toLocaleString() || '0'}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(quote.status)}>
                      {quote.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(quote.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 justify-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewQuote(quote)}
                        title="Quick Preview"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/quotes/${quote.id}`)}
                        title="View Complete Quote with Images"
                        className="text-xs"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Full Quote
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredQuotes.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {quotes.length === 0 ? 'No quotes found' : 'No quotes match your search criteria'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quote Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Quote Details</DialogTitle>
          </DialogHeader>
          {selectedQuote && (
            <div className="space-y-6 bg-white p-6" data-quote-content>
              <div className="bg-white border-2 border-orange-400 rounded-lg overflow-hidden">
                
                {/* Header with Logo */}
                <div className="bg-gradient-to-r from-orange-400 via-pink-400 to-teal-400 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 bg-white rounded-lg flex items-center justify-center">
                        <span className="text-orange-400 font-bold text-sm">LOGO</span>
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold">POOL QUOTATION</h1>
                        <p className="text-orange-100">Your Dream Pool Awaits</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">Quote Date: {new Date(selectedQuote.created_at).toLocaleDateString()}</p>
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
                        <p><span className="font-medium">Name:</span> {selectedQuote.name}</p>
                        <p><span className="font-medium">Email:</span> {selectedQuote.email}</p>
                        <p><span className="font-medium">Phone:</span> {selectedQuote.phone || 'Not provided'}</p>
                        <p><span className="font-medium">Property Address:</span> {selectedQuote.address}</p>
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

                {/* Pool Details */}
                <div className="p-6">
                  <h3 className="font-bold text-xl mb-4 text-orange-600">Pool Specifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-4">
                      <div className="bg-gradient-to-br from-orange-100 to-teal-100 dark:from-gray-800 dark:to-gray-700 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Pool Model: {selectedQuote.pool_model || 'N/A'}</h4>
                        <p className="text-sm">Category: {selectedQuote.pool_category || 'N/A'}</p>
                        <div className="flex justify-between mt-2 pt-2 border-t border-orange-200 dark:border-gray-600">
                          <span>Base Pool Price:</span>
                          <span className="font-semibold">${(selectedQuote.pool_price || 0).toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Project Details */}
                      <div className="bg-gradient-to-br from-teal-100 to-orange-100 dark:from-gray-700 dark:to-gray-800 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Project Details</h4>
                        <div className="space-y-2 text-sm">
                          <p><span className="font-medium">Yard Size:</span> {selectedQuote.yard_size || 'Not specified'}</p>
                          <p><span className="font-medium">Budget:</span> {selectedQuote.budget || 'Not specified'}</p>
                          <p><span className="font-medium">Timeline:</span> {selectedQuote.timeline || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 p-4 rounded-lg h-48 flex items-center justify-center">
                        <span className="text-gray-500">Pool Image</span>
                      </div>
                    </div>
                  </div>

                  {/* Selected Options */}
                  {selectedQuote.selected_options && Array.isArray(selectedQuote.selected_options) && selectedQuote.selected_options.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-bold text-lg mb-3 text-teal-600">Selected Features</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {selectedQuote.selected_options.map((option: any, index: number) => (
                          <div key={index} className="border border-orange-200 dark:border-gray-600 rounded-lg p-3 bg-gradient-to-br from-orange-50 to-teal-50 dark:from-gray-800 dark:to-gray-700">
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
                  {selectedQuote.special_requests && (
                    <div className="mb-6">
                      <div className="bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-700 dark:to-gray-800 p-4 rounded-lg border border-blue-200">
                        <h4 className="font-bold text-lg mb-2 text-blue-600">Special Requests</h4>
                        <p className="text-sm">{selectedQuote.special_requests}</p>
                      </div>
                    </div>
                  )}

                  {/* Items Included */}
                  {selectedQuote.recommendations && selectedQuote.recommendations.length > 0 && (
                    <div className="mb-6">
                      <div className="bg-gradient-to-br from-teal-100 to-orange-100 dark:from-gray-700 dark:to-gray-800 p-6 rounded-lg">
                        <h4 className="font-bold text-lg mb-3 text-orange-600">ALL POOLS INCLUDE</h4>
                        <p className="text-sm">
                          {selectedQuote.recommendations.filter((item: string) => !item.startsWith("FREE")).join(", ")}
                        </p>
                        <p className="text-xs mt-2 opacity-80">Architectural Design, Construction and permiting is included in all products, unless project scope is modified.</p>
                      </div>
                    </div>
                  )}

                  {/* Quote Status */}
                  <div className="mb-6">
                    <div className="bg-gradient-to-br from-green-100 to-blue-100 dark:from-gray-700 dark:to-gray-800 p-4 rounded-lg border border-green-200">
                      <h4 className="font-bold text-lg mb-2 text-green-600">Quote Status</h4>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(selectedQuote.status)}>
                          {selectedQuote.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Created on {new Date(selectedQuote.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Total Investment */}
                  <div className="bg-gradient-to-r from-orange-500 via-pink-500 to-teal-500 p-6 rounded-lg text-white text-center">
                    <h3 className="text-2xl font-bold mb-2">Total Investment</h3>
                    <div className="text-4xl font-bold mb-2">${selectedQuote.total_quote_amount?.toLocaleString() || '0'}</div>
                    <p className="text-orange-100">Complete installation including permits, excavation, and paver deck</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminQuotesManager;