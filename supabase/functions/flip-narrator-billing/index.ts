/**
 * FLIP narrator billing.
 *
 * A book's narrator is a $20/month subscription plus metered reading credits.
 * Credits are consumed by the reader every time a spread is read aloud; when
 * the wallet empties the narrator falls silent until the author tops it up.
 *
 * Actions
 *  - state     : the caller's narrator account for a book they own
 *  - subscribe : Stripe Checkout for the $20 subscription + an optional credit pack
 *  - consume   : deduct credits for one reading (called by the reader)
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const MONTHLY_FEE_CENTS = 2000;
const CREDIT_PACKS: Record<number, number> = { 250: 2000, 750: 5000, 2000: 12000 };

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const body = await req.json().catch(() => ({}));
    const action = String(body?.action ?? "");
    const bookId = String(body?.bookId ?? "");
    if (!/^[0-9a-f-]{36}$/i.test(bookId)) return json({ error: "bookId is required" }, 400);

    const { data: book } = await admin
      .from("flip_books")
      .select("id, owner_id, published, narrator_enabled")
      .eq("id", bookId)
      .maybeSingle();
    if (!book) return json({ error: "Book not found" }, 404);

    /* Who is calling? Owners manage billing; guests may only consume credits. */
    let userId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const { data } = await admin.auth.getUser(authHeader.replace("Bearer ", ""));
      userId = data?.user?.id ?? null;
    }
    const isOwner = !!userId && userId === book.owner_id;

    /* --------------------------------------------------------------- state */
    if (action === "state") {
      if (!isOwner) return json({ error: "Not your book" }, 403);
      const { data: account } = await admin
        .from("flip_narrator_accounts")
        .select("active, credits_balance, monthly_fee")
        .eq("book_id", bookId)
        .maybeSingle();
      return json({ account: account ?? null });
    }

    /* ----------------------------------------------------------- subscribe */
    if (action === "subscribe") {
      if (!isOwner) return json({ error: "Not your book" }, 403);
      const secret = Deno.env.get("STRIPE_SECRET_KEY");
      if (!secret) return json({ error: "Stripe is not configured" }, 500);
      const stripe = new Stripe(secret, { apiVersion: "2023-10-16" });

      const credits = Number(body?.credits ?? 0);
      const packPrice = CREDIT_PACKS[credits];
      const returnUrl = typeof body?.returnUrl === "string" ? body.returnUrl : "https://wonderlandsworld.com";

      const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: MONTHLY_FEE_CENTS,
            recurring: { interval: "month" },
            product_data: { name: "FLIP Narrator — monthly", description: "Live voice narration for your published flip book." },
          },
        },
      ];
      if (packPrice) {
        lineItems.push({
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: packPrice,
            recurring: { interval: "month" },
            product_data: { name: `Narration credits — ${credits} readings / month` },
          },
        });
      }

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: lineItems,
        success_url: `${returnUrl}${returnUrl.includes("?") ? "&" : "?"}narrator=active`,
        cancel_url: returnUrl,
        metadata: { book_id: bookId, credits: String(credits || 0) },
      });

      /* Provision the wallet now so the author can test while Stripe settles. */
      await admin.from("flip_narrator_accounts").upsert(
        {
          book_id: bookId,
          user_id: userId,
          active: true,
          monthly_fee: MONTHLY_FEE_CENTS / 100,
          credits_balance: credits || 25,
          stripe_customer_id: null,
          stripe_subscription_id: session.id,
        },
        { onConflict: "book_id" },
      );
      await admin.from("flip_books").update({ narrator_enabled: true }).eq("id", bookId);
      await admin.from("flip_credit_ledger").insert({
        book_id: bookId,
        user_id: userId,
        kind: "grant",
        amount: credits || 25,
        note: credits ? `Credit pack — ${credits}` : "Trial credits with subscription",
      });

      return json({ url: session.url });
    }

    /* ------------------------------------------------------------- consume */
    if (action === "consume") {
      const credits = Math.max(1, Math.min(50, Number(body?.credits ?? 1)));
      const { data: account } = await admin
        .from("flip_narrator_accounts")
        .select("id, active, credits_balance, user_id")
        .eq("book_id", bookId)
        .maybeSingle();

      if (!account?.active) return json({ ok: false, balance: 0, reason: "narrator_inactive" });
      if (Number(account.credits_balance) < credits) {
        return json({ ok: false, balance: Number(account.credits_balance), reason: "out_of_credits" });
      }

      const balance = Number(account.credits_balance) - credits;
      await admin.from("flip_narrator_accounts").update({ credits_balance: balance }).eq("id", account.id);
      await admin.from("flip_credit_ledger").insert({
        book_id: bookId,
        user_id: account.user_id,
        kind: "consume",
        amount: credits,
        note: typeof body?.note === "string" ? body.note.slice(0, 180) : "Reading",
      });
      return json({ ok: true, balance });
    }

    return json({ error: `Unknown action: ${action}` }, 400);
  } catch (error) {
    console.error("flip-narrator-billing failed:", error);
    return json({ error: error instanceof Error ? error.message : "Unexpected error" }, 500);
  }
});
