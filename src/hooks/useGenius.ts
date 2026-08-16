import * as React from 'react';
import { type NarratorAction, type NarratorContext } from '@/lib/narratorStore';
import { resolveGeniusRequest, bookChips } from '@/lib/geniusFlipBrain';
import { flipManifestDigest } from '@/lib/flipPageRegistry';
import { runGeniusDesignCommand } from '@/lib/geniusDesignBus';
import { runGeniusCartCommand, type GeniusCartAdapter } from '@/lib/geniusCartCommands';
import { advanceBooking, isBookingActive, startBooking, wantsAppointment } from '@/lib/geniusBooking';
import { supabase } from '@/integrations/supabase/client';

export interface GeniusTurn {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface GeniusOptions {
  /** What the guest is looking at, published by the page */
  context?: NarratorContext | null;
  /** The live selection, so Genius can adjust it by voice */
  cart?: GeniusCartAdapter | null;
}

/**
 * Genius — the Wonderlands guide and concierge.
 *
 * Every turn runs through one pipeline, cheapest first:
 *   1. an appointment already being booked,
 *   2. a request to book one,
 *   3. a design instruction for the open drawing board,
 *   4. a selection instruction (add, remove, total, checkout),
 *   5. the local FLIP brain — page turns, editions, prices, options,
 *   6. and only when none of those fit, live support through the `genius`
 *      function so a free-form question still gets a real answer.
 *
 * Steps 1–5 are composed in the browser and cost nothing; voice is the only
 * billed step.
 */
export function useGenius(options?: GeniusOptions) {
  const [turns, setTurns] = React.useState<GeniusTurn[]>([]);
  const [actions, setActions] = React.useState<NarratorAction[]>([]);
  const [isThinking, setIsThinking] = React.useState(false);
  const [booking, setBooking] = React.useState(isBookingActive());

  const optionsRef = React.useRef(options);
  optionsRef.current = options;
  const turnsRef = React.useRef<GeniusTurn[]>([]);
  turnsRef.current = turns;

  /** Live support: a free-form question answered from the catalog. */
  const askSupport = React.useCallback(async (text: string): Promise<{ reply: string; actions: NarratorAction[] } | null> => {
    const ctx = optionsRef.current?.context;
    const cart = optionsRef.current?.cart;
    try {
      const { data, error } = await supabase.functions.invoke('genius', {
        body: {
          messages: [...turnsRef.current.slice(-10).map((t) => ({ role: t.role, content: t.content })), { role: 'user', content: text }],
          context: ctx
            ? {
                title: ctx.title,
                scope: ctx.scope,
                category: ctx.category,
                product: ctx.product,
                price: ctx.price,
                features: ctx.features,
                route: ctx.route,
              }
            : undefined,
          cart: cart?.items.length ? cart.items.map((i) => `${i.name} ($${Math.round(i.price).toLocaleString()})`).join(', ') : undefined,
        },
      });
      if (error || !data?.reply) return null;
      const remote: NarratorAction[] = Array.isArray(data.actions)
        ? data.actions.filter((a: NarratorAction) => a?.label).slice(0, 4)
        : [];
      return { reply: String(data.reply), actions: remote };
    } catch {
      return null;
    }
  }, []);

  const ask = React.useCallback(
    async (message: string): Promise<string | null> => {
      const text = message.trim();
      if (!text || isThinking) return null;

      setTurns((prev) => [...prev, { id: `u-${Date.now()}`, role: 'user', content: text }]);
      setActions([]);
      setIsThinking(true);

      const settle = (reply: string, chips: NarratorAction[]) => {
        setTurns((prev) => [...prev, { id: `a-${Date.now()}`, role: 'assistant', content: reply }]);
        setActions(chips.length ? chips : bookChips());
        setIsThinking(false);
        setBooking(isBookingActive());
        return reply;
      };

      const ctx = optionsRef.current?.context ?? undefined;

      /* 1 — an appointment in progress owns the conversation */
      if (isBookingActive()) {
        const step = await advanceBooking(text, {
          product: ctx?.product,
          category: ctx?.category,
          route: ctx?.route,
        });
        if (step) return settle(step.reply, step.actions);
      }

      /* 2 — the guest asks for an appointment */
      if (wantsAppointment(text)) {
        const opened = startBooking(ctx?.product || ctx?.category);
        return settle(opened.reply, opened.actions);
      }

      /* 3 — designing out loud */
      const design = runGeniusDesignCommand(text);
      if (design) {
        return settle(design, [
          { label: 'Price this design', type: 'branch', payload: 'What does this design cost installed?' },
          { label: 'Book a designer', type: 'branch', payload: 'Book a consultation' },
        ]);
      }

      /* 4 — the selection */
      const selection = runGeniusCartCommand(text, optionsRef.current?.cart ?? null);
      if (selection) {
        return settle(selection, [
          { label: 'My selection', type: 'branch', payload: "What's in my selection?" },
          { label: 'Checkout', type: 'navigate', payload: '/checkout' },
        ]);
      }

      /* 5 — the book, the catalog and the pages */
      const resolution = resolveGeniusRequest(text);
      if (resolution.handled) return settle(resolution.reply, resolution.actions);

      /* 6 — live support for anything else */
      const support = await askSupport(text);
      if (support) {
        return settle(support.reply, [
          ...support.actions,
          { label: 'Book a designer', type: 'branch', payload: 'Book a consultation' },
        ]);
      }

      return settle(resolution.reply, resolution.actions);
    },
    [isThinking, askSupport],
  );

  const reset = React.useCallback(() => {
    setTurns([]);
    setActions([]);
  }, []);

  /** The open book, as Genius sees it — handy for debugging and for chips. */
  const bookDigest = React.useCallback(() => flipManifestDigest(), []);

  return { turns, actions, isThinking, booking, ask, reset, bookDigest };
}

export default useGenius;
