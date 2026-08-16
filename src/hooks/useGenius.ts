import * as React from 'react';
import { toast } from 'sonner';
import { getNarratorContext, type NarratorAction } from '@/lib/narratorStore';
import { geniusRouteMap } from '@/lib/geniusAccess';
import { getAllProducts } from '@/data/poolProductLookup';

const FUNCTIONS_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
const ANON = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

export interface GeniusTurn {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

/** Catalog digest, built once — Genius reads real names, categories and prices. */
let catalogDigest: string | null = null;
function getCatalogDigest() {
  if (catalogDigest) return catalogDigest;
  catalogDigest = getAllProducts()
    .map((p) => {
      const bits = [p.name, p.category, p.price ? `$${p.price.toLocaleString()}` : ''];
      if (p.dimensions) bits.push(p.dimensions);
      if (p.depth) bits.push(p.depth);
      return bits.filter(Boolean).join(' — ');
    })
    .join('\n');
  return catalogDigest;
}

/**
 * Genius — the Wonderlands conversational guide. Holds the conversation, keeps
 * the page context attached, and hands back spoken replies plus action chips.
 */
export function useGenius() {
  const [turns, setTurns] = React.useState<GeniusTurn[]>([]);
  const [actions, setActions] = React.useState<NarratorAction[]>([]);
  const [isThinking, setIsThinking] = React.useState(false);
  const turnsRef = React.useRef<GeniusTurn[]>([]);
  turnsRef.current = turns;

  const ask = React.useCallback(
    async (message: string, cartSummary?: string): Promise<string | null> => {
      const text = message.trim();
      if (!text || isThinking) return null;

      const userTurn: GeniusTurn = { id: `u-${Date.now()}`, role: 'user', content: text };
      setTurns((prev) => [...prev, userTurn]);
      setActions([]);
      setIsThinking(true);

      try {
        const res = await fetch(`${FUNCTIONS_BASE}/genius`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ANON}` },
          body: JSON.stringify({
            messages: [...turnsRef.current, userTurn].map(({ role, content }) => ({ role, content })),
            context: getNarratorContext() ?? { route: window.location.pathname },
            routes: geniusRouteMap(),
            catalog: getCatalogDigest(),
            cart: cartSummary,
          }),
        });

        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { error?: string };
          toast.error(body.error || 'Genius is unavailable right now.');
          return null;
        }

        const data = (await res.json()) as { reply: string; actions?: NarratorAction[] };
        setTurns((prev) => [...prev, { id: `a-${Date.now()}`, role: 'assistant', content: data.reply }]);
        setActions(data.actions ?? []);
        return data.reply;
      } catch {
        toast.error('Genius could not be reached.');
        return null;
      } finally {
        setIsThinking(false);
      }
    },
    [isThinking],
  );

  const reset = React.useCallback(() => {
    setTurns([]);
    setActions([]);
  }, []);

  return { turns, actions, isThinking, ask, reset };
}

export default useGenius;
