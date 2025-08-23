import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Eye, Mail, Phone, MapPin, Calendar, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserQuotation {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  pool_model: string;
  pool_category: string;
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
          <CardTitle>Pool Quotes Management</CardTitle>
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
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuotes.map((quote) => (
                <TableRow key={quote.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{quote.name}</p>
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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewQuote(quote)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
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
            <div className="space-y-6">
              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-medium">{selectedQuote.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{selectedQuote.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{selectedQuote.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="font-medium">{selectedQuote.address}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quote Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Quote Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Pool Model</p>
                      <p className="font-medium">{selectedQuote.pool_model || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Category</p>
                      <p className="font-medium">{selectedQuote.pool_category || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Quote Amount</p>
                      <p className="font-medium text-primary text-xl">
                        ${selectedQuote.total_quote_amount?.toLocaleString() || '0'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge className={getStatusColor(selectedQuote.status)}>
                        {selectedQuote.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Project Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Project Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Yard Size</p>
                      <p className="font-medium">{selectedQuote.yard_size || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Budget</p>
                      <p className="font-medium">{selectedQuote.budget || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Timeline</p>
                      <p className="font-medium">{selectedQuote.timeline || 'Not specified'}</p>
                    </div>
                  </div>
                  
                  {selectedQuote.special_requests && (
                    <div>
                      <p className="text-sm text-muted-foreground">Special Requests</p>
                      <p className="font-medium">{selectedQuote.special_requests}</p>
                    </div>
                  )}

                  {selectedQuote.recommendations && selectedQuote.recommendations.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground">Recommendations</p>
                      <ul className="list-disc list-inside space-y-1">
                        {selectedQuote.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm">{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminQuotesManager;