import { memo, useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

const titleCase = (value: string) =>
  value
    .replace(/[-_]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

const readSubcategory = (product: any): string | undefined => {
  const raw = product?.subcategory ?? product?.collection ?? product?.brand ?? product?.category;
  if (!raw || typeof raw !== 'string') return undefined;
  const trimmed = raw.trim();
  if (!trimmed || /^per (sq ?ft|linear ft|ft)$/i.test(trimmed)) return undefined;
  return titleCase(trimmed);
};

export interface StudioLandingCategory {
  value: string;
  label: string;
  icon: React.ElementType;
}

interface StudioLandingCanvasProps<TProduct> {
  products: TProduct[];
  categories: StudioLandingCategory[];
  activeCategory: string;
  activeCategoryLabel: string;
  onSelectCategory: (value: string) => void;
  onSelectProduct: (product: TProduct) => void;
  onAddProduct: (product: TProduct) => void;
  getPrice: (product: TProduct) => number;
  getLabel: (product: TProduct) => string | undefined;
  /** Reserved space so the centered search field can float above the gallery */
  searchReservedHeight?: number;
}

function StudioLandingCanvasInner<TProduct extends { image?: string; model?: string; name?: string }>({
  products,
  categories,
  activeCategory,
  activeCategoryLabel,
  onSelectCategory,
  onSelectProduct,
  onAddProduct,
  getPrice,
  getLabel,
  searchReservedHeight = 110,
}: StudioLandingCanvasProps<TProduct>) {
  const sorted = [...products].sort((a, b) => getPrice(a) - getPrice(b));

  return (
    <div className="rounded-xl border border-border/60 bg-background/60 backdrop-blur-sm p-4 sm:p-8">
      {/* Space held for the centered search field */}
      <div style={{ height: searchReservedHeight }} aria-hidden />

      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Design your {activeCategoryLabel.toLowerCase()}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Pick a model to open the configurator, then shape finishes, features and pricing in real time.
        </p>
      </div>

      {/* Category shortcuts */}
      <div className="mt-5 flex flex-wrap justify-center gap-2 hidden">
        {categories.map(cat => {
          const Icon = cat.icon;
          const active = cat.value === activeCategory;
          return (
            <button
              key={cat.value}
              type="button"
              onClick={() => onSelectCategory(cat.value)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                active
                  ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                  : 'border-border bg-background hover:border-primary/50 hover:text-primary'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Gallery */}
      {sorted.length === 0 ? (
        <p className="mt-10 text-center text-sm text-muted-foreground">
          No models in this category yet — use the search above to explore the catalog.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {sorted.map((product, index) => {
            const title = product.model || product.name || 'Product';
            const label = getLabel(product);
            return (
              <div
                key={`${title}-${index}`}
                role="button"
                tabIndex={0}
                onClick={() => onSelectProduct(product)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectProduct(product);
                  }
                }}
                className="group p-3 rounded-lg border border-border hover:border-primary/50 hover:shadow-md transition-all duration-200 cursor-pointer bg-background text-left"
              >
                <div className="product-media-frame aspect-[4/3] rounded-md overflow-hidden">
                  {product.image ? (
                    <img
                      loading="lazy"
                      decoding="async"
                      src={product.image}
                      alt={title}
                      className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  ) : null}
                </div>
                <div className="mt-2 flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{title}</h4>
                    <p className="text-xs text-muted-foreground">
                      ${getPrice(product).toLocaleString()}
                    </p>
                    {label && (
                      <Badge variant="secondary" className="text-xs mt-1">
                        {label}
                      </Badge>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      onAddProduct(product);
                    }}
                    aria-label={`Add ${title} to cart`}
                    className="shrink-0 h-8 w-8 rounded-full flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export const StudioLandingCanvas = memo(StudioLandingCanvasInner) as typeof StudioLandingCanvasInner;
export default StudioLandingCanvas;
