import { detectLanguage, setActiveLanguage, translateText } from '@/lib/genius/geniusLanguage';
import * as React from 'react';
import { type NarratorAction, type NarratorContext } from '@/lib/narratorStore';
import { resolveGeniusRequest, bookChips } from '@/lib/geniusFlipBrain';
import { flipManifestDigest } from '@/lib/flipPageRegistry';
import { isGeniusDesignAgentRegistered, runGeniusDesignCommand } from '@/lib/geniusDesignBus';
import { runGeniusCartCommand, type GeniusCartAdapter } from '@/lib/geniusCartCommands';
import { advanceBooking, isBookingActive, startBooking, wantsAppointment } from '@/lib/geniusBooking';
import { resolveShowroomRequest } from '@/lib/geniusShowroom';
import { supabase } from '@/integrations/supabase/client';
import { invokeGenius } from '@/lib/geniusInvoke';
import { buildKnowledgeDigest } from '@/lib/geniusKnowledge';
import { getFlipModelPick } from '@/lib/metaModels';
import { classifyGeniusTask } from '@/lib/modelRouter';

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
  const [notice, setNotice] = React.useState<string | null>(null);
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
      const { data, error } = await invokeGenius('genius', {
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
          catalog: buildKnowledgeDigest(),
          model: getFlipModelPick() ?? undefined,
          task: classifyGeniusTask(text, 'flip'),
        },
      }, { onBusy: () => setNotice('Busier than normal right now — your question is underway and will go through on its own. Hang tight…') });
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
      setNotice(null);
      setIsThinking(true);

      /* Reply in the guest's language: intents run on English, the answer is translated back. */
      const typed = detectLanguage(text);
      if (!typed.startsWith('en') || text.length > 12) setActiveLanguage(typed);
      const lang = typed;
      const settle = async (raw: string, chips: NarratorAction[]) => {
        const reply = lang.startsWith('en') ? raw : await translateText(raw, lang);
        setTurns((prev) => [...prev, { id: `a-${Date.now()}`, role: 'assistant', content: reply }]);
        setActions(chips.length ? chips : bookChips());
        setNotice(null);
        setIsThinking(false);
        setBooking(isBookingActive());
        return reply;
      };

      const ctx = optionsRef.current?.context ?? undefined;

      /* 1 — an appointment in progress owns the conversation, unless the
         guest clearly asked a question instead of answering the booking step:
         the question is served by the steps below and the booking stays
         parked, instead of swallowing the text as a name or a date. */
      const questionShaped =
        /^(what|how|which|who|why|when|show|tell|do you|can you|could you|is there|are there)\b/i.test(text) &&
        !/@|\d{3}/.test(text);
      if (isBookingActive() && !questionShaped) {
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

      /* 3 — designing out loud, but only when a drawing board is actually
         registered on this surface. Without one, design-shaped questions
         ("can you add a fire pit?") belong to the book and live support —
         not to a brush-off about opening a board. */
      const design = isGeniusDesignAgentRegistered() ? runGeniusDesignCommand(text) : null;
      if (design) {
        return settle(design, [
          { label: 'Price this design', type: 'branch', payload: 'What does this design cost installed?' },
          { label: 'Book a designer', type: 'branch', payload: 'Book a consultation' },
        ]);
      }

      /* 4 — the selection, only when this surface actually has one. With
         no cart adapter the parser must not answer at all: payment and
         total questions fall through to the book and live support. */
      const cartAdapter = optionsRef.current?.cart ?? null;
      const selection = cartAdapter ? runGeniusCartCommand(text, cartAdapter) : null;
      if (selection) {
        return settle(selection, [
          { label: 'My selection', type: 'branch', payload: "What's in my selection?" },
          { label: 'Checkout', type: 'navigate', payload: '/checkout' },
        ]);
      }

      /* 5 — the showroom, when its widgets are on screen */
      const showroom = resolveShowroomRequest(text);
      if (showroom.handled) return settle(showroom.reply, showroom.actions);

      /* 6 — the book, the catalog and the pages */
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

      /* Live support could not answer (busy or down). Say so honestly —
         never dress the failure up as a canned fallback line, which reads
         exactly like "she didn't understand me". */
      return settle(
        'Genius is catching her breath — the live catalog is busy right now. Give me a moment and ask again, or name a model, like "Milan", and I will open its book.',
        resolution.actions,
      );
    },
    [isThinking, askSupport],
  );

  const reset = React.useCallback(() => {
    setTurns([]);
    setActions([]);
  }, []);

  /** The open book, as Genius sees it — handy for debugging and for chips. */
  const bookDigest = React.useCallback(() => flipManifestDigest(), []);

  return { turns, actions, isThinking, notice, booking, ask, reset, bookDigest };
}

export default useGenius;
