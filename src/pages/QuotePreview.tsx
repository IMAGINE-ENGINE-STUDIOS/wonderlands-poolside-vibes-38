import { useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import HorizontalNavigation from "@/components/HorizontalNavigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import ImageCard from "@/components/ImageCard";

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
      <HorizontalNavigation />
      <main className="pt-20 container mx-auto px-4 flex-1">
        <div className="flex justify-end gap-2 mb-4 print:hidden">
          <Button onClick={handleDownload} variant="default">Download PDF</Button>
          <Button onClick={handlePrint} variant="outline">Print</Button>
          <Button onClick={handleBack} variant="ghost">Go Back</Button>
        </div>

        <section id="quote-content" className="rounded-lg border bg-card text-card-foreground shadow-lg p-6 md:p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">Final Quote</h1>
            <p className="text-muted-foreground">Your personalized pool & paver quotation</p>
          </div>

          {!payload ? (
            <div className="text-center text-muted-foreground py-12">
              <p className="text-lg">No quote data found. Please go back and try again.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Pool Section */}
              {payload.pool && (
                <div className="border border-border rounded-lg p-6 bg-background/50">
                  <h2 className="text-2xl font-semibold text-primary mb-4 flex items-center gap-2">
                    🏊‍♀️ Pool Selection
                  </h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    {payload.pool.image && (
                      <div className="aspect-video overflow-hidden rounded-lg">
                        <ImageCard
                          src={payload.pool.image}
                          alt={payload.pool.model}
                          className="w-full h-full"
                          enableZoom={false}
                        />
                      </div>
                    )}
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-semibold">{payload.pool.model}</h3>
                        <p className="text-2xl font-bold text-primary">${payload.pool.price?.toLocaleString()}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm text-muted-foreground">Dimensions</span>
                          <p className="font-medium">{payload.pool.dimensions}</p>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Depth</span>
                          <p className="font-medium">{payload.pool.depth}</p>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Installation</span>
                          <p className="font-medium">{payload.pool.installationTimeWeeks} weeks</p>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Warranty</span>
                          <p className="font-medium">{payload.pool.warrantyYears} years</p>
                        </div>
                      </div>
                      {payload.pool.features && (
                        <div>
                          <span className="text-sm text-muted-foreground">Features</span>
                          <ul className="list-disc list-inside text-sm mt-1">
                            {payload.pool.features.map((feature: string, idx: number) => (
                              <li key={idx}>{feature}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Spa Section */}
              {payload.spa && (
                <div className="border border-border rounded-lg p-6 bg-background/50">
                  <h2 className="text-2xl font-semibold text-primary mb-4 flex items-center gap-2">
                    🛁 Spa Addition
                  </h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    {payload.spa.image && (
                      <div className="aspect-video overflow-hidden rounded-lg">
                        <ImageCard
                          src={payload.spa.image}
                          alt={payload.spa.model}
                          className="w-full h-full"
                          enableZoom={false}
                        />
                      </div>
                    )}
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-semibold">{payload.spa.model}</h3>
                        <p className="text-2xl font-bold text-primary">${payload.spa.price?.toLocaleString()}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm text-muted-foreground">Dimensions</span>
                          <p className="font-medium">{payload.spa.dimensions}</p>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Warranty</span>
                          <p className="font-medium">{payload.spa.warrantyYears} years</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Product Section */}
              {payload.product && (
                <div className="border border-border rounded-lg p-6 bg-background/50">
                  <h2 className="text-2xl font-semibold text-primary mb-4 flex items-center gap-2">
                    🔧 Additional Products
                  </h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    {payload.product.image && (
                      <div className="aspect-video overflow-hidden rounded-lg">
                        <ImageCard
                          src={payload.product.image}
                          alt={payload.product.name}
                          className="w-full h-full"
                          enableZoom={false}
                        />
                      </div>
                    )}
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-semibold">{payload.product.name}</h3>
                        <p className="text-2xl font-bold text-primary">${payload.product.price?.toLocaleString()}</p>
                      </div>
                      {payload.product.description && (
                        <p className="text-muted-foreground">{payload.product.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Paver Area Calculation */}
              {payload.pool && (
                <div className="border border-border rounded-lg p-6 bg-background/50">
                  <h2 className="text-2xl font-semibold text-primary mb-4 flex items-center gap-2">
                    🧱 Paver Area Calculation
                  </h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <span className="text-sm text-muted-foreground">Pool Dimensions</span>
                      <p className="font-medium text-lg">{payload.pool.dimensions}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Estimated Paver Area (excluding pool)</span>
                      <p className="font-medium text-lg">{calculatePaverArea(payload.pool)} sq ft</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Total Section */}
              <div className="border-2 border-primary rounded-lg p-6 bg-primary/5">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Total Investment</h2>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-primary">
                      ${((payload.pool?.price || 0) + (payload.spa?.price || 0) + (payload.product?.price || 0)).toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">*Prices subject to site evaluation</p>
                  </div>
                </div>
              </div>

              {/* Footer Note */}
              <div className="text-center text-sm text-muted-foreground border-t pt-6">
                <p>This quote is valid for 30 days from the date of issue.</p>
                <p>Final pricing may vary based on site conditions and customization options.</p>
              </div>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default QuotePreview;
