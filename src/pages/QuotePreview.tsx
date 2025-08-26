import { useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

interface QuotePayload {
  type: string;
  pool?: any;
  spa?: any;
  product?: any;
  extras?: any;
}

const QuotePreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const payload: QuotePayload | null = useMemo(() => {
    try {
      if (!id) return null;
      const raw = sessionStorage.getItem(`quote:${id}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, [id]);

  useEffect(() => {
    document.title = `Quote Preview ${id ? `#${id}` : ''}`;
  }, [id]);

  const handlePrint = () => window.print();
  const handleDownload = () => window.print(); // Simplified: users can Save as PDF
  const handleBack = () => navigate(-1);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="pt-20 container mx-auto px-4 flex-1">
        <div className="flex justify-end gap-2 mb-4 print:hidden">
          <Button onClick={handleDownload} variant="default">Download</Button>
          <Button onClick={handlePrint} variant="outline">Print</Button>
          <Button onClick={handleBack} variant="ghost">Go Back</Button>
        </div>

        <section id="quote-content" className="rounded-lg border bg-card text-card-foreground shadow p-4 sm:p-6 md:p-8">
          <h1 className="text-2xl font-semibold mb-2">Final Quote</h1>
          <p className="text-sm text-muted-foreground mb-6">Preview your quote below. Use the buttons above to download or print.</p>

          {!payload ? (
            <div className="text-muted-foreground">No quote data found. Please go back and try again.</div>
          ) : (
            <div className="space-y-6">
              {payload.pool && (
                <div>
                  <h2 className="text-xl font-medium">Pool</h2>
                  <pre className="mt-2 whitespace-pre-wrap text-sm bg-muted/50 p-3 rounded-md overflow-auto">{JSON.stringify(payload.pool, null, 2)}</pre>
                </div>
              )}
              {payload.spa && (
                <div>
                  <h2 className="text-xl font-medium">Spa</h2>
                  <pre className="mt-2 whitespace-pre-wrap text-sm bg-muted/50 p-3 rounded-md overflow-auto">{JSON.stringify(payload.spa, null, 2)}</pre>
                </div>
              )}
              {payload.product && (
                <div>
                  <h2 className="text-xl font-medium">Product</h2>
                  <pre className="mt-2 whitespace-pre-wrap text-sm bg-muted/50 p-3 rounded-md overflow-auto">{JSON.stringify(payload.product, null, 2)}</pre>
                </div>
              )}
              {payload.extras && (
                <div>
                  <h2 className="text-xl font-medium">Extras</h2>
                  <pre className="mt-2 whitespace-pre-wrap text-sm bg-muted/50 p-3 rounded-md overflow-auto">{JSON.stringify(payload.extras, null, 2)}</pre>
                </div>
              )}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default QuotePreview;
