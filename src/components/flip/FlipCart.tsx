import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Minus, Plus, ShoppingBag, Trash2, X, ChevronRight } from "lucide-react";
import { useOptionalShoppingCart } from "@/components/ShoppingCartProvider";

/**
 * FLIP — Order Desk.
 * The Wonderlands Studio cart, re-set in the magazine's editorial format:
 * serif figures, hairline rules, sharp corners. Same underlying cart state as
 * the studio, so anything added here follows the customer to checkout.
 */

const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const FlipCart: React.FC = () => {
  const cart = useOptionalShoppingCart();
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);

  /* Any "Add to the order" control in the magazine opens this desk, so the
     reader always sees where the item landed. */
  React.useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("wl:open-order-desk", onOpen);
    return () => window.removeEventListener("wl:open-order-desk", onOpen);
  }, []);

  if (!cart) return null;

  const { cartItems, getCartCount, getCartTotal, removeFromCart, updateQuantity, removeExtra, clearCart } = cart;
  const count = getCartCount();
  const total = getCartTotal();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open the order desk"
        className="fixed bottom-5 right-5 z-40 flex items-center gap-3 border border-foreground bg-background/90 px-5 py-3.5 shadow-xl backdrop-blur-xl transition-colors hover:bg-foreground hover:text-background"
      >
        <ShoppingBag className="h-4 w-4" />
        <span className="text-[9px] uppercase tracking-[0.3em]">Order Desk</span>
        <span className="font-serif text-base font-light leading-none">{count ? money(total) : "00"}</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            aria-label="Close the order desk"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
          />
          <aside className="relative flex h-full w-full max-w-md flex-col border-l border-border bg-background animate-fade-in-up">
            <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
              <div>
                <p className="text-[9px] uppercase tracking-[0.35em] text-muted-foreground">Wonderlands World</p>
                <h3 className="mt-1 font-serif text-2xl font-light leading-none">The Order Desk</h3>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center border border-border/60 transition-colors hover:bg-foreground hover:text-background"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-6">
              {!cartItems.length && (
                <p className="py-10 text-[12px] leading-relaxed text-muted-foreground">
                  Nothing selected yet. Add a model from any page of the magazine — every figure includes installation
                  at your home address.
                </p>
              )}

              {cartItems.map((item, i) => {
                const extras = item.extras ?? [];
                const line = (item.price + extras.reduce((s, e) => s + e.price, 0)) * item.quantity;
                return (
                  <article key={item.id} className="border-b border-border/60 py-5">
                    <div className="flex gap-4">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          loading="lazy"
                          decoding="async"
                          className="h-20 w-20 shrink-0 object-cover"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
                          {String(i + 1).padStart(2, "0")} — {item.category}
                        </p>
                        <h4 className="mt-1 truncate font-serif text-lg font-light leading-snug">{item.name}</h4>
                        <div className="mt-2 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              aria-label="Decrease quantity"
                              className="flex h-7 w-7 items-center justify-center border border-border/60 transition-colors hover:bg-foreground hover:text-background"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="min-w-6 text-center text-[11px] tracking-[0.2em]">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              aria-label="Increase quantity"
                              className="flex h-7 w-7 items-center justify-center border border-border/60 transition-colors hover:bg-foreground hover:text-background"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              aria-label="Remove item"
                              className="ml-1 flex h-7 w-7 items-center justify-center border border-border/60 text-muted-foreground transition-colors hover:bg-foreground hover:text-background"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                          <p className="font-serif text-lg font-light">{money(line)}</p>
                        </div>
                      </div>
                    </div>

                    {!!extras.length && (
                      <ul className="mt-3">
                        {extras.map((e, ei) => (
                          <li
                            key={`${e.name}-${ei}`}
                            className="flex items-baseline justify-between gap-3 border-t border-border/50 py-1.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
                          >
                            <span className="truncate">{e.selectedOption ?? e.name}</span>
                            <span className="flex shrink-0 items-center gap-3">
                              {money(e.price)}
                              <button
                                onClick={() => removeExtra(item.id, ei)}
                                aria-label={`Remove ${e.name}`}
                                className="transition-colors hover:text-foreground"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </article>
                );
              })}
            </div>

            <div className="border-t border-border px-6 py-5">
              <div className="flex items-baseline justify-between">
                <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">Total — {count} items</p>
                <p className="font-serif text-3xl font-light leading-none">{money(total)}</p>
              </div>
              <p className="mt-2 text-[9px] uppercase tracking-[0.25em] text-muted-foreground">
                Price includes installation at your home address
              </p>
              <div className="mt-4 grid gap-2">
                <button
                  onClick={() => {
                    setOpen(false);
                    navigate("/checkout");
                  }}
                  disabled={!cartItems.length}
                  className="inline-flex items-center justify-between border border-foreground bg-foreground px-4 py-3 text-[10px] uppercase tracking-[0.3em] text-background transition-colors hover:bg-background hover:text-foreground disabled:opacity-40"
                >
                  Proceed to checkout
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => {
                    setOpen(false);
                    navigate("/studio");
                  }}
                  className="inline-flex items-center justify-between border border-border px-4 py-3 text-[10px] uppercase tracking-[0.3em] transition-colors hover:bg-foreground hover:text-background"
                >
                  Configure in the studio
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
                {!!cartItems.length && (
                  <button
                    onClick={clearCart}
                    className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Clear the order
                  </button>
                )}
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};

export default FlipCart;
