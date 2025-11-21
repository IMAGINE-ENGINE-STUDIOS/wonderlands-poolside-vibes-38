import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Printer, Send, Edit2, Save, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Invoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  customer_address: string;
  invoice_date: string;
  due_date: string;
  line_items: any;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  payment_terms: string;
  payment_status: string;
  status: string;
  notes: string | null;
  terms_conditions: string | null;
  created_at: string;
  sent_at: string | null;
}

const InvoiceDetailPage = () => {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editedInvoice, setEditedInvoice] = useState<Invoice | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (invoiceId) {
      fetchInvoice();
    }
  }, [invoiceId]);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', invoiceId)
        .single();

      if (error) throw error;
      const invoiceData = {
        ...data,
        line_items: Array.isArray(data.line_items) ? data.line_items : JSON.parse(data.line_items as string)
      };
      setInvoice(invoiceData as Invoice);
      setEditedInvoice(invoiceData as Invoice);
    } catch (error) {
      console.error('Error fetching invoice:', error);
      toast({
        title: "Error",
        description: "Failed to fetch invoice details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSendEmail = async () => {
    if (!invoice) return;

    try {
      await supabase.functions.invoke('send-invoice-email', {
        body: {
          invoiceId: invoice.id,
          customerEmail: invoice.customer_email,
          customerName: invoice.customer_name,
        },
      });

      await supabase
        .from('invoices')
        .update({ sent_at: new Date().toISOString() })
        .eq('id', invoice.id);

      toast({
        title: "Success",
        description: "Invoice sent successfully",
      });

      fetchInvoice();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send invoice",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    if (!editedInvoice) return;

    try {
      const { error } = await supabase
        .from('invoices')
        .update({
          customer_name: editedInvoice.customer_name,
          customer_email: editedInvoice.customer_email,
          customer_phone: editedInvoice.customer_phone,
          customer_address: editedInvoice.customer_address,
          notes: editedInvoice.notes,
          terms_conditions: editedInvoice.terms_conditions,
        })
        .eq('id', invoiceId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Invoice updated successfully",
      });

      setEditMode(false);
      fetchInvoice();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update invoice",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'sent': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">Invoice not found</p>
            <Button onClick={() => navigate('/admin')} className="mt-4">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6 flex items-center justify-between no-print">
        <Button onClick={() => navigate('/admin')} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex gap-2">
          {!editMode && (
            <>
              <Button onClick={() => setEditMode(true)} variant="outline">
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button onClick={handleSendEmail} variant="outline">
                <Send className="h-4 w-4 mr-2" />
                Send Email
              </Button>
              <Button onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </>
          )}
          {editMode && (
            <>
              <Button onClick={() => { setEditMode(false); setEditedInvoice(invoice); }} variant="outline">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </>
          )}
        </div>
      </div>

      <Card className="print:shadow-none">
        <CardContent className="p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <img 
                src="/lovable-uploads/8ba4beaa-5f82-4e93-9c4e-6bdbf959c46a.png" 
                alt="Wonderlands Logo" 
                className="h-16 mb-2"
              />
              <h1 className="text-3xl font-bold text-primary">INVOICE</h1>
            </div>
            <div className="text-right">
              <p className="font-semibold text-lg">{invoice.invoice_number}</p>
              <Badge className={getStatusColor(invoice.payment_status)}>
                {invoice.payment_status.toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* Company & Customer Info */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-2">From:</h3>
              <p className="font-bold">Wonderlands Pools & Spas</p>
              <p className="text-sm text-muted-foreground">Florida, USA</p>
              <p className="text-sm text-muted-foreground">info@wonderlands.com</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Bill To:</h3>
              {editMode && editedInvoice ? (
                <div className="space-y-2">
                  <Input
                    value={editedInvoice.customer_name}
                    onChange={(e) => setEditedInvoice({ ...editedInvoice, customer_name: e.target.value })}
                    className="font-semibold"
                  />
                  <Input
                    value={editedInvoice.customer_email}
                    onChange={(e) => setEditedInvoice({ ...editedInvoice, customer_email: e.target.value })}
                  />
                  <Input
                    value={editedInvoice.customer_phone || ""}
                    onChange={(e) => setEditedInvoice({ ...editedInvoice, customer_phone: e.target.value })}
                  />
                  <Input
                    value={editedInvoice.customer_address}
                    onChange={(e) => setEditedInvoice({ ...editedInvoice, customer_address: e.target.value })}
                  />
                </div>
              ) : (
                <>
                  <p className="font-semibold">{invoice.customer_name}</p>
                  <p className="text-sm text-muted-foreground">{invoice.customer_email}</p>
                  {invoice.customer_phone && (
                    <p className="text-sm text-muted-foreground">{invoice.customer_phone}</p>
                  )}
                  <p className="text-sm text-muted-foreground">{invoice.customer_address}</p>
                </>
              )}
            </div>
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-3 gap-4 mb-8 p-4 bg-muted rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Invoice Date</p>
              <p className="font-semibold">{new Date(invoice.invoice_date).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Due Date</p>
              <p className="font-semibold">{new Date(invoice.due_date).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Payment Terms</p>
              <p className="font-semibold">{invoice.payment_terms}</p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="mb-8">
            <table className="w-full">
              <thead className="border-b-2 border-primary">
                <tr>
                  <th className="text-left py-3 font-semibold">Description</th>
                  <th className="text-center py-3 font-semibold">Qty</th>
                  <th className="text-right py-3 font-semibold">Rate</th>
                  <th className="text-right py-3 font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {(Array.isArray(invoice.line_items) ? invoice.line_items : []).map((item: any, index: number) => (
                  <tr key={index}>
                    <td className="py-3">{item.description}</td>
                    <td className="py-3 text-center">{item.quantity}</td>
                    <td className="py-3 text-right">${item.rate.toFixed(2)}</td>
                    <td className="py-3 text-right font-semibold">${item.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-64 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold">${invoice.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax ({invoice.tax_rate}%):</span>
                <span className="font-semibold">${invoice.tax_amount.toFixed(2)}</span>
              </div>
              {invoice.discount_amount > 0 && (
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span className="font-semibold">-${invoice.discount_amount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t-2 border-primary pt-2">
                <span>Total:</span>
                <span className="text-primary">${invoice.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {(invoice.notes || editMode) && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Notes:</h3>
              {editMode && editedInvoice ? (
                <Textarea
                  value={editedInvoice.notes || ""}
                  onChange={(e) => setEditedInvoice({ ...editedInvoice, notes: e.target.value })}
                  rows={3}
                />
              ) : (
                <p className="text-sm text-muted-foreground">{invoice.notes}</p>
              )}
            </div>
          )}

          {/* Terms */}
          <div className="border-t pt-6">
            <h3 className="font-semibold mb-2">Terms & Conditions:</h3>
            {editMode && editedInvoice ? (
              <Textarea
                value={editedInvoice.terms_conditions || ""}
                onChange={(e) => setEditedInvoice({ ...editedInvoice, terms_conditions: e.target.value })}
                rows={3}
              />
            ) : (
              <p className="text-sm text-muted-foreground">{invoice.terms_conditions}</p>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
            <p>Thank you for your business!</p>
            <p>For questions, contact us at info@wonderlands.com</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoiceDetailPage;
