import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useShoppingCart } from '@/components/ShoppingCartProvider';
import { useNavigate } from 'react-router-dom';
import { usePersistentState } from '@/hooks/usePersistentState';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import {
  ChevronDown,
  Minus,
  Plus,
  Trash2,
  AlertTriangle,
  X,
  CreditCard,
  Plus as PlusIcon,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';

interface StudioCartWidgetProps {
  /** Price of the configuration currently open in the studio (not yet in the cart) */
  currentPrice: number;
  /** Name of the configuration currently open */
  currentName?: string;
  /** Category of the configuration currently open */
  currentCategory?: string;
  /** Features/extras of the configuration currently open */
  currentExtras?: Array<{
    name: string;
    price: number;
    key?: string;
    quantity?: number;
    selectedOption?: string;
    options?: { name: string; price: number }[];
  }>;
  /** Removes one feature from the currently open configuration */
  onRemoveCurrentExtra?: (key?: string) => void;
  /** Updates the quantity of a feature in the currently open configuration */
  onCurrentExtraQuantity?: (key: string | undefined, quantity: number) => void;
  /** Switches the selected option of a feature in the currently open configuration */
  onCurrentExtraOption?: (key: string | undefined, optionName: string) => void;
  /** Adds the currently open configuration to the cart */
  onAddCurrent?: () => void;
  /** Opens the quote widget */
  onQuote?: () => void;
  /** Notifies the parent when the shopping list panel opens/closes */
  onListOpenChange?: (open: boolean) => void;
}

const money = (value: number) => ({
  whole: `$${Math.floor(value).toLocaleString()}`,
  cents: (value % 1).toFixed(2).substring(1),
});

const StudioCartWidget = ({
  currentPrice,
  currentName,
  currentCategory,
  currentExtras = [],
  onRemoveCurrentExtra,
  onCurrentExtraQuantity,
  onCurrentExtraOption,
  onAddCurrent,
  onQuote,
  onListOpenChange,
}: StudioCartWidgetProps) => {
  const {
    cartItems,
    getCartTotal,
    getCartCount,
    getDuplicateCategories,
    removeFromCart,
    updateQuantity,
    removeExtra,
    updateExtra,
    clearCart,
  } = useShoppingCart();
  const navigate = useNavigate();
  const [open, setOpenState] = usePersistentState('studio_cartWidgetOpen', false);
  const setOpen = React.useCallback(
    (next: boolean) => {
      setOpenState(next);
      onListOpenChange?.(next);
    },
    [onListOpenChange, setOpenState]
  );

  // Re-sync the parent with the restored (cached) panel state after a reload.
  React.useEffect(() => {
    onListOpenChange?.(open);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cartTotal = getCartTotal();
  const isCurrentInCart = React.useMemo(
    () => cartItems.some((item) => item.name === currentName),
    [cartItems, currentName]
  );
  const pendingPrice = isCurrentInCart ? 0 : currentPrice;
  const storeTotal = cartTotal + pendingPrice;
  const duplicates = getDuplicateCategories();
  const total = money(storeTotal);

  const itemTotal = (
    price: number,
    extras: { price: number }[] | undefined,
    quantity: number
  ) => (price + (extras || []).reduce((sum, e) => sum + e.price, 0)) * quantity;

  const hasItems = cartItems.length > 0 || pendingPrice > 0;

  return (
    <div className="relative rounded-2xl border border-border/50 bg-background/45 p-4 shadow-[0_8px_32px_-8px_hsl(var(--primary)/0.22)] backdrop-blur-2xl space-y-4 overflow-hidden">
      {/* Ambient glass glow */}
      <div className="pointer-events-none absolute -left-8 -top-8 h-32 w-32 rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-teal/10 blur-3xl" />

      {/* Masthead — FLIP V7 editorial: hairline rules, serif figure, no generic badges */}
      <div className="relative border-y border-foreground/12 py-4 text-center">
        <p className="flex items-center justify-center gap-2 text-[8px] uppercase tracking-[0.42em] text-muted-foreground">
          <Sparkles className="h-2.5 w-2.5 text-primary" />
          Your composition, turnkey
        </p>
        <div className="mt-2 font-serif text-4xl font-light leading-none tracking-tight">
          <span className="text-foreground drop-shadow-[0_0_18px_hsl(var(--primary)/0.28)]">
            {total.whole}
          </span>
          <span className="text-muted-foreground/70 text-2xl align-top">{total.cents}</span>
        </div>
      </div>


      {/* Action buttons */}
      <div className="relative grid grid-cols-1 gap-2">
        <Button
          size="sm"
          onClick={() => {
            if (pendingPrice > 0) onAddCurrent?.();
            navigate('/checkout');
          }}
          className="h-9 bg-gradient-to-r from-primary to-teal text-[11px] font-medium text-primary-foreground shadow-lg shadow-primary/20 hover:brightness-110 transition-all"
        >
          <CreditCard className="h-3.5 w-3.5 mr-1.5" /> Checkout
        </Button>
      </div>

      {/* The selection — editorial toggle */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative w-full flex items-center justify-center gap-2 rounded-lg border border-foreground/12 bg-foreground/[0.03] px-3 py-2 text-[9px] uppercase tracking-[0.32em] text-muted-foreground hover:text-foreground hover:border-primary/35 transition-all"
      >
        {open ? 'Close the selection' : 'Read the selection'}
        <ChevronDown className={`h-3 w-3 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Shopping list panel */}
      {open && (
        <div
          className={cn(
            'relative rounded-xl border border-border/40 bg-background/50 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col',
            isMobile && 'fixed inset-0 z-[60] rounded-none bg-background/95'
          )}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-primary/5">
            <span className="flex items-center gap-2 text-[9px] uppercase tracking-[0.34em] text-muted-foreground">
              <ShoppingBag className="h-3 w-3 text-primary" />
              The Selection
            </span>

            <div className="flex items-center gap-2">
              {cartItems.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-[11px] text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={clearCart}
                >
                  Clear all
                </Button>
              )}
              {isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                  onClick={() => setOpen(false)}
                  aria-label="Close cart"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {duplicates.length > 0 && (
            <div className="flex items-start gap-2 px-4 py-2.5 bg-coral/10 border-b border-coral/20 text-[11px]">
              <AlertTriangle className="h-3.5 w-3.5 text-coral shrink-0 mt-0.5" />
              <span className="text-foreground/90">
                Multiple items selected in: <strong className="text-coral">{duplicates.join(', ')}</strong>
              </span>
            </div>
          )}

          <div
            className={cn(
              'overflow-y-auto custom-scrollbar divide-y divide-border/30',
              isMobile ? 'flex-1' : 'max-h-[min(60vh,420px)]'
            )}
          >
            {cartItems.map((item) => {
              const flagged = duplicates.includes(item.category || 'Other');
              return (
                <div key={item.id} className="p-4 space-y-2 hover:bg-primary/5 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <p className="text-xs font-semibold truncate">{item.name}</p>
                      <div className="flex flex-wrap items-center gap-1">
                        {item.category && (
                          <Badge
                            variant="outline"
                            className="text-[9px] px-1.5 py-0 border-border/50 bg-background/60"
                          >
                            {item.category}
                          </Badge>
                        )}
                        {flagged && (
                          <Badge className="text-[9px] px-1.5 py-0 bg-coral text-primary-foreground">
                            Duplicate category
                          </Badge>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      className="text-muted-foreground hover:text-destructive shrink-0 rounded-md p-1 hover:bg-destructive/10 transition-colors"
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {item.extras && item.extras.length > 0 && (
                    <div className="rounded-lg border border-border/40 bg-background/60 p-2.5 space-y-2">
                      <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-medium">
                        Features
                      </p>
                      {item.extras.map((extra, idx) => (
                        <div key={`${item.id}-${extra.key || extra.name}-${idx}`} className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] truncate">{extra.name}</span>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[11px] font-medium">${extra.price.toLocaleString()}</span>
                              <button
                                type="button"
                                onClick={() => removeExtra(item.id, idx)}
                                className="text-muted-foreground hover:text-destructive rounded p-0.5 hover:bg-destructive/10 transition-colors"
                                aria-label={`Remove ${extra.name}`}
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                          {extra.options && extra.options.length > 1 && (
                            <select
                              value={extra.selectedOption ?? extra.name}
                              onChange={(event) => {
                                const value = event.target.value;
                                if (item.name === currentName && extra.key && onCurrentExtraOption) {
                                  onCurrentExtraOption(extra.key, value);
                                  return;
                                }
                                const next = extra.options?.find((option) => option.name === value);
                                if (next) updateExtra(item.id, idx, next);
                              }}
                              className="w-full h-7 rounded-md border border-border/60 bg-background/70 text-foreground text-[10px] px-2 focus:ring-1 focus:ring-primary/50 focus:border-primary/50"
                              aria-label={`Change ${extra.name}`}
                            >
                              {extra.options.map((option) => (
                                <option key={option.name} value={option.name}>
                                  {option.name}
                                  {option.price > 0 ? ` — $${option.price.toLocaleString()}` : ''}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 p-0 border-border/60 bg-background/60 hover:bg-primary/10 hover:border-primary/40"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-7 text-center text-xs font-medium">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 p-0 border-border/60 bg-background/60 hover:bg-primary/10 hover:border-primary/40"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <span className="text-xs font-bold">
                      ${itemTotal(item.price, item.extras, item.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}

            {pendingPrice > 0 && (
              <div className="p-4 space-y-2 bg-primary/5 border-l-2 border-primary">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate">{currentName || 'Current configuration'}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {currentCategory && (
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-border/50 bg-background/60">
                          {currentCategory}
                        </Badge>
                      )}
                      <span className="text-[9px] text-muted-foreground">Not added yet</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold shrink-0">${pendingPrice.toLocaleString()}</span>
                </div>

                {currentExtras.length > 0 && (
                  <div className="rounded-lg border border-border/40 bg-background/60 p-2.5 space-y-2">
                    <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-medium">Features</p>
                    {currentExtras.map((extra, idx) => (
                      <div key={`${extra.key || extra.name}-${idx}`} className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] truncate">{extra.name}</span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {typeof extra.quantity === 'number' && onCurrentExtraQuantity && (
                              <div className="flex items-center gap-0.5">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-5 w-5 p-0 border-border/60 bg-background/60 hover:bg-primary/10"
                                  onClick={() => onCurrentExtraQuantity(extra.key, (extra.quantity || 0) - 1)}
                                >
                                  <Minus className="h-2.5 w-2.5" />
                                </Button>
                                <span className="w-4 text-center text-[10px] font-medium">{extra.quantity}</span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-5 w-5 p-0 border-border/60 bg-background/60 hover:bg-primary/10"
                                  onClick={() => onCurrentExtraQuantity(extra.key, (extra.quantity || 0) + 1)}
                                >
                                  <Plus className="h-2.5 w-2.5" />
                                </Button>
                              </div>
                            )}
                            <span className="text-[11px] font-medium">${extra.price.toLocaleString()}</span>
                            {onRemoveCurrentExtra && (
                              <button
                                type="button"
                                onClick={() => onRemoveCurrentExtra(extra.key)}
                                className="text-muted-foreground hover:text-destructive rounded p-0.5 hover:bg-destructive/10 transition-colors"
                                aria-label={`Remove ${extra.name}`}
                              >
                                <X className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </div>
                        {extra.options && extra.options.length > 1 && onCurrentExtraOption && (
                          <select
                            value={extra.selectedOption ?? extra.name}
                            onChange={(event) => onCurrentExtraOption(extra.key, event.target.value)}
                            className="w-full h-7 rounded-md border border-border/60 bg-background/70 text-foreground text-[10px] px-2 focus:ring-1 focus:ring-primary/50 focus:border-primary/50"
                            aria-label={`Change ${extra.name}`}
                          >
                            {extra.options.map((option) => (
                              <option key={option.name} value={option.name}>
                                {option.name}
                                {option.price > 0 ? ` — $${option.price.toLocaleString()}` : ''}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {onAddCurrent && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-full text-[11px] border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
                    onClick={onAddCurrent}
                  >
                    <PlusIcon className="h-3.5 w-3.5 mr-1.5" /> Add to shopping list
                  </Button>
                )}
              </div>
            )}

            {!hasItems && (
              <div className="p-6 text-center space-y-2">
                <ShoppingBag className="h-8 w-8 mx-auto text-muted-foreground/40" />
                <p className="text-xs text-muted-foreground">Your shopping list is empty</p>
              </div>
            )}
          </div>

          <Separator className="bg-border/40" />

          <div className="p-4 bg-primary/5">
            <div className="flex items-center justify-between text-sm font-bold">
              <span className="uppercase tracking-wider text-[11px]">CART TOTAL</span>
              <span className="text-lg">
                <span className="text-primary drop-shadow-[0_0_12px_hsl(var(--primary)/0.35)]">
                  {total.whole}
                </span>
                <span className="text-foreground/70">{total.cents}</span>
              </span>
            </div>
            <p className="mt-2 flex items-center justify-center gap-1.5 text-[8px] uppercase tracking-[0.32em] text-muted-foreground">
              <ShoppingBag className="h-2.5 w-2.5" />
              {getCartCount() + (pendingPrice > 0 ? 1 : 0)} pieces · delivered &amp; installed
              {duplicates.length > 0 && <AlertTriangle className="h-2.5 w-2.5 text-coral" />}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudioCartWidget;
