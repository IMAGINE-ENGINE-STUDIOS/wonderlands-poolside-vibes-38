import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";
import { FeatureTileCarousel } from "@/components/product/FeatureTileCarousel";
import { getProductFeatures, type ProductType, type FeatureConfig } from '@/config/productFeatures';

interface DynamicFeatureRendererProps {
  productType: ProductType;
  selectedExtras: any;
  onExtrasChange: (extras: any) => void;
  /** Feature ids the host card already renders itself (avoids duplicates). */
  excludeIds?: string[];
}

export function DynamicFeatureRenderer({ productType, selectedExtras, onExtrasChange, excludeIds }: DynamicFeatureRendererProps) {
  const features = excludeIds?.length
    ? getProductFeatures(productType).filter(f => !excludeIds.includes(f.id))
    : getProductFeatures(productType);

  /* accordion: only one option group is expanded at a time, exactly like the
     pool cards — every group starts retracted and drops open on click */
  const [openSection, setOpenSection] = useState<string | null>(null);
  const toggleSection = (id: string) => setOpenSection(prev => (prev === id ? null : id));

  const fmt = (n: number) => `$${n.toLocaleString()}`;


  const renderFeature = (feature: FeatureConfig) => {
    switch (feature.type) {
      case 'boolean':
        /* single on/off features are grouped into one tile carousel below */
        return null;

      case 'selection': {
        const selectedName = selectedExtras[feature.id];
        const selectedOption = feature.options?.find(o => o.name === selectedName);
        const choices = feature.options?.filter(opt => opt.name !== 'None') ?? [];
        const isOpen = openSection === feature.id;
        return (
          <div key={feature.id} className="border-b border-border/60 pb-3">
            {/* header doubles as the accordion trigger — retracted until clicked */}
            <button
              type="button"
              onClick={() => toggleSection(feature.id)}
              aria-expanded={isOpen}
              className="w-full flex items-baseline justify-between gap-3 text-left py-1"
            >
              <div className="min-w-0">
                <Label className="text-sm font-semibold cursor-pointer">{feature.label}</Label>
                {feature.description && (
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                )}
              </div>
              <span className="flex items-center gap-2 shrink-0">
                {selectedOption && selectedOption.name !== 'None' ? (
                  <span className="text-xs font-semibold text-primary">
                    {selectedOption.price > 0 ? `+${fmt(selectedOption.price)}` : 'Included'}
                  </span>
                ) : choices.some(o => o.price > 0) ? (
                  <span className="text-xs text-muted-foreground">
                    from {fmt(Math.min(...choices.filter(o => o.price > 0).map(o => o.price)))}
                  </span>
                ) : null}
                <ChevronDown
                  className={`h-4 w-4 text-muted-foreground transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                />
              </span>
            </button>

            {/* option tiles — identical format to Screen Enclosure; click again to remove */}
            {isOpen && choices.length > 0 && (
              <div className="mt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                <FeatureTileCarousel
                  tiles={choices.map((option, idx) => ({
                    key: `${feature.id}-${option.name}-${idx}`,
                    name: option.name,
                    image: option.image,
                    priceLabel: option.price > 0 ? `+$${option.price.toLocaleString()}` : 'Included',
                    selected: selectedExtras[feature.id] === option.name,
                    onSelect: () =>
                      onExtrasChange({
                        ...selectedExtras,
                        [feature.id]: selectedExtras[feature.id] === option.name ? 'None' : option.name,
                      }),
                  }))}
                />
              </div>
            )}
          </div>
        );
      }


      case 'quantity':
        return (
          <div key={feature.id}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <Label className="text-sm font-medium">{feature.label}</Label>
                {feature.description && (
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                )}
              </div>
              <Input
                type="number"
                min={0}
                value={selectedExtras[feature.id] ?? ''}
                placeholder="0"
                onChange={(e) => {
                  const value = e.target.value === '' ? undefined : parseInt(e.target.value);
                  onExtrasChange({
                    ...selectedExtras,
                    [feature.id]: value
                  });
                }}
                className="w-20"
              />
            </div>
          </div>
        );

      case 'area':
        return (
          <div key={feature.id}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <Label className="text-sm font-medium">{feature.label}</Label>
                {feature.description && (
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                )}
                {!!feature.pricePerUnit && (
                  <p className="text-xs font-semibold text-primary">{fmt(feature.pricePerUnit)} / sq ft</p>
                )}
              </div>
              <div className="flex items-center gap-2">

                <Input
                  type="number"
                  min={0}
                  value={selectedExtras[feature.id] ?? ''}
                  placeholder="0"
                  onChange={(e) => {
                    const value = e.target.value === '' ? undefined : parseInt(e.target.value);
                    onExtrasChange({
                      ...selectedExtras,
                      [feature.id]: value
                    });
                  }}
                  className="w-24"
                />
                <span className="text-xs text-muted-foreground">sq ft</span>
              </div>
            </div>
          </div>
        );

      case 'nested':
        // Handle nested features (e.g., spa with sub-features)
        const isParentEnabled = selectedExtras[feature.id];
        return (
          <div key={feature.id}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <Label className="text-sm font-medium">{feature.label}</Label>
                {feature.description && (
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                )}
              </div>
              <Checkbox
                checked={isParentEnabled}
                onCheckedChange={(checked) => {
                  onExtrasChange({
                    ...selectedExtras,
                    [feature.id]: !!checked
                  });
                }}
              />
            </div>
            {isParentEnabled && feature.subFeatures && (
              <div className="ml-4 space-y-4 mt-4 p-4 bg-muted/30 rounded-lg border border-border">
                {feature.subFeatures.map(subFeature => renderFeature(subFeature))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  /* on/off extras all share one carousel so they read exactly like the
     Screen Enclosure tiles instead of a long checkbox list */
  const booleanFeatures = features.filter(f => f.type === 'boolean');
  const otherFeatures = features.filter(f => f.type !== 'boolean');

  return (
    <div className="space-y-3">
      {otherFeatures.map(feature => renderFeature(feature))}

      {booleanFeatures.length > 0 && (
        <div className="border-b border-border/60 pb-3">
          <button
            type="button"
            onClick={() => toggleSection('__additional__')}
            aria-expanded={openSection === '__additional__'}
            className="w-full flex items-baseline justify-between gap-3 text-left py-1"
          >
            <div className="min-w-0">
              <Label className="text-sm font-semibold cursor-pointer">Additional Features</Label>
              <p className="text-xs text-muted-foreground">Tap a tile to add or remove it</p>
            </div>
            <ChevronDown
              className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-300 ${
                openSection === '__additional__' ? 'rotate-180' : ''
              }`}
            />
          </button>
          {openSection === '__additional__' && (
            <div className="mt-2 animate-in fade-in slide-in-from-top-1 duration-200">
              <FeatureTileCarousel
                tiles={booleanFeatures.map(f => ({
                  key: f.id,
                  name: f.label,
                  image: f.image,
                  priceLabel: f.basePrice ? `+${fmt(f.basePrice)}` : 'Included',
                  selected: !!selectedExtras[f.id],
                  onSelect: () => onExtrasChange({ ...selectedExtras, [f.id]: !selectedExtras[f.id] }),
                }))}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
