import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Printer, Send, Edit2, Save, X, Plus, Trash2, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const DEFAULT_PAYMENT_TERMS = `20% due same day of signing the contract . 35% due same day after permits are approved and when the excavator arrives to the house . 40% before concrete machine arrives and same day after excavations are completed . 10% due same day when the last inspection is approved It will be fully explained in the contract.`;
const EDIT_PASSCODE = "WONDERMAGIC";

interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface Invoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  customer_address: string;
  invoice_date: string;
  due_date: string;
  line_items: LineItem[];
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

// Helper function to calculate totals from line items
const calculateTotals = (lineItems: LineItem[], discountAmount: number, taxRate: number) => {
  const subtotal = lineItems.reduce((sum, item) => {
    return sum + (item.total || item.quantity * item.unit_price || 0);
  }, 0);
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = taxableAmount * taxRate / 100;
  const total = subtotal - discountAmount + taxAmount;
  return { subtotal, taxAmount, total };
};

const InvoiceDetailPage = () => {
  const { invoiceId } = useParams<{
    invoiceId: string;
  }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editedInvoice, setEditedInvoice] = useState<Invoice | null>(null);
  const [showPasscodeDialog, setShowPasscodeDialog] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState("");
  const [passcodeError, setPasscodeError] = useState(false);
  const { toast } = useToast();
  useEffect(() => {
    if (invoiceId) {
      fetchInvoice();
    }
  }, [invoiceId]);
  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from("invoices").select("*").eq("id", invoiceId).single();
      if (error) throw error;
      const invoiceData = {
        ...data,
        line_items: Array.isArray(data.line_items) ? data.line_items : JSON.parse(data.line_items as string),
        // Calculate due date as 15 days after invoice date if not set
        due_date:
          data.due_date ||
          new Date(new Date(data.invoice_date).getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      };
      setInvoice(invoiceData as Invoice);
      setEditedInvoice(invoiceData as Invoice);
    } catch (error) {
      console.error("Error fetching invoice:", error);
      toast({
        title: "Error",
        description: "Failed to fetch invoice details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  const handlePrint = async () => {
    const invoiceElement = document.querySelector("[data-invoice-content]") as HTMLElement;
    if (!invoiceElement) {
      // Fallback to window.print if element not found
      window.print();
      return;
    }
    try {
      // @ts-ignore - html2pdf is loaded via CDN
      const html2pdf = (await import("html2pdf.js")).default;
      const opt = {
        margin: 0.5,
        filename: `invoice-${invoice?.invoice_number || Date.now()}.pdf`,
        image: {
          type: "jpeg" as const,
          quality: 0.98,
        },
        html2canvas: {
          scale: 2,
          useCORS: true,
        },
        jsPDF: {
          unit: "in",
          format: "letter",
          orientation: "portrait" as const,
        },
      };
      await html2pdf().set(opt).from(invoiceElement).save();
      toast({
        title: "Success!",
        description: "Invoice downloaded as PDF.",
      });
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Falling back to print...",
        variant: "destructive",
      });
      window.print();
    }
  };
  const handleSendEmail = async () => {
    if (!invoice) return;
    try {
      await supabase.functions.invoke("send-invoice-email", {
        body: {
          invoiceId: invoice.id,
          customerEmail: invoice.customer_email,
          customerName: invoice.customer_name,
        },
      });
      await supabase
        .from("invoices")
        .update({
          sent_at: new Date().toISOString(),
        })
        .eq("id", invoice.id);
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
  const handlePasscodeSubmit = () => {
    if (passcodeInput.toUpperCase() === EDIT_PASSCODE) {
      setShowPasscodeDialog(false);
      setPasscodeInput("");
      setPasscodeError(false);
      setEditMode(true);
    } else {
      setPasscodeError(true);
    }
  };

  const handleEditClick = () => {
    setShowPasscodeDialog(true);
    setPasscodeInput("");
    setPasscodeError(false);
  };

  const handleSave = async () => {
    if (!editedInvoice) return;
    try {
      // Always recalculate from line items - never use manually entered values
      const { subtotal, taxAmount, total } = calculateTotals(
        editedInvoice.line_items,
        editedInvoice.discount_amount || 0,
        editedInvoice.tax_rate || 0
      );

      const { error } = await supabase
        .from("invoices")
        .update({
          invoice_number: editedInvoice.invoice_number,
          invoice_date: editedInvoice.invoice_date,
          due_date: editedInvoice.due_date,
          customer_name: editedInvoice.customer_name,
          customer_email: editedInvoice.customer_email,
          customer_phone: editedInvoice.customer_phone,
          customer_address: editedInvoice.customer_address,
          line_items: JSON.parse(JSON.stringify(editedInvoice.line_items)),
          subtotal: subtotal,
          tax_rate: editedInvoice.tax_rate || 0,
          tax_amount: taxAmount,
          discount_amount: editedInvoice.discount_amount || 0,
          total_amount: total,
          payment_terms: editedInvoice.payment_terms,
          notes: editedInvoice.notes,
          payment_status: editedInvoice.payment_status,
          sent_at: editedInvoice.sent_at,
        })
        .eq("id", invoiceId);
      if (error) throw error;
      toast({
        title: "Success",
        description: "Invoice updated successfully",
      });
      setEditMode(false);
      fetchInvoice();
    } catch (error: any) {
      console.error("Invoice save error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update invoice",
        variant: "destructive",
      });
    }
  };

  const addLineItem = () => {
    if (!editedInvoice) return;
    const newItem: LineItem = {
      description: "New Item",
      quantity: 1,
      unit_price: 0,
      total: 0,
    };
    setEditedInvoice({
      ...editedInvoice,
      line_items: [...editedInvoice.line_items, newItem],
    });
  };

  const removeLineItem = (index: number) => {
    if (!editedInvoice) return;
    const newItems = editedInvoice.line_items.filter((_, i) => i !== index);
    setEditedInvoice({
      ...editedInvoice,
      line_items: newItems,
    });
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    if (!editedInvoice) return;
    const newItems = [...editedInvoice.line_items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };
    // Recalculate total for the line item
    if (field === 'quantity' || field === 'unit_price') {
      newItems[index].total = newItems[index].quantity * newItems[index].unit_price;
    }
    setEditedInvoice({
      ...editedInvoice,
      line_items: newItems,
    });
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "sent":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "paid":
        return "bg-green-100 text-green-800 border-green-200";
      case "overdue":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
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
            <Button onClick={() => navigate("/admin")} className="mt-4">
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
        <Button onClick={() => navigate("/admin")} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex gap-2">
          {!editMode && (
            <>
              <Button onClick={handleEditClick} variant="outline">
                <Lock className="h-4 w-4 mr-2" />
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
              <Button
                onClick={() => {
                  setEditMode(false);
                  setEditedInvoice(invoice);
                }}
                variant="outline"
              >
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

      {/* Passcode Dialog */}
      <Dialog open={showPasscodeDialog} onOpenChange={setShowPasscodeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Enter Passcode to Edit
            </DialogTitle>
            <DialogDescription>
              Please enter the authorized passcode to make changes to this invoice.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              type="password"
              placeholder="Enter passcode..."
              value={passcodeInput}
              onChange={(e) => {
                setPasscodeInput(e.target.value);
                setPasscodeError(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handlePasscodeSubmit();
                }
              }}
              className={passcodeError ? "border-red-500" : ""}
            />
            {passcodeError && (
              <p className="text-sm text-red-500">Incorrect passcode. Please try again.</p>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowPasscodeDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handlePasscodeSubmit}>
                Unlock
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Card className="print:shadow-none" data-invoice-content>
        <CardContent className="p-0">
          {/* Invoice Header - Company Info */}
          <div className="bg-gradient-to-r from-primary to-coral p-8 text-white">
            <div className="flex justify-between items-start">
              <div>
                <img loading="lazy" decoding="async"
                  src="/lovable-uploads/02222bf9-70e0-46ee-9772-cacbabb3e9c2.webp"
                  alt="Wonderlands Logo"
                  className="h-16 mb-4 object-contain"
                />
                <h1 className="text-4xl font-bold mb-2">INVOICE</h1>
                {editMode ? (
                  <Input
                    value={editedInvoice?.invoice_number || ""}
                    onChange={(e) =>
                      setEditedInvoice((prev) =>
                        prev ? { ...prev, invoice_number: e.target.value } : null
                      )
                    }
                    className="text-xl bg-white/20 text-white border-white/30"
                  />
                ) : (
                  <p className="text-xl opacity-90">{invoice.invoice_number}</p>
                )}
              </div>
              <div className="text-right">
                {editMode ? (
                  <select
                    value={editedInvoice?.payment_status || "unpaid"}
                    onChange={(e) =>
                      setEditedInvoice((prev) =>
                        prev ? { ...prev, payment_status: e.target.value } : null
                      )
                    }
                    className="text-sm px-3 py-1 mb-2 rounded bg-white/20 text-white border border-white/30"
                  >
                    <option value="unpaid" className="text-black">UNPAID</option>
                    <option value="partial" className="text-black">PARTIAL</option>
                    <option value="paid" className="text-black">PAID</option>
                    <option value="overdue" className="text-black">OVERDUE</option>
                  </select>
                ) : (
                  <Badge className={getStatusColor(invoice.payment_status) + " text-sm px-3 py-1 mb-2"}>
                    {invoice.payment_status.toUpperCase()}
                  </Badge>
                )}
                {editMode ? (
                  <div className="space-y-2 mt-2">
                    <div>
                      <label className="text-xs opacity-75">Invoice Date:</label>
                      <Input
                        type="date"
                        value={editedInvoice?.invoice_date || ""}
                        onChange={(e) =>
                          setEditedInvoice((prev) =>
                            prev ? { ...prev, invoice_date: e.target.value } : null
                          )
                        }
                        className="text-sm bg-white/20 text-white border-white/30"
                      />
                    </div>
                    <div>
                      <label className="text-xs opacity-75">Due Date:</label>
                      <Input
                        type="date"
                        value={editedInvoice?.due_date || ""}
                        onChange={(e) =>
                          setEditedInvoice((prev) =>
                            prev ? { ...prev, due_date: e.target.value } : null
                          )
                        }
                        className="text-sm bg-white/20 text-white border-white/30"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm opacity-90 mt-2">
                      Invoice Date: {new Date(invoice.invoice_date).toLocaleDateString()}
                    </p>
                    <p className="text-sm opacity-90">Due Date: {new Date(invoice.due_date).toLocaleDateString()}</p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Bill To Section */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-2">Bill To</h3>
                {editMode ? (
                  <div className="space-y-2">
                    <Input
                      value={editedInvoice?.customer_name || ""}
                      onChange={(e) =>
                        setEditedInvoice((prev) =>
                          prev
                            ? {
                                ...prev,
                                customer_name: e.target.value,
                              }
                            : null,
                        )
                      }
                      className="font-semibold"
                    />
                    <Input
                      value={editedInvoice?.customer_email || ""}
                      onChange={(e) =>
                        setEditedInvoice((prev) =>
                          prev
                            ? {
                                ...prev,
                                customer_email: e.target.value,
                              }
                            : null,
                        )
                      }
                    />
                    <Input
                      value={editedInvoice?.customer_phone || ""}
                      onChange={(e) =>
                        setEditedInvoice((prev) =>
                          prev
                            ? {
                                ...prev,
                                customer_phone: e.target.value,
                              }
                            : null,
                        )
                      }
                    />
                    <Textarea
                      value={editedInvoice?.customer_address || ""}
                      onChange={(e) =>
                        setEditedInvoice((prev) =>
                          prev
                            ? {
                                ...prev,
                                customer_address: e.target.value,
                              }
                            : null,
                        )
                      }
                      rows={2}
                    />
                  </div>
                ) : (
                  <>
                    <p className="font-semibold text-lg">{invoice.customer_name}</p>
                    <p className="text-sm text-muted-foreground">{invoice.customer_email}</p>
                    {invoice.customer_phone && (
                      <p className="text-sm text-muted-foreground">{invoice.customer_phone}</p>
                    )}
                    <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">{invoice.customer_address}</p>
                  </>
                )}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-2">From</h3>
                <p className="font-semibold text-lg">Wonderlands World Experience LLC </p>
                <p className="text-sm text-muted-foreground">Florida's Premier Pool Installation</p>
                <p className="text-sm text-muted-foreground">sales@wonderlandsworld.com</p>
                <p className="text-sm text-muted-foreground">(239) 257-0637</p>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="mb-8">
              {editMode && (
                <div className="flex justify-end mb-2">
                  <Button onClick={addLineItem} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </div>
              )}
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-primary">
                    <th className="text-left py-3 font-semibold">Description</th>
                    <th className="text-center py-3 font-semibold w-24">Qty</th>
                    <th className="text-right py-3 font-semibold w-32">Rate</th>
                    <th className="text-right py-3 font-semibold w-32">Amount</th>
                    {editMode && <th className="w-12"></th>}
                  </tr>
                </thead>
                <tbody>
                  {editMode
                    ? editedInvoice?.line_items?.map((item: any, index: number) => (
                        <tr key={index} className="border-b border-gray-200">
                          <td className="py-2">
                            <Input
                              value={item.description || ""}
                              onChange={(e) => updateLineItem(index, "description", e.target.value)}
                              className="w-full"
                            />
                          </td>
                          <td className="py-2">
                            <Input
                              type="number"
                              value={item.quantity || 1}
                              onChange={(e) => updateLineItem(index, "quantity", parseInt(e.target.value) || 1)}
                              className="w-20 text-center"
                            />
                          </td>
                          <td className="py-2">
                            <Input
                              type="number"
                              value={item.unit_price || item.rate || 0}
                              onChange={(e) => updateLineItem(index, "unit_price", parseFloat(e.target.value) || 0)}
                              className="w-28 text-right"
                            />
                          </td>
                          <td className="text-right py-2 font-semibold">
                            ${(item.total || item.amount || (item.quantity || 1) * (item.unit_price || 0)).toLocaleString()}
                          </td>
                          <td className="py-2">
                            <Button
                              onClick={() => removeLineItem(index)}
                              size="sm"
                              variant="ghost"
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    : invoice.line_items?.map((item: any, index: number) => (
                        <tr key={index} className="border-b border-gray-200">
                          <td className="py-3">{item.description}</td>
                          <td className="text-center py-3">{item.quantity || 1}</td>
                          <td className="text-right py-3">
                            ${(item.unit_price || item.rate || item.total || 0).toLocaleString()}
                          </td>
                          <td className="text-right py-3 font-semibold">
                            ${(item.total || item.amount || 0).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-8">
              <div className="w-80">
                {editMode ? (
                  (() => {
                    // Calculate live totals from line items
                    const liveCalc = calculateTotals(
                      editedInvoice?.line_items || [],
                      editedInvoice?.discount_amount || 0,
                      editedInvoice?.tax_rate || 0
                    );
                    return (
                      <>
                        <div className="flex justify-between py-2 border-b items-center">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span className="font-semibold text-lg">${liveCalc.subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b items-center bg-green-50">
                          <span className="text-green-700 font-semibold">Discount ($)</span>
                          <Input
                            type="number"
                            value={editedInvoice?.discount_amount || 0}
                            onChange={(e) =>
                              setEditedInvoice((prev) =>
                                prev ? { ...prev, discount_amount: parseFloat(e.target.value) || 0 } : null
                              )
                            }
                            className="w-32 text-right"
                            min="0"
                          />
                        </div>
                        <div className="flex justify-between py-2 border-b items-center">
                          <span className="text-muted-foreground">Tax Rate (%)</span>
                          <Input
                            type="number"
                            value={editedInvoice?.tax_rate || 0}
                            onChange={(e) =>
                              setEditedInvoice((prev) =>
                                prev ? { ...prev, tax_rate: parseFloat(e.target.value) || 0 } : null
                              )
                            }
                            className="w-32 text-right"
                            min="0"
                            step="0.1"
                          />
                        </div>
                        {liveCalc.taxAmount > 0 && (
                          <div className="flex justify-between py-2 border-b items-center">
                            <span className="text-muted-foreground">Tax Amount</span>
                            <span className="font-semibold">${liveCalc.taxAmount.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between py-3 bg-gradient-to-r from-primary/10 to-coral/10 px-4 rounded-lg mt-2 items-center">
                          <span className="text-lg font-bold">Total Due</span>
                          <span className="text-2xl font-bold text-primary">${liveCalc.total.toLocaleString()}</span>
                        </div>
                      </>
                    );
                  })()
                ) : (
                  <>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-semibold">${invoice.subtotal.toLocaleString()}</span>
                    </div>
                    {invoice.discount_amount > 0 && (
                      <div className="flex justify-between py-2 border-b bg-green-50">
                        <span className="text-green-700 font-semibold">Discount</span>
                        <span className="font-bold text-green-600">
                          -${invoice.discount_amount.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {invoice.tax_amount > 0 && (
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Tax ({invoice.tax_rate}%)</span>
                        <span className="font-semibold">${invoice.tax_amount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-3 bg-gradient-to-r from-primary/10 to-coral/10 px-4 rounded-lg mt-2">
                      <span className="text-lg font-bold">Total Due</span>
                      <span className="text-2xl font-bold text-primary">${invoice.total_amount.toLocaleString()}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Payment Terms */}
            <div className="mb-8 pb-8 border-b">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-3">Payment Terms</h3>
              {editMode ? (
                <Textarea
                  value={editedInvoice?.payment_terms || DEFAULT_PAYMENT_TERMS}
                  onChange={(e) =>
                    setEditedInvoice((prev) =>
                      prev ? { ...prev, payment_terms: e.target.value } : null
                    )
                  }
                  rows={10}
                  className="w-full"
                  placeholder="Enter payment terms..."
                />
              ) : (
                <div className="bg-muted/30 p-4 rounded-lg">
                  <p className="text-sm whitespace-pre-line">
                    {invoice.payment_terms || DEFAULT_PAYMENT_TERMS}
                  </p>
                </div>
              )}
              {editMode ? (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-2">Sent Date</h3>
                  <Input
                    type="date"
                    value={editedInvoice?.sent_at ? new Date(editedInvoice.sent_at).toISOString().split("T")[0] : ""}
                    onChange={(e) =>
                      setEditedInvoice((prev) =>
                        prev ? { ...prev, sent_at: e.target.value ? new Date(e.target.value).toISOString() : null } : null
                      )
                    }
                    className="w-48"
                  />
                </div>
              ) : (
                invoice.sent_at && (
                  <div className="mt-4">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-2">Sent Date</h3>
                    <p className="text-sm">{new Date(invoice.sent_at).toLocaleDateString()}</p>
                  </div>
                )
              )}
            </div>

            {/* Notes */}
            {(invoice.notes || editMode) && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-2">Notes</h3>
                {editMode ? (
                  <Textarea
                    value={editedInvoice?.notes || ""}
                    onChange={(e) =>
                      setEditedInvoice((prev) =>
                        prev
                          ? {
                              ...prev,
                              notes: e.target.value,
                            }
                          : null,
                      )
                    }
                    rows={3}
                  />
                ) : (
                  <p className="text-sm whitespace-pre-line">{invoice.notes}</p>
                )}
              </div>
            )}


            {/* Footer */}
            <div className="text-center pt-6 border-t">
              <p className="text-sm text-muted-foreground">
                Thank you for building your dream patio with Wonderlands World!
              </p>
              <p className="text-xs text-muted-foreground mt-1">Questions? Contact us at sales@wonderlandsworld.com</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
export default InvoiceDetailPage;
