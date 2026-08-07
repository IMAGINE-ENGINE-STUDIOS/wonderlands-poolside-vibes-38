import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useShoppingCart } from '@/components/ShoppingCartProvider';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Minus, Plus, Trash2, AlertTriangle, FileText, X, CreditCard, Plus as PlusIcon } from 'lucide-react';

interface StudioCartWidgetProps {
  /** Price of the configuration currently open in the studio (not yet in the cart) */
  currentPrice: number;
  /** Name of the configuration currently open */
  currentName?: string;
  /** Category of the configuration currently open */
  currentCategory?: string;
  /** Features/extras of the configuration currently open */
  currentExtras?: Array<{ name: string; price: number; key?: string; quantity?: number }>;
  /** Removes one feature from the currently open configuration */
  onRemoveCurrentExtra?: (key?: string) => void;
  /** Updates the quantity of a feature in the currently open configuration */
  onCurrentExtraQuantity?: (key: string | undefined, quantity: number) => void;
  /** Adds the currently open configuration to the cart */
  onAddCurrent?: () => void;
  /** Opens the quote widget */
  onQuote?: () => void;
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
  onAddCurrent,
  onQuote,
}: StudioCartWidgetProps) => {
  const {
    cartItems,
    getCartTotal,
    getCartCount,
    getDuplicateCategories,
    removeFromCart,
    updateQuantity,
    removeExtra,
    clearCart,
  } = useShoppingCart();

  const cartTotal = getCartTotal();
  const isCurrentInCart = React.useMemo(
    () => cartItems.some(item => item.name === currentName),
    [cartItems, currentName]
  );
  const pendingPrice = isCurrentInCart ? 0 : currentPrice;
  const storeTotal = cartTotal + pendingPrice;
  const duplicates = getDuplicateCategories();
  const total = money(storeTotal);

  const itemTotal = (price: number, extras: { price: number }[] | undefined, quantity: number) =>
    (price + (extras || []).reduce((sum, e) => sum + e.price, 0)) * quantity;

  return (
    <div className="border-b bg-gradient-to-r from-primary/10 to-teal/10 p-3 space-y-2">
      <div className="text-center">
        <div className="text-xl font-bold">
          <span className="text-primary">{total.whole}</span>
          <span className="text-foreground">{total.cents}</span>
        </div>
        <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center justify-center gap-1">
          Total Configuration Price
          <span className="text-muted-foreground/70">
            ({getCartCount() + (pendingPrice > 0 ? 1 : 0)} items)
          </span>
          {duplicates.length > 0 && (
            <AlertTriangle className="h-3 w-3 text-coral" />
          )}
        </p>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1 text-[11px]" onClick={onQuote}>
          <FileText className="h-3 w-3 mr-1" /> Quote
        </Button>
        <Button
          size="sm"
          className="flex-1 text-[11px]"
          onClick={() => navigate('/checkout')}
        >
          <CreditCard className="h-3 w-3 mr-1" /> Checkout
        </Button>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="w-full flex items-center justify-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors py-1"
          >
            View Shopping List
            <ChevronDown className="h-3 w-3" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="w-[19rem] p-0 bg-popover text-popover-foreground border shadow-xl z-50 backdrop-blur-none opacity-100">
          <div className="flex items-center justify-between px-3 py-2 border-b">
            <span className="text-sm font-semibold">Shopping List</span>
            {cartItems.length > 0 && (
              <Button variant="ghost" size="sm" className="h-6 text-[11px]" onClick={clearCart}>
                Clear all
              </Button>
            )}
          </div>

          {duplicates.length > 0 && (
            <div className="flex items-start gap-2 px-3 py-2 bg-coral/10 border-b text-[11px]">
              <AlertTriangle className="h-3.5 w-3.5 text-coral shrink-0 mt-0.5" />
              <span>
                Multiple items selected in: <strong>{duplicates.join(', ')}</strong>
              </span>
            </div>
          )}

          <div className="max-h-80 overflow-y-auto divide-y bg-popover">
            {cartItems.map(item => {
              const flagged = duplicates.includes(item.category || 'Other');
              return (
                <div key={item.id} className="p-3 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate">{item.name}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        {item.category && (
                          <Badge variant="outline" className="text-[9px] px-1 py-0">
                            {item.category}
                          </Badge>
                        )}
                        {flagged && (
                          <Badge className="text-[9px] px-1 py-0 bg-coral text-white">
                            Duplicate category
                          </Badge>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      className="text-destructive shrink-0"
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {item.extras && item.extras.length > 0 && (
                    <div className="rounded-md bg-muted/60 border p-1.5 space-y-1">
                      <p className="text-[9px] uppercase tracking-wide text-muted-foreground">
                        Features
                      </p>
                      {item.extras.map((extra, idx) => (
                        <div
                          key={`${item.id}-${extra.name}-${idx}`}
                          className="flex items-center justify-between gap-2"
                        >
                          <span className="text-[11px] truncate">{extra.name}</span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[11px] font-medium">
                              ${extra.price.toLocaleString()}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeExtra(item.id, idx)}
                              className="text-muted-foreground hover:text-destructive"
                              aria-label={`Remove ${extra.name}`}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-6 text-center text-xs font-medium">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 w-6 p-0"
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
              <div className="p-3 space-y-1.5 bg-muted">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate">{currentName || 'Current configuration'}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {currentCategory && (
                        <Badge variant="outline" className="text-[9px] px-1 py-0">
                          {currentCategory}
                        </Badge>
                      )}
                      <span className="text-[9px] text-muted-foreground">Not added yet</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold shrink-0">
                    ${pendingPrice.toLocaleString()}
                  </span>
                </div>
                {currentExtras.length > 0 && (
                  <div className="rounded-md bg-background border p-1.5 space-y-1">
                    <p className="text-[9px] uppercase tracking-wide text-muted-foreground">
                      Features
                    </p>
                    {currentExtras.map((extra, idx) => (
                      <div
                        key={`${extra.key || extra.name}-${idx}`}
                        className="flex items-center justify-between gap-2"
                      >
                        <span className="text-[11px] truncate">{extra.name}</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {typeof extra.quantity === 'number' && onCurrentExtraQuantity && (
                            <div className="flex items-center gap-0.5">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-5 w-5 p-0"
                                onClick={() => onCurrentExtraQuantity(extra.key, (extra.quantity || 0) - 1)}
                              >
                                <Minus className="h-2.5 w-2.5" />
                              </Button>
                              <span className="w-4 text-center text-[10px] font-medium">
                                {extra.quantity}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-5 w-5 p-0"
                                onClick={() => onCurrentExtraQuantity(extra.key, (extra.quantity || 0) + 1)}
                              >
                                <Plus className="h-2.5 w-2.5" />
                              </Button>
                            </div>
                          )}
                          <span className="text-[11px] font-medium">
                            ${extra.price.toLocaleString()}
                          </span>
                          {onRemoveCurrentExtra && (
                            <button
                              type="button"
                              onClick={() => onRemoveCurrentExtra(extra.key)}
                              className="text-muted-foreground hover:text-destructive"
                              aria-label={`Remove ${extra.name}`}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {onAddCurrent && (
                  <Button variant="outline" size="sm" className="h-7 w-full text-[11px]" onClick={onAddCurrent}>
                    <PlusIcon className="h-3 w-3 mr-1" /> Add to shopping list
                  </Button>
                )}
              </div>
            )}

            {cartItems.length === 0 && pendingPrice === 0 && (
              <p className="p-4 text-center text-xs text-muted-foreground">
                Your shopping list is empty
              </p>
            )}
          </div>

          <Separator />

          <div className="p-3 space-y-2">
            <div className="flex items-center justify-between text-sm font-bold">
              <span>Store Total</span>
              <span>
                <span className="text-primary">{total.whole}</span>
                <span className="text-foreground">{total.cents}</span>
              </span>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default StudioCartWidget;
