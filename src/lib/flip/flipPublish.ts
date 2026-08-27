/**
 * FLIP publishing — one book row per edition.
 *
 * A book lives at `/<slug>` on the Wonderlands flip subdomain (free) and can
 * additionally be pointed at the author's own domain. Reads of a published book
 * are public; writes are limited to the owner by row-level security.
 */

import { supabase } from "@/integrations/supabase/client";
import { ensureV2, type BuilderDocV2 } from "@/components/flip/flipBuilderV2Types";

/** Free Wonderlands host every published edition gets. */
export const FLIP_HOST = "flip.wonderlandsworld.com";

export type FlipBookRow = {
  id: string;
  owner_id: string | null;
  title: string;
  slug: string;
  custom_domain: string | null;
  doc: unknown;
  theme: unknown;
  narrator_enabled: boolean;
  published: boolean;
  views: number;
  share_token: string;
  updated_at: string;
};

export const publicUrl = (slug: string, customDomain?: string | null) =>
  customDomain ? `https://${customDomain}` : `https://${FLIP_HOST}/${slug}`;

/** In-app link that always works, even before DNS is pointed. */
export const appUrl = (slug: string) => `${window.location.origin}/flip/${slug}`;

export const isSlugFree = async (slug: string, exceptId?: string) => {
  const query = supabase.from("flip_books").select("id").eq("slug", slug).limit(1);
  const { data, error } = await query;
  if (error) throw error;
  const row = data?.[0];
  return !row || row.id === exceptId;
};

/** Create or update the author's book row and return the saved record. */
export const saveBook = async (doc: BuilderDocV2): Promise<FlipBookRow> => {
  const { data: auth } = await supabase.auth.getUser();
  const owner = auth?.user?.id;
  if (!owner) throw new Error("Sign in to publish a flip book.");

  const payload = {
    owner_id: owner,
    title: doc.title,
    slug: doc.publish.slug,
    custom_domain: doc.publish.customDomain || null,
    doc: doc as unknown as Record<string, unknown>,
    theme: doc.theme as unknown as Record<string, unknown>,
    narrator_enabled: doc.narrator.enabled,
    published: doc.publish.published,
  };

  if (doc.publish.bookId) {
    const { data, error } = await supabase
      .from("flip_books")
      .update(payload)
      .eq("id", doc.publish.bookId)
      .select()
      .maybeSingle();
    if (error) throw error;
    if (data) return data as unknown as FlipBookRow;
  }

  const { data, error } = await supabase.from("flip_books").insert(payload).select().maybeSingle();
  if (error) throw error;
  return data as unknown as FlipBookRow;
};

export const listMyBooks = async (): Promise<FlipBookRow[]> => {
  const { data, error } = await supabase
    .from("flip_books")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as FlipBookRow[];
};

/** Public read used by the published reader route. */
export const loadPublishedBook = async (slug: string) => {
  const { data, error } = await supabase
    .from("flip_books")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const row = data as unknown as FlipBookRow;
  return { row, doc: ensureV2(row.doc as Partial<BuilderDocV2>) };
};

export type NarratorAccount = {
  active: boolean;
  credits_balance: number;
  monthly_fee: number;
};

/** Narrator subscription + credit wallet, via the billing function. */
export const narratorState = async (bookId: string): Promise<NarratorAccount | null> => {
  const { data, error } = await supabase.functions.invoke("flip-narrator-billing", {
    body: { action: "state", bookId },
  });
  if (error) throw error;
  return (data?.account ?? null) as NarratorAccount | null;
};

export const startNarratorSubscription = async (bookId: string, credits?: number) => {
  const { data, error } = await supabase.functions.invoke("flip-narrator-billing", {
    body: { action: "subscribe", bookId, credits, returnUrl: window.location.href },
  });
  if (error) throw error;
  return data as { url?: string; account?: NarratorAccount };
};

/** Charge the book's wallet for one reading. Returns the balance left. */
export const consumeNarratorCredits = async (bookId: string, credits: number, note?: string) => {
  const { data, error } = await supabase.functions.invoke("flip-narrator-billing", {
    body: { action: "consume", bookId, credits, note },
  });
  if (error) throw error;
  return data as { ok: boolean; balance: number; reason?: string };
};
