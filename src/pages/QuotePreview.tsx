import { useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import QuoteCard from "@/components/QuoteCard";

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

  const calculatePaverArea = (pool: any) => {
    if (!pool?.dimensions) return 0;
    const dimensions = pool.dimensions.replace(/[′″]/g, '').split(' × ');
    if (dimensions.length === 2) {
      const width = parseFloat(dimensions[0]);
      const length = parseFloat(dimensions[1]);
      // Assuming pavers around pool (example: 3ft border)
      const paverWidth = (width + 6) * (length + 6) - (width * length);
      return Math.round(paverWidth);
    }
    return 0;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="pt-20 container mx-auto px-4 flex-1">
        <div className="flex justify-end gap-2 mb-4 print:hidden">
          <Button onClick={handleDownload} variant="default">Download PDF</Button>
          <Button onClick={handlePrint} variant="outline">Print</Button>
          <Button onClick={handleBack} variant="ghost">Go Back</Button>
        </div>

        {payload ? (
          <QuoteCard payload={payload} />
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
