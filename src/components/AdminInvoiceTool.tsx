import { useState } from "react";
import { Button } from "@/components/ui/button";
import InvoiceGenerator from "./InvoiceGenerator";

const AdminInvoiceTool = () => {
  const [showInvoiceTool, setShowInvoiceTool] = useState(false);

  return (
    <div className="space-y-6">
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold mb-4">Invoice Generator</h2>
        <p className="text-muted-foreground mb-6">
          Create and send professional invoices to customers
        </p>
        <Button 
          onClick={() => setShowInvoiceTool(true)}
          size="lg"
          className="px-8"
        >
          Create Invoice
        </Button>
      </div>

      <InvoiceGenerator
        isOpen={showInvoiceTool}
        onClose={() => setShowInvoiceTool(false)}
      />
    </div>
  );
};

export default AdminInvoiceTool;
