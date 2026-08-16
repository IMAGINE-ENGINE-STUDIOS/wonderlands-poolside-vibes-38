/**
 * Genius selection control — spoken and typed commands over the shopping cart.
 * Parsed locally; no paid service is involved.
 */

export interface GeniusCartAdapter {
  items: { id: string; name: string; price: number; quantity?: number }[];
  total: number;
  add: () => string;
  remove: (name: string) => string;
  clear: () => string;
  checkout: () => string;
}

export type GeniusCartCommand =
  | { kind: 'add' }
  | { kind: 'remove'; name: string }
  | { kind: 'clear' }
  | { kind: 'summary' }
  | { kind: 'checkout' };

export function parseGeniusCartCommand(text: string): GeniusCartCommand | null {
  const t = text.toLowerCase().replace(/[’']/g, '').replace(/\s+/g, ' ').trim();

  if (/\b(add (this|it|that)|add to (my )?(cart|selection)|i want (this|it)|include (this|it))\b/.test(t)) {
    return { kind: 'add' };
  }
  const remove = t.match(/\b(?:remove|take out|drop|delete|get rid of)\s+(?:the\s+)?(.+?)(?:\s+from .*)?$/);
  if (remove && !/\b(everything|all|cart|selection)\b/.test(remove[1])) {
    return { kind: 'remove', name: remove[1].trim() };
  }
  if (/\b(empty|clear|start over with)\b.*\b(cart|selection)\b/.test(t) || /\bremove everything\b/.test(t)) {
    return { kind: 'clear' };
  }
  if (/\b(what(s| is) in (my )?(cart|selection)|my (cart|selection)|whats my total|how much (is it )?(all|in total)|total so far)\b/.test(t)) {
    return { kind: 'summary' };
  }
  if (/\b(check ?out|place (my )?order|pay|financing|finance (it|this))\b/.test(t)) return { kind: 'checkout' };

  return null;
}

const money = (n: number) => `$${Math.round(n).toLocaleString()}`;

export function runGeniusCartCommand(text: string, cart: GeniusCartAdapter | null): string | null {
  const command = parseGeniusCartCommand(text);
  if (!command) return null;
  if (!cart) return 'Your selection is not open on this screen — open the studio or the book and I will keep it for you.';

  switch (command.kind) {
    case 'add':
      return cart.add();
    case 'remove':
      return cart.remove(command.name);
    case 'clear':
      return cart.clear();
    case 'summary':
      if (!cart.items.length) return 'Your selection is empty so far. Say "add this" on anything you like.';
      return `${cart.items.map((i) => i.name).join(', ')} — ${money(cart.total)} all in, delivery and installation included.`;
    case 'checkout':
      return cart.checkout();
  }
}
