/**
 * Genius invoke queue — the rate-limit manners of the whole platform.
 *
 * The model provider's free tier refills PER MINUTE (founder direction
 * 2026-10-18): when a request hits the ceiling we do NOT fail the guest.
 * The request is held, the caller tells the guest it is underway and that
 * things are busier than normal, and the request is submitted again on its
 * own once the minute has passed. Calls are also serialized app-wide
 * through one chain, so two widgets can never burst the ceiling together.
 */
import { supabase } from '@/integrations/supabase/client';

export interface GeniusInvokeOptions {
  /** Called once when the request has to wait out a rate-limit window. */
  onBusy?: () => void;
  /** Give up after this long (default ~170 s, roughly three minute-windows). */
  maxWaitMs?: number;
  /** Test/internal override for the wait between attempts. */
  retryDelayMs?: number;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Did the provider (or the edge function relaying it) say "rate limited"? */
export function isGeniusBusy(data: any, error: any): boolean {
  const status = (error as any)?.context?.status ?? data?.status;
  if (status === 429) return true;
  const msg = String(data?.error ?? (error as any)?.message ?? '');
  return /\b(busy|rate limit|catching her breath|too many requests)\b/i.test(msg);
}

let chain: Promise<unknown> = Promise.resolve();

export async function invokeGenius(
  fn: string,
  options: { body: unknown },
  opts: GeniusInvokeOptions = {},
): Promise<{ data: any; error: any }> {
  const run = async (): Promise<{ data: any; error: any }> => {
    const maxWait = opts.maxWaitMs ?? 170_000;
    const started = Date.now();
    let announced = false;
    let transportRetried = false;
    for (;;) {
      let data: any, error: any;
      try {
        ({ data, error } = await supabase.functions.invoke(fn, options));
      } catch (e) {
        /* Gateway drops and closed connections happen on the free tier: one
         * quiet retry after a breath before the caller ever hears about it. */
        if (!transportRetried) { transportRetried = true; await sleep(3_000); continue; }
        throw e;
      }
      if (!isGeniusBusy(data, error)) {
        const status = (error as any)?.context?.status;
        if (error && typeof status === 'number' && status >= 500 && !transportRetried) {
          transportRetried = true; await sleep(3_000); continue;
        }
        return { data, error };
      }
      const waited = Date.now() - started;
      if (waited >= maxWait) return { data, error };
      if (!announced) {
        announced = true;
        opts.onBusy?.();
        if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('genius:busy', { detail: { fn } }));
      }
      /* The window is a minute: wait out the rest of this one, plus a breath,
       * so the resubmitted request lands in the fresh window, not on its edge. */
      const computed = 60_000 - (Date.now() % 60_000) + 2_000 + Math.random() * 3_000;
      const wait = opts.retryDelayMs ?? Math.max(6_000, computed);
      await sleep(Math.min(wait, maxWait - waited));
    }
  };
  const result = chain.then(run, run);
  chain = result.catch(() => undefined);
  return result;
}
