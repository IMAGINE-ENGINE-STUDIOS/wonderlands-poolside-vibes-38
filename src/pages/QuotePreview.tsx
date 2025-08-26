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
  const [isLoading, setIsLoading] = useState(true);

  const readPayload = useCallback(() => {
    try {
      if (!id) {
        console.log('No quote ID provided');
        return null;
      }
      
      console.log('Reading quote data for ID:', id);
      const raw = sessionStorage.getItem(`quote:${id}`);
      
      if (!raw) {
        console.log('No quote data found in sessionStorage for ID:', id);
        return null;
      }
      
      const parsed = JSON.parse(raw) as QuotePayload;
      console.log('Successfully parsed quote data:', parsed);
      return parsed;
    } catch (error) {
      console.error('Error reading quote payload:', error);
      return null;
    }
  }, [id]);

  useEffect(() => {
    setIsLoading(true);
    const data = readPayload();
    setPayload(data);
    setIsLoading(false);
    
    if (!data) {
      console.log('No valid quote data found');
    }
  }, [readPayload]);

  useEffect(() => {
    document.title = `Quote Preview ${id ? `#${id}` : ""}`;
  }, [id]);

  const persistPayload = (next: QuotePayload) => {
    if (!id) return;
    
    try {
      sessionStorage.setItem(`quote:${id}`, JSON.stringify(next));
      setPayload(next);
      console.log('Quote data updated successfully');
    } catch (error) {
      console.error('Error persisting quote data:', error);
    }
  };

  const handleSaveCustomer = (customer: QuoteCustomer) => {
    if (!payload) return;
    persistPayload({ ...payload, customer });
  };

  const handlePrint = () => window.print();
  const handleDownload = () => window.print(); // Allows user to "Save as PDF"
  const handleBack = () => navigate(-1);

  const needsCustomer = Boolean(payload && !payload.customer?.name);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="pt-20 container mx-auto px-4 flex-1">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading quote...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="pt-20 container mx-auto px-4 flex-1">
        <div className="flex justify-end gap-2 mb-4 print:hidden">
          <Button onClick={handleDownload} variant="default">Download PDF</Button>
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
              <FileText size={64} className="mx-auto mb-4 text-primary/50" />
              <h2 className="text-xl font-semibold mb-2 text-foreground">Quote Not Found</h2>
              <p className="text-lg mb-4">No quote data found for this session.</p>
              <p className="text-sm mb-6">This might happen if:</p>
              <ul className="text-sm text-left max-w-md mx-auto space-y-1 mb-6">
                <li>• The quote link is invalid or expired</li>
                <li>• Your browser session was cleared</li>
                <li>• The quote was opened in a different browser</li>
              </ul>
              <Button onClick={handleBack} variant="default">
                Go Back to Products
              </Button>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default QuotePreview;
