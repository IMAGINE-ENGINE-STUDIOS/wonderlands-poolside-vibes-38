import FlipCart from '@/components/flip/FlipCart';

/**
 * StudioCartWidget — kept as a thin adapter so every suite, the studio, the
 * solar board and the quotation tool render the ONE site cart: the magazine's
 * Order Desk (FlipCart). All former features (pending configuration, feature
 * quantities/options, duplicate warning, checkout, quote) now live there.
 */
interface StudioCartWidgetProps {
  currentPrice: number;
  currentName?: string;
  currentCategory?: string;
  currentExtras?: Array<{
    name: string;
    price: number;
    key?: string;
    quantity?: number;
    selectedOption?: string;
    options?: { name: string; price: number }[];
  }>;
  onRemoveCurrentExtra?: (key?: string) => void;
  onCurrentExtraQuantity?: (key: string | undefined, quantity: number) => void;
  onCurrentExtraOption?: (key: string | undefined, optionName: string) => void;
  onAddCurrent?: () => void;
  onQuote?: () => void;
  onListOpenChange?: (open: boolean) => void;
}

const StudioCartWidget = (p: StudioCartWidgetProps) => (
  <FlipCart
    current={{
      name: p.currentName,
      category: p.currentCategory,
      price: p.currentPrice,
      extras: p.currentExtras,
      onAdd: p.onAddCurrent,
      onRemoveExtra: p.onRemoveCurrentExtra,
      onExtraQuantity: p.onCurrentExtraQuantity,
      onExtraOption: p.onCurrentExtraOption,
    }}
    onQuote={p.onQuote}
    onOpenChange={p.onListOpenChange}
  />
);

export default StudioCartWidget;
