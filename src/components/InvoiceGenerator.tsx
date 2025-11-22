import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Plus, Trash2, Send, Save, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface InvoiceGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  quotationId?: string;
}

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

const InvoiceGenerator = ({ isOpen, onClose, quotationId }: InvoiceGeneratorProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    customerAddress: "",
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    paymentTerms: "Net 30",
    taxRate: 0,
    discountAmount: 0,
    discountPercent: 0,
    notes: "",
    termsConditions: "Payment is due within 30 days. Late payments may incur additional fees.",
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: "1", description: "", quantity: 1, rate: 0, amount: 0 }
  ]);

  useEffect(() => {
    if (quotationId && isOpen) {
      loadQuotationData();
    }
  }, [quotationId, isOpen]);

  const loadQuotationData = async () => {
    if (!quotationId) return;

    try {
      const { data, error } = await supabase
        .from('user_quotations')
        .select('*')
        .eq('id', quotationId)
        .single();

      if (error) throw error;

      if (data) {
        // Calculate discount based on difference between sum of items and total quote
        const selectedOptions = data.selected_options ? (
          typeof data.selected_options === 'string' 
            ? JSON.parse(data.selected_options) 
            : data.selected_options
        ) : {};
        
        const optionsTotal: number = (Object.values(selectedOptions) as any[]).reduce((sum: number, opt: any) => {
          return sum + (Number(opt?.price) || 0);
        }, 0);
        
        const poolPrice: number = Number(data.pool_price) || 0;
        const itemsSubtotal: number = poolPrice + optionsTotal;
        
        const totalQuote: number = Number(data.total_quote_amount) || itemsSubtotal;
        const calculatedDiscount: number = itemsSubtotal > totalQuote ? itemsSubtotal - totalQuote : 0;
        const discountPercent: number = itemsSubtotal > 0 ? (calculatedDiscount / itemsSubtotal) * 100 : 0;
        
        setFormData({
          ...formData,
          customerName: data.name || "",
          customerEmail: data.email || "",
          customerPhone: data.phone || "",
          customerAddress: data.address || "",
          discountAmount: calculatedDiscount,
          discountPercent: discountPercent,
        });

        // Convert quote to line items
        const items: LineItem[] = [];
        
        if (data.pool_model) {
          items.push({
            id: "pool",
            description: `${data.pool_model} Pool Installation`,
            quantity: 1,
            rate: data.pool_price || 0,
            amount: data.pool_price || 0,
          });
        }

        if (data.selected_options) {
          const options = typeof data.selected_options === 'string' 
            ? JSON.parse(data.selected_options) 
            : data.selected_options;
          
          Object.values(options || {}).forEach((option: any, index: number) => {
            if (option?.name && option?.price) {
              items.push({
                id: `option-${index}`,
                description: option.name,
                quantity: 1,
                rate: option.price,
                amount: option.price,
              });
            }
          });
        }

        setLineItems(items.length > 0 ? items : [{ id: "1", description: "", quantity: 1, rate: 0, amount: 0 }]);
      }
    } catch (error) {
      console.error('Error loading quotation:', error);
      toast({
        title: "Error",
        description: "Failed to load quotation data",
        variant: "destructive",
      });
    }
  };

  const addLineItem = () => {
    const newId = (Math.max(...lineItems.map(item => parseInt(item.id) || 0), 0) + 1).toString();
    setLineItems([...lineItems, { id: newId, description: "", quantity: 1, rate: 0, amount: 0 }]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter(item => item.id !== id));
    }
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: any) => {
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'rate') {
          updated.amount = updated.quantity * updated.rate;
        }
        return updated;
      }
      return item;
    }));
  };

  const calculateTotals = () => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
    const discountAmount = formData.discountPercent > 0 ? (subtotal * formData.discountPercent) / 100 : formData.discountAmount;
    const taxAmount = (subtotal * formData.taxRate) / 100;
    const total = subtotal + taxAmount - discountAmount;
    return { subtotal, taxAmount, total, discountAmount };
  };

  const generateInvoiceNumber = async () => {
    const { data, error } = await supabase.rpc('generate_invoice_number');
    if (error) throw error;
    return data;
  };

  const handleSave = async (sendEmail: boolean = false) => {
    try {
      if (sendEmail) {
        setSending(true);
      } else {
      setLoading(true);
      }

      const { subtotal, taxAmount, total, discountAmount } = calculateTotals();
      const invoiceNumber = await generateInvoiceNumber();

      const invoiceData = {
        invoice_number: invoiceNumber,
        quotation_id: quotationId || null,
        user_id: user?.id || null,
        customer_name: formData.customerName,
        customer_email: formData.customerEmail,
        customer_phone: formData.customerPhone,
        customer_address: formData.customerAddress,
        invoice_date: formData.invoiceDate,
        due_date: formData.dueDate,
        line_items: JSON.parse(JSON.stringify(lineItems)),
        subtotal: subtotal,
        tax_rate: formData.taxRate,
        tax_amount: taxAmount,
        discount_amount: discountAmount,
        total_amount: total,
        payment_terms: formData.paymentTerms,
        notes: formData.notes,
        terms_conditions: formData.termsConditions,
        status: 'draft',
        payment_status: 'unpaid',
        created_by: user?.id,
      };

      const { data: invoice, error } = await supabase
        .from('invoices')
        .insert([invoiceData])
        .select()
        .single();

      if (error) throw error;

      if (sendEmail) {
        await supabase.functions.invoke('send-invoice-email', {
          body: {
            invoiceId: invoice.id,
            customerEmail: formData.customerEmail,
            customerName: formData.customerName,
          },
        });

        await supabase
          .from('invoices')
          .update({ sent_at: new Date().toISOString() })
          .eq('id', invoice.id);
      }

      toast({
        title: "Success",
        description: sendEmail ? "Invoice created and sent!" : "Invoice created successfully",
      });

      onClose();
      navigate(`/admin/invoices/${invoice.id}`);
    } catch (error: any) {
      console.error('Error creating invoice:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create invoice",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setSending(false);
    }
  };

  const { subtotal, taxAmount, total, discountAmount } = calculateTotals();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Invoice</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <Label>Customer Name *</Label>
                <Input
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <Label>Address *</Label>
                <Input
                  value={formData.customerAddress}
                  onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                  placeholder="123 Main St, City, State, ZIP"
                />
              </div>
            </CardContent>
          </Card>

          {/* Invoice Details */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4">
              <div>
                <Label>Invoice Date</Label>
                <Input
                  type="date"
                  value={formData.invoiceDate}
                  onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                />
              </div>
              <div>
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
              <div>
                <Label>Payment Terms</Label>
                <Select value={formData.paymentTerms} onValueChange={(value) => setFormData({ ...formData, paymentTerms: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Due on Receipt">Due on Receipt</SelectItem>
                    <SelectItem value="Net 15">Net 15</SelectItem>
                    <SelectItem value="Net 30">Net 30</SelectItem>
                    <SelectItem value="Net 60">Net 60</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Line Items</CardTitle>
              <Button onClick={addLineItem} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lineItems.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-5">
                      {index === 0 && <Label className="text-xs mb-1">Description</Label>}
                      <Input
                        value={item.description}
                        onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                        placeholder="Item description"
                      />
                    </div>
                    <div className="col-span-2">
                      {index === 0 && <Label className="text-xs mb-1">Quantity</Label>}
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-2">
                      {index === 0 && <Label className="text-xs mb-1">Rate ($)</Label>}
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.rate}
                        onChange={(e) => updateLineItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-2">
                      {index === 0 && <Label className="text-xs mb-1">Amount ($)</Label>}
                      <Input value={item.amount.toFixed(2)} disabled />
                    </div>
                    <div className="col-span-1 flex justify-end">
                      {lineItems.length > 1 && (
                        <Button
                          onClick={() => removeLineItem(item.id)}
                          size="icon"
                          variant="ghost"
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Totals */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2 max-w-sm ml-auto">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span>Tax:</span>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={formData.taxRate}
                      onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })}
                      className="w-20"
                    />
                    <span>%</span>
                  </div>
                  <span className="font-semibold">${taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span>Discount:</span>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={formData.discountPercent}
                      onChange={(e) => {
                        const percent = parseFloat(e.target.value) || 0;
                        setFormData({ ...formData, discountPercent: percent, discountAmount: 0 });
                      }}
                      className="w-20"
                    />
                    <span>%</span>
                  </div>
                  <span className="font-semibold">-${discountAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardContent className="pt-6">
              <div>
                <Label>Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes or special instructions..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button onClick={onClose} variant="outline">
              Cancel
            </Button>
            <Button onClick={() => handleSave(false)} disabled={loading || sending}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button onClick={() => handleSave(true)} disabled={loading || sending}>
              {sending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Send className="h-4 w-4 mr-2" />
              Save & Send
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceGenerator;
