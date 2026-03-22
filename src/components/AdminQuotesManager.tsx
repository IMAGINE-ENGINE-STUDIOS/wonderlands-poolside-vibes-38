import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Eye, Mail, Phone, MapPin, Calendar, DollarSign, ExternalLink, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CustomerInvoice {
  id: string;
  invoice_number: string;
  total_amount: number;
  payment_status: string;
  status: string;
  invoice_date: string;
  due_date: string;
}

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
  const [customerInvoices, setCustomerInvoices] = useState<CustomerInvoice[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
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
      case 'pending': return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
      case 'contacted': return 'bg-blue-500/20 text-blue-300 border-blue-500/50';  
      case 'converted': return 'bg-green-500/20 text-green-300 border-green-500/50';
      case 'lost': return 'bg-red-500/20 text-red-300 border-red-500/50';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/50';
    }
  };

  const handleViewQuote = (quote: UserQuotation) => {
    setSelectedQuote(quote);
    setIsDetailModalOpen(true);
    fetchCustomerInvoices(quote.id, quote.email);
  };

  const fetchCustomerInvoices = async (quoteId: string, email: string) => {
    setInvoicesLoading(true);
    try {
      // Primary: fetch invoices linked by quotation_id (direct relationship)
      const { data: linkedInvoices, error: linkedError } = await supabase
        .from('invoices')
        .select('id, invoice_number, total_amount, payment_status, status, invoice_date, due_date, quotation_id')
        .eq('quotation_id', quoteId)
        .order('created_at', { ascending: false });

      if (linkedError) throw linkedError;

      // Fallback: if no direct link, match by email
      if (linkedInvoices && linkedInvoices.length > 0) {
        setCustomerInvoices(linkedInvoices);
      } else {
        const { data: emailInvoices, error: emailError } = await supabase
          .from('invoices')
          .select('id, invoice_number, total_amount, payment_status, status, invoice_date, due_date, quotation_id')
          .ilike('customer_email', email)
          .order('created_at', { ascending: false });

        if (emailError) throw emailError;
        setCustomerInvoices(emailInvoices || []);
      }
    } catch (error) {
      console.error('Error fetching customer invoices:', error);
      setCustomerInvoices([]);
    } finally {
      setInvoicesLoading(false);
    }
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
      {/* Quote Statistics - Command Center Style */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="holographic-panel rounded-lg p-4 relative overflow-hidden group hover:scale-105 transition-transform">
          <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/10 rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">Total</span>
              <Calendar className="h-5 w-5 text-cyan-400" />
            </div>
            <div className="text-3xl font-bold text-cyan-300 neon-glow-cyan">{totalQuotes}</div>
            <div className="h-1 w-full bg-cyan-900/30 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 data-stream"></div>
            </div>
          </div>
        </div>
        
        <div className="holographic-panel rounded-lg p-4 relative overflow-hidden group hover:scale-105 transition-transform">
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-amber-400 uppercase tracking-wider">Pending</span>
              <Search className="h-5 w-5 text-amber-400" />
            </div>
            <div className="text-3xl font-bold text-amber-300" style={{textShadow: '0 0 20px rgba(251, 191, 36, 0.6)'}}>{pendingQuotes}</div>
            <div className="h-1 w-full bg-amber-900/30 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 data-stream"></div>
            </div>
          </div>
        </div>
        
        <div className="holographic-panel rounded-lg p-4 relative overflow-hidden group hover:scale-105 transition-transform">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-green-400 uppercase tracking-wider">Converted</span>
              <Eye className="h-5 w-5 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-green-300" style={{textShadow: '0 0 20px rgba(34, 197, 94, 0.6)'}}>{convertedQuotes}</div>
            <div className="h-1 w-full bg-green-900/30 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 data-stream"></div>
            </div>
          </div>
        </div>
        
        <div className="holographic-panel rounded-lg p-4 relative overflow-hidden group hover:scale-105 transition-transform">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-blue-200 uppercase tracking-wider">Value</span>
              <DollarSign className="h-5 w-5 text-blue-200" />
            </div>
            <div className="text-2xl font-bold text-blue-100 neon-glow-blue">${totalQuoteValue.toLocaleString()}</div>
            <div className="h-1 w-full bg-blue-900/30 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 data-stream"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters - Command Center Style */}
      <div className="holographic-panel rounded-lg overflow-hidden">
        <div className="p-6 border-b border-cyan-500/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-cyan-300 font-mono tracking-wide uppercase neon-glow-cyan">⬡ Quote Database ⬡</h3>
            <p className="text-xs text-cyan-400/60 font-mono">
              Click "View Quote" for complete details with images
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-cyan-400" />
              <Input
                placeholder="SEARCH: NAME / EMAIL / POOL MODEL..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-black/40 border-cyan-500/30 text-cyan-300 placeholder:text-cyan-400/40 font-mono text-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 bg-black/40 border-cyan-500/30 text-cyan-300 font-mono text-sm">
                <SelectValue placeholder="FILTER STATUS" />
              </SelectTrigger>
              <SelectContent className="bg-black border-cyan-500/30">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-cyan-500/20 hover:bg-transparent">
                  <TableHead className="text-cyan-400 font-mono text-xs uppercase tracking-wider">Customer</TableHead>
                  <TableHead className="text-cyan-400 font-mono text-xs uppercase tracking-wider">Pool Model</TableHead>
                  <TableHead className="text-cyan-400 font-mono text-xs uppercase tracking-wider">Quote Amount</TableHead>
                  <TableHead className="text-cyan-400 font-mono text-xs uppercase tracking-wider">Status</TableHead>
                  <TableHead className="text-cyan-400 font-mono text-xs uppercase tracking-wider">Date</TableHead>
                  <TableHead className="text-center text-cyan-400 font-mono text-xs uppercase tracking-wider">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuotes.map((quote) => (
                  <TableRow key={quote.id} className="border-b border-cyan-500/10 hover:bg-cyan-500/5 transition-colors">
                    <TableCell>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-cyan-200">{quote.name}</p>
                          {!quote.user_id ? (
                            <Badge variant="outline" className="text-xs bg-gray-500/20 text-gray-300 border-gray-500/50 font-mono">GUEST</Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs bg-blue-500/20 text-blue-300 border-blue-500/50 font-mono">REG</Badge>
                          )}
                        </div>
                        <p className="text-sm text-cyan-400/60 font-mono">{quote.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-cyan-200">{quote.pool_model || 'N/A'}</p>
                        <p className="text-sm text-cyan-400/60 font-mono">{quote.pool_category || ''}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-blue-300 font-mono">
                      ${quote.total_quote_amount?.toLocaleString() || '0'}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(quote.status)} font-mono text-xs uppercase`}>
                        {quote.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-cyan-400/80 font-mono text-sm">
                      {new Date(quote.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 justify-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewQuote(quote)}
                          title="Quick Preview"
                          className="hover:bg-cyan-500/10 text-cyan-400"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/admin/quotes/${quote.id}`)}
                          title="View Complete Quote with Images"
                          className="text-xs bg-black/40 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 font-mono"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          FULL
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredQuotes.length === 0 && (
            <div className="text-center py-8 text-cyan-400/60 font-mono">
              {quotes.length === 0 ? 'NO QUOTES FOUND' : 'NO QUOTES MATCH SEARCH CRITERIA'}
            </div>
          )}
        </div>
      </div>

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

                  {/* Customer Invoices Section */}
                  <div className="mt-6">
                    <h4 className="font-bold text-lg mb-3 text-blue-600 flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Customer Invoices
                    </h4>
                    {invoicesLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                      </div>
                    ) : customerInvoices.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-3">No invoices found for this customer.</p>
                    ) : (
                      <div className="space-y-2">
                        {customerInvoices.map((inv) => (
                          <div
                            key={inv.id}
                            className="flex items-center justify-between p-3 rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-colors cursor-pointer"
                            onClick={() => navigate(`/admin/invoices/${inv.id}`)}
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="h-4 w-4 text-blue-500" />
                              <div>
                                <p className="font-medium text-sm">{inv.invoice_number}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(inv.invoice_date).toLocaleDateString()} • Due: {new Date(inv.due_date).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge className={
                                inv.payment_status === 'paid'
                                  ? 'bg-green-100 text-green-700 border-green-300'
                                  : inv.payment_status === 'partial'
                                  ? 'bg-amber-100 text-amber-700 border-amber-300'
                                  : 'bg-red-100 text-red-700 border-red-300'
                              }>
                                {inv.payment_status}
                              </Badge>
                              <span className="font-bold text-sm">${inv.total_amount?.toLocaleString()}</span>
                              <ExternalLink className="h-3 w-3 text-blue-400" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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