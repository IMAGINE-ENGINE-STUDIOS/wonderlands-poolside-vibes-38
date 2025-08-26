
import ImageCard from "@/components/ImageCard";

interface QuotePayload {
  type: string;
  pool?: any;
  spa?: any;
  product?: any;
  extras?: any;
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
  };
}

const parseDims = (dims?: string) => {
  if (!dims) return { w: 0, l: 0, text: "" };
  const cleaned = dims.replace(/[′″']/g, "");
  const parts = cleaned.split(/[×x]/).map((p) => parseFloat(p.trim()));
  const [w, l] = parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1]) ? [parts[0], parts[1]] : [0, 0];
  return { w, l, text: dims };
};

const formatCurrency = (n: number) => `$${(n || 0).toLocaleString()}`;

type Item = { name: string; price?: number; image?: string; description?: string };

const collectItems = (payload: QuotePayload): Item[] => {
  const items: Item[] = [];
  // Common places where selections may live
  const candidates = [
    payload.extras?.items,
    payload.extras?.selected,
    payload.product?.selectedItems,
    payload.product?.selectedOptions,
    payload.product?.items,
  ].filter(Boolean);

  for (const arr of candidates) {
    if (Array.isArray(arr)) {
      for (const it of arr) {
        const name = it?.name || it?.title || it?.label || "Item";
        const price = Number(it?.price || it?.cost || 0);
        const image = it?.image || it?.img || it?.thumbnail;
        const description = it?.description || it?.desc || "";
        items.push({ name, price, image, description });
      }
    }
  }

  // Include spa or screen enclosure if present as an item
  if (payload.spa?.model || payload.spa?.name) {
    items.push({
      name: payload.spa?.model || payload.spa?.name,
      price: Number(payload.spa?.price || 0),
      image: payload.spa?.image,
      description: payload.spa?.description || "",
    });
  }

  if (payload.product?.name && !candidates.length) {
    // If product is a single item product
    items.push({
      name: payload.product?.name,
      price: Number(payload.product?.price || 0),
      image: payload.product?.image,
      description: payload.product?.description || "",
    });
  }

  return items;
};

const calcTotals = (payload: QuotePayload) => {
  const poolPrice = Number(payload.pool?.price || 0);
  const items = collectItems(payload);
  const itemsTotal = items.reduce((sum, it) => sum + Number(it.price || 0), 0);
  const extrasTotal = Number(payload.extras?.extrasTotal || 0);
  const total = poolPrice + itemsTotal + extrasTotal;
  return { poolPrice, items, itemsTotal, extrasTotal, total };
};

const QuotationHeader = () => (
  <div className="rounded-xl border bg-gradient-to-r from-orange/20 via-primary/20 to-teal/20 p-6 md:p-8">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-primary tracking-tight">POOL QUOTATION</h1>
        <p className="text-muted-foreground">Your Dream Pool Awaits</p>
      </div>
      <div className="text-sm text-muted-foreground">
        <p>Quote Date: {new Date().toLocaleDateString()}</p>
        <p>Valid for 30 days</p>
      </div>
    </div>
  </div>
);

const QuoteCard = ({ payload }: { payload: QuotePayload }) => {
  const { poolPrice, items, itemsTotal, extrasTotal, total } = calcTotals(payload);
  const pool = payload.pool;
  const { text: dimsText } = parseDims(pool?.dimensions);

  return (
    <section id="quote-content" className="rounded-lg border bg-card text-card-foreground shadow-lg p-6 md:p-8 space-y-8">
      <QuotationHeader />

      {/* Customer + Contact */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-xl border p-5 bg-background/60">
          <h3 className="text-xl font-semibold text-orange mb-3">Customer Information</h3>
          <div className="space-y-1 text-sm">
            <p><span className="font-medium">Name:</span> {payload.customer?.name || "-"}</p>
            <p><span className="font-medium">Email:</span> {payload.customer?.email || "-"}</p>
            <p><span className="font-medium">Phone:</span> {payload.customer?.phone || "-"}</p>
            <p><span className="font-medium">Property Address:</span> {payload.customer?.address || "-"}</p>
          </div>
        </div>
        <div className="rounded-xl border p-5 bg-background/60">
          <h3 className="text-xl font-semibold text-teal mb-3">Contact Information</h3>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>(407) 760-4873</p>
            <p>sales@wonderlandsworld.com</p>
            <p>Business Hours: Mon–Fri 8AM–6PM, Sat 9AM–4PM</p>
          </div>
        </div>
      </div>

      {/* Pool Specs */}
      {pool && (
        <div>
          <h2 className="text-2xl font-semibold text-orange mb-4">Pool Specifications</h2>
          <div className="grid md:grid-cols-2 gap-6 items-stretch">
            <div className="rounded-xl border p-5 bg-gradient-to-br from-primary/10 to-teal/10">
              <div className="space-y-2">
                <p className="text-lg"><span className="font-semibold">Pool Model:</span> {pool.model}</p>
                <p className="text-muted-foreground">Dimensions: {dimsText || "-"}</p>
                {pool.depth && <p className="text-muted-foreground">Depth: {pool.depth}</p>}
                <div className="pt-2">
                  <p className="font-semibold">Base Pool Price: <span className="text-2xl font-bold text-primary">{formatCurrency(poolPrice)}</span></p>
                </div>
              </div>
            </div>
            {pool.image && (
              <div className="rounded-xl overflow-hidden border bg-background">
                <div className="aspect-video">
                  <ImageCard src={pool.image} alt={pool.model} className="w-full h-full" enableZoom={false} />
                </div>
                <div className="text-center text-sm text-muted-foreground py-2">{pool.model}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Added Features */}
      {items.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xl font-semibold">Added Features from Product Card</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((it, idx) => (
              <div key={idx} className="rounded-lg border bg-background/60 p-3">
                <div className="rounded-md overflow-hidden border bg-background mb-3">
                  <div className="aspect-[4/3]">
                    <ImageCard src={it.image} alt={it.name} className="w-full h-full" enableZoom={false} />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="font-medium">{it.name}</p>
                  {it.description && <p className="text-sm text-muted-foreground line-clamp-3">{it.description}</p>}
                  {typeof it.price === "number" && (
                    <p className="text-right font-semibold">+{formatCurrency(it.price)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="text-right text-sm text-muted-foreground">
            Total Added Features: <span className="font-semibold text-foreground">{formatCurrency(itemsTotal + extrasTotal)}</span>
          </div>
        </div>
      )}

      {/* All pools include */}
      <div className="rounded-xl border p-5 bg-gradient-to-r from-teal/10 via-primary/10 to-orange/10">
        <p className="font-bold text-orange uppercase tracking-wide">All pools include</p>
        <p className="text-sm mt-1">LED lights, Water pump, Waterfall, Salt system</p>
        <p className="text-xs text-muted-foreground">FREE Finish of choice (included in pool price - promotional offer)</p>
      </div>

      {/* Total Investment */}
      <div className="rounded-2xl p-6 md:p-8 bg-gradient-to-r from-orange to-primary to-80% text-white">
        <p className="text-2xl md:text-3xl font-bold mb-1">Total Investment</p>
        <p className="text-4xl md:text-5xl font-extrabold">{formatCurrency(total)}</p>
        <p className="text-sm mt-2 opacity-90">Complete installation including permits, excavation, and all selected features</p>
      </div>

      <div className="text-center text-sm text-muted-foreground border-t pt-6">
        <p>This quote is valid for 30 days from the date of issue.</p>
        <p>Final pricing may vary based on site conditions and customization options.</p>
      </div>
    </section>
  );
};

export default QuoteCard;
