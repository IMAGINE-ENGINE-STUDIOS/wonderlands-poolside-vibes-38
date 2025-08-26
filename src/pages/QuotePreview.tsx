
import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import QuoteCard from "@/components/QuoteCard";
import QuoteDetailsForm, { QuoteCustomer } from "@/components/QuoteDetailsForm";

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

  const readPayload = useCallback(() => {
    try {
      if (!id) return null;
      const raw = sessionStorage.getItem(`quote:${id}`);
      return raw ? (JSON.parse(raw) as QuotePayload) : null;
    } catch {
      return null;
    }
  }, [id]);

  useEffect(() => {
    setPayload(readPayload());
  }, [readPayload]);

  useEffect(() => {
    document.title = `Quote Preview ${id ? `#${id}` : ""}`;
  }, [id]);

  const persistPayload = (next: QuotePayload) => {
    if (!id) return;
    sessionStorage.setItem(`quote:${id}`, JSON.stringify(next));
    setPayload(next);
  };

  const handleSaveCustomer = (customer: QuoteCustomer) => {
    if (!payload) return;
    persistPayload({ ...payload, customer });
  };

  const handlePrint = () => window.print();
  const handleDownload = () => window.print(); // Allows user to "Save as PDF"
  const handleBack = () => navigate(-1);

  const needsCustomer = Boolean(payload && !payload.customer?.name);

  return (
    <div className="min-h-screen flex flex-col">
      <main className="pt-20 container mx-auto px-4 flex-1">
        <div className="flex justify-end gap-2 mb-4 print:hidden">
          <Button onClick={handleDownload} variant="default">Instant Quote</Button>
          <Button onClick={handlePrint} variant="outline">Print</Button>
          <Button onClick={handleBack} variant="ghost">Go Back</Button>
        </div>

        {payload ? (
          <div className="space-y-6">
            {needsCustomer && (
              <QuoteDetailsForm initial={payload.customer} onSave={handleSaveCustomer} />
            )}
            <QuoteCard payload={payload} />
          </div>
        ) : (
          <section id="quote-content" className="rounded-lg border bg-card text-card-foreground shadow-lg p-6 md:p-8">
            <div className="text-center text-muted-foreground py-12">
              <p className="text-lg">No quote data found. Please go back and try again.</p>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default QuotePreview;
