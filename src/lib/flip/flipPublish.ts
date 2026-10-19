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
  const { data, error } = await supabase.from("flip_books").select("id, owner_id").eq("slug", slug).limit(1);
  if (error) throw error;
  const row = data?.[0] as { id: string; owner_id: string | null } | undefined;
  if (!row || row.id === exceptId) return true;
  /* The address is only "taken" if it belongs to someone else. The same
   * author re-saving her own book — from the other surface (the /flip lab
   * vs SOCIALITE), after cleared storage, or under a fresh sign-in — must
   * never be refused her own name. */
  const { data: auth } = await supabase.auth.getUser();
  return !!auth?.user?.id && row.owner_id === auth.user.id;
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
    doc: JSON.parse(JSON.stringify(doc)),
    theme: JSON.parse(JSON.stringify(doc.theme)),
    narrator_enabled: doc.narrator.enabled,
    published: doc.publish.published,
  };

  /* Resolve the row this save belongs to: the recorded book id first, then
   * — the republish trap — the author's OWN row already holding this slug
   * (written from the other surface or before storage was cleared). Without
   * this, her own address read as "taken" and the insert died on the slug
   * UNIQUE constraint with a raw database error. */
  let existing: { id: string; published: boolean } | null = null;
  if (doc.publish.bookId) {
    const { data } = await supabase.from("flip_books").select("id, published").eq("id", doc.publish.bookId).maybeSingle();
    if (data) existing = data as { id: string; published: boolean };
  }
  if (!existing) {
    const { data } = await supabase.from("flip_books").select("id, published, owner_id").eq("slug", payload.slug).limit(1);
    const row = (data?.[0] ?? null) as { id: string; published: boolean; owner_id: string | null } | null;
    if (row && row.owner_id === owner) existing = { id: row.id, published: row.published };
  }
  /* A save NEVER unpublishes: "Save as draft" on a live edition updates the
   * book in place and the public link keeps working. Unpublishing is a
   * deliberate act, not a side effect of saving. */
  if (existing?.published) payload.published = true;

  if (existing) {
    const { data, error } = await supabase
      .from("flip_books")
      .update(payload as never)
      .eq("id", existing.id)
      .select()
      .maybeSingle();
    if (error) throw error;
    if (data) return data as unknown as FlipBookRow;
  }

  const { data, error } = await supabase.from("flip_books").insert(payload as never).select().maybeSingle();
  if (error) {
    if ((error as { code?: string }).code === "23505") {
      throw new Error("That address is taken — try another name.");
    }
    throw error;
  }
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
