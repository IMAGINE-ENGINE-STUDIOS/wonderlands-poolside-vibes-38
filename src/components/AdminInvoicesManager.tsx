import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Eye, Search, Send, Download, Copy, Lock } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const EDIT_PASSCODE = "WONDERMAGIC";
const BULK_DOWNLOAD_THRESHOLD = 10;
const SESSION_DOWNLOAD_KEY = "admin_invoice_downloads_session";

interface Invoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  payment_status: string;
  status: string;
  invoice_date: string;
  due_date: string;
  sent_at: string | null;
}

const AdminInvoicesManager = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [passcodeOpen, setPasscodeOpen] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState("");
  const [passcodeError, setPasscodeError] = useState(false);
  const [pendingDownload, setPendingDownload] = useState<"selected" | "all" | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvoices(data || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast({
        title: "Error",
        description: "Failed to fetch invoices",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async (invoice: Invoice) => {
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

      toast({ title: "Success", description: "Invoice sent successfully" });
      fetchInvoices();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send invoice",
        variant: "destructive",
      });
    }
  };

  const generateNextInvoiceNumber = async (): Promise<string> => {
    const year = new Date().getFullYear();
    const prefix = `INV-${year}-`;
    const { data } = await supabase
      .from('invoices')
      .select('invoice_number')
      .like('invoice_number', `${prefix}%`)
      .order('invoice_number', { ascending: false })
      .limit(1);
    let next = 1;
    if (data && data.length > 0) {
      const lastNum = parseInt(data[0].invoice_number.replace(prefix, ''), 10);
      if (!isNaN(lastNum)) next = lastNum + 1;
    }
    return `${prefix}${String(next).padStart(5, '0')}`;
  };

  const handleDuplicate = async (invoiceId: string) => {
    try {
      const { data: original, error: fetchError } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', invoiceId)
        .single();
      if (fetchError) throw fetchError;

      const newNumber = await generateNextInvoiceNumber();
      const { id, created_at, updated_at, invoice_number, sent_at, paid_date, paid_amount, ...rest } = original as any;

      const { data: inserted, error: insertError } = await supabase
        .from('invoices')
        .insert({
          ...rest,
          invoice_number: newNumber,
          invoice_date: new Date().toISOString().split('T')[0],
          sent_at: null,
          paid_date: null,
          paid_amount: 0,
          payment_status: 'unpaid',
          status: 'draft',
        })
        .select()
        .single();

      if (insertError) throw insertError;
      toast({ title: "Duplicated", description: `Created ${newNumber}` });
      fetchInvoices();
      if (inserted) navigate(`/admin/invoices/${inserted.id}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to duplicate invoice",
        variant: "destructive",
      });
    }
  };

  const getSessionDownloadCount = (): number => {
    return parseInt(sessionStorage.getItem(SESSION_DOWNLOAD_KEY) || "0", 10);
  };

  const bumpSessionDownloadCount = (n: number) => {
    sessionStorage.setItem(SESSION_DOWNLOAD_KEY, String(getSessionDownloadCount() + n));
  };

  const downloadCsv = (rows: Invoice[]) => {
    const headers = [
      "invoice_number", "customer_name", "customer_email",
      "invoice_date", "due_date", "total_amount",
      "status", "payment_status", "sent_at",
    ];
    const escape = (v: any) => {
      if (v === null || v === undefined) return "";
      const s = String(v).replace(/"/g, '""');
      return /[",\n]/.test(s) ? `"${s}"` : s;
    };
    const csv = [
      headers.join(","),
      ...rows.map(r => headers.map(h => escape((r as any)[h])).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoices-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const performDownload = (mode: "selected" | "all") => {
    const rows = mode === "all" ? invoices : invoices.filter(i => selectedIds.has(i.id));
    if (rows.length === 0) {
      toast({ title: "Nothing to download", variant: "destructive" });
      return;
    }
    downloadCsv(rows);
    bumpSessionDownloadCount(rows.length);
    toast({ title: "Downloaded", description: `${rows.length} invoice(s) exported` });
  };

  const requestDownload = (mode: "selected" | "all") => {
    const count = mode === "all" ? invoices.length : selectedIds.size;
    if (count === 0) {
      toast({ title: "No invoices selected" });
      return;
    }
    const sessionCount = getSessionDownloadCount();
    const needsPasscode = mode === "all" || count > BULK_DOWNLOAD_THRESHOLD || sessionCount + count > BULK_DOWNLOAD_THRESHOLD;
    if (needsPasscode) {
      setPendingDownload(mode);
      setPasscodeInput("");
      setPasscodeError(false);
      setPasscodeOpen(true);
    } else {
      performDownload(mode);
    }
  };

  const handlePasscodeSubmit = () => {
    if (passcodeInput === EDIT_PASSCODE) {
      setPasscodeOpen(false);
      if (pendingDownload) performDownload(pendingDownload);
      setPendingDownload(null);
    } else {
      setPasscodeError(true);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'viewed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'unpaid': return 'bg-red-100 text-red-800';
      case 'overdue': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch =
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer_email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    const matchesPayment = paymentFilter === "all" || invoice.payment_status === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  const allFilteredSelected = filteredInvoices.length > 0 && filteredInvoices.every(i => selectedIds.has(i.id));
  const toggleSelectAllFiltered = () => {
    const next = new Set(selectedIds);
    if (allFilteredSelected) {
      filteredInvoices.forEach(i => next.delete(i.id));
    } else {
      filteredInvoices.forEach(i => next.add(i.id));
    }
    setSelectedIds(next);
  };

  const toggleRow = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoices</CardTitle>
        <CardDescription>Manage all customer invoices</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="viewed">Viewed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk actions */}
          <div className="flex flex-wrap items-center gap-2 justify-between">
            <div className="text-sm text-muted-foreground">
              {selectedIds.size > 0 ? `${selectedIds.size} selected` : `${filteredInvoices.length} invoices`}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => requestDownload("selected")}
                size="sm"
                variant="outline"
                disabled={selectedIds.size === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Selected ({selectedIds.size})
              </Button>
              <Button
                onClick={() => requestDownload("all")}
                size="sm"
                variant="outline"
              >
                <Lock className="h-4 w-4 mr-2" />
                Download All ({invoices.length})
              </Button>
              {selectedIds.size > 0 && (
                <Button onClick={() => setSelectedIds(new Set())} size="sm" variant="ghost">
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Invoices Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={allFilteredSelected}
                      onCheckedChange={toggleSelectAllFiltered}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No invoices found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.has(invoice.id)}
                          onCheckedChange={() => toggleRow(invoice.id)}
                          aria-label={`Select ${invoice.invoice_number}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{invoice.customer_name}</div>
                          <div className="text-sm text-muted-foreground">{invoice.customer_email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(invoice.invoice_date).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(invoice.due_date).toLocaleDateString()}</TableCell>
                      <TableCell className="font-semibold">${invoice.total_amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(invoice.status)}>
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPaymentStatusColor(invoice.payment_status)}>
                          {invoice.payment_status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            onClick={() => handleDuplicate(invoice.id)}
                            size="sm"
                            variant="outline"
                            title="Duplicate invoice"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          {!invoice.sent_at && (
                            <Button
                              onClick={() => handleSendEmail(invoice)}
                              size="sm"
                              variant="outline"
                              title="Send invoice"
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            onClick={() => navigate(`/admin/invoices/${invoice.id}`)}
                            size="sm"
                            variant="outline"
                            title="View invoice"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>

      <Dialog open={passcodeOpen} onOpenChange={setPasscodeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" /> Passcode required
            </DialogTitle>
            <DialogDescription>
              Bulk download of more than {BULK_DOWNLOAD_THRESHOLD} invoices per session — or the full database — requires the admin passcode.
            </DialogDescription>
          </DialogHeader>
          <Input
            type="password"
            value={passcodeInput}
            onChange={(e) => { setPasscodeInput(e.target.value); setPasscodeError(false); }}
            onKeyDown={(e) => { if (e.key === "Enter") handlePasscodeSubmit(); }}
            placeholder="Enter passcode"
            autoFocus
          />
          {passcodeError && (
            <p className="text-sm text-destructive">Incorrect passcode</p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasscodeOpen(false)}>Cancel</Button>
            <Button onClick={handlePasscodeSubmit}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default AdminInvoicesManager;
