import ImageCard from "@/components/ImageCard";

interface QuotePayload {
  type: string;
  pool?: any;
  spa?: any;
  product?: any;
  extras?: any;
}

const parseDims = (dims?: string) => {
  if (!dims) return { w: 0, l: 0 };
  const cleaned = dims.replace(/[′″']/g, '');
  const parts = cleaned.split(/[×x]/).map(p => parseFloat(p.trim()));
  if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return { w: parts[0], l: parts[1] };
  }
  return { w: 0, l: 0 };
};

const paverRingArea = (pool: any) => {
  const { w, l } = parseDims(pool?.dimensions);
  if (!w || !l) return 0;
  const ring = (w + 6) * (l + 6) - (w * l); // 3ft around
  return Math.round(ring);
};

const formatCurrency = (n: number) => `$${(n || 0).toLocaleString()}`;

const QuoteCard = ({ payload }: { payload: QuotePayload }) => {
  const pool = payload.pool;
  const spa = payload.spa;
  const product = payload.product;

  const poolPrice = pool?.price || 0;
  const spaPrice = spa?.price || 0;
  const productPrice = product?.price || 0;
  const extrasTotal = payload.extras?.extrasTotal || 0;
  const total = poolPrice + spaPrice + productPrice + extrasTotal;

  return (
    <section id="quote-content" className="rounded-lg border bg-card text-card-foreground shadow-lg p-6 md:p-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary mb-2">Quotation Card</h1>
        <p className="text-muted-foreground">Your personalized quotation summary</p>
      </div>

      {pool && (
        <div className="border border-border rounded-lg p-6 bg-background/50">
          <h2 className="text-2xl font-semibold text-primary mb-4">Pool</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {pool.image && (
              <div className="aspect-video overflow-hidden rounded-lg">
                <ImageCard src={pool.image} alt={pool.model} className="w-full h-full" enableZoom={false} />
              </div>
            )}
            <div className="space-y-3">
              <div>
                <h3 className="text-xl font-semibold">{pool.model}</h3>
                <p className="text-2xl font-bold text-primary">{formatCurrency(poolPrice)}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Dimensions</span>
                  <p className="font-medium">{pool.dimensions}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Depth</span>
                  <p className="font-medium">{pool.depth}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Install</span>
                  <p className="font-medium">{pool.installationTimeWeeks} weeks</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Warranty</span>
                  <p className="font-medium">{pool.warrantyYears}</p>
                </div>
              </div>
              {pool.features && (
                <ul className="list-disc list-inside text-sm">
                  {pool.features.map((f: string, i: number) => <li key={i}>{f}</li>)}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {spa && (
        <div className="border border-border rounded-lg p-6 bg-background/50">
          <h2 className="text-2xl font-semibold text-primary mb-4">Spa</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {spa.image && (
              <div className="aspect-video overflow-hidden rounded-lg">
                <ImageCard src={spa.image} alt={spa.model} className="w-full h-full" enableZoom={false} />
              </div>
            )}
            <div className="space-y-3">
              <div>
                <h3 className="text-xl font-semibold">{spa.model}</h3>
                <p className="text-2xl font-bold text-primary">{formatCurrency(spaPrice)}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Dimensions</span>
                  <p className="font-medium">{spa.dimensions}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Warranty</span>
                  <p className="font-medium">{spa.warrantyYears}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {product && (
        <div className="border border-border rounded-lg p-6 bg-background/50">
          <h2 className="text-2xl font-semibold text-primary mb-4">Product</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {product.image && (
              <div className="aspect-video overflow-hidden rounded-lg">
                <ImageCard src={product.image} alt={product.name} className="w-full h-full" enableZoom={false} />
              </div>
            )}
            <div className="space-y-3">
              <div>
                <h3 className="text-xl font-semibold">{product.name}</h3>
                <p className="text-2xl font-bold text-primary">{formatCurrency(productPrice)}</p>
              </div>
              {product.description && <p className="text-muted-foreground">{product.description}</p>}
            </div>
          </div>
        </div>
      )}

      {pool && (
        <div className="border border-border rounded-lg p-6 bg-background/50">
          <h2 className="text-2xl font-semibold text-primary mb-4">Paver Area</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <span className="text-sm text-muted-foreground">Pool Dimensions</span>
              <p className="font-medium text-lg">{pool.dimensions}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Estimated Pavers (excluding pool)</span>
              <p className="font-medium text-lg">{paverRingArea(pool)} sq ft</p>
            </div>
          </div>
        </div>
      )}

      <div className="border-2 border-primary rounded-lg p-6 bg-primary/5">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Total Investment</h2>
          <div className="text-right">
            <p className="text-3xl font-bold text-primary">{formatCurrency(total)}</p>
            <p className="text-sm text-muted-foreground">*Prices subject to site evaluation</p>
          </div>
        </div>
      </div>

      <div className="text-center text-sm text-muted-foreground border-t pt-6">
        <p>This quote is valid for 30 days from the date of issue.</p>
        <p>Final pricing may vary based on site conditions and customization options.</p>
      </div>
    </section>
  );
};

export default QuoteCard;
