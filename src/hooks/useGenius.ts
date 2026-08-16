import * as React from 'react';
import { getNarratorContext, type NarratorAction } from '@/lib/narratorStore';
import { resolveGeniusRequest, bookChips } from '@/lib/geniusFlipBrain';
import { flipManifestDigest } from '@/lib/flipPageRegistry';

export interface GeniusTurn {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Genius — the Wonderlands guide, focused on the FLIP book.
 *
 * All of her language is composed locally (see `geniusFlipBrain` and
 * `flipPitchGenerator`): she reads the live page registry, the product catalog
 * and the open edition, then turns pages, opens editions and answers in house
 * voice. No paid text service is used — the voice is the only billed step.
 */
export function useGenius() {
  const [turns, setTurns] = React.useState<GeniusTurn[]>([]);
  const [actions, setActions] = React.useState<NarratorAction[]>([]);
  const [isThinking, setIsThinking] = React.useState(false);

  const ask = React.useCallback(
    async (message: string, _cartSummary?: string): Promise<string | null> => {
      const text = message.trim();
      if (!text || isThinking) return null;

      setTurns((prev) => [...prev, { id: `u-${Date.now()}`, role: 'user', content: text }]);
      setActions([]);
      setIsThinking(true);

      /* Resolution is instant and local — the pause is only for a human rhythm. */
      const resolution = resolveGeniusRequest(text);
      const ctx = getNarratorContext();
      const reply =
        resolution.handled || !ctx
          ? resolution.reply
          : `${resolution.reply} You are reading ${ctx.title} right now.`;

      setTurns((prev) => [...prev, { id: `a-${Date.now()}`, role: 'assistant', content: reply }]);
      setActions(resolution.actions.length ? resolution.actions : bookChips());
      setIsThinking(false);
      return reply;
    },
    [isThinking],
  );

  const reset = React.useCallback(() => {
    setTurns([]);
    setActions([]);
  }, []);

  /** The open book, as Genius sees it — handy for debugging and for chips. */
  const bookDigest = React.useCallback(() => flipManifestDigest(), []);

  return { turns, actions, isThinking, ask, reset, bookDigest };
}

export default useGenius;
