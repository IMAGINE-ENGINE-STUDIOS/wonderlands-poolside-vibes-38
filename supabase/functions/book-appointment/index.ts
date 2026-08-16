import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Books a consultation requested through Genius.
 * Stores the request for the Wonderlands team and confirms it by email.
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => null);
    const name = typeof body?.name === "string" ? body.name.trim().slice(0, 120) : "";
    const email = typeof body?.email === "string" && /[^\s@]+@[^\s@]+\.[a-z]{2,}/i.test(body.email)
      ? body.email.trim().slice(0, 160)
      : null;
    const phone = typeof body?.phone === "string" ? body.phone.replace(/[^\d+]/g, "").slice(0, 24) : null;

    if (!name || (!email && !phone)) {
      return new Response(
        JSON.stringify({ error: "A name plus an email or phone number are required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const preferredAt = typeof body?.preferred_at === "string" && !Number.isNaN(Date.parse(body.preferred_at))
      ? new Date(body.preferred_at).toISOString()
      : null;
    const preferredText = typeof body?.preferred_text === "string" ? body.preferred_text.slice(0, 160) : null;
    const topic = typeof body?.topic === "string" ? body.topic.slice(0, 160) : "Outdoor living consultation";
    const timezone = typeof body?.timezone === "string" ? body.timezone.slice(0, 60) : null;
    const notes = [preferredText ? `Requested time: ${preferredText}` : null, typeof body?.notes === "string" ? body.notes.slice(0, 400) : null]
      .filter(Boolean)
      .join(" · ") || null;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data, error } = await supabase
      .from("genius_appointments")
      .insert({
        name,
        email,
        phone,
        whatsapp_optin: body?.whatsapp_optin === true,
        preferred_at: preferredAt,
        timezone,
        topic,
        notes,
        source: "genius",
      })
      .select("id")
      .single();

    if (error) {
      console.error("book-appointment insert failed:", error.message);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    /* Confirmation email — a booking still stands if the mail fails. */
    let confirmationSent = false;
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (resendKey && email) {
      const when = preferredText ?? (preferredAt ? new Date(preferredAt).toUTCString() : "a time we will confirm");
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "Wonderlands World <hello@wonderlandsworld.com>",
          to: [email],
          subject: "Your Wonderlands consultation request",
          html: `<div style="font-family:Georgia,serif;color:#0f172a;line-height:1.6">
            <h2 style="letter-spacing:.04em">Wonderlands World</h2>
            <p>Thank you, ${name}. Your consultation request is with our design team.</p>
            <p><strong>Requested:</strong> ${when}<br/><strong>Subject:</strong> ${topic}</p>
            <p>A designer will confirm shortly. You may also pick a time directly:
              <a href="https://calendly.com/wonderlandsworlds/30min">choose a time</a>.</p>
            <p style="font-size:12px;color:#64748b">All prices include delivery, installation and the product as described.</p>
          </div>`,
        }),
      });
      if (!res.ok) console.error(`book-appointment email failed [${res.status}]: ${await res.text().catch(() => "")}`);
      else confirmationSent = true;
    }

    return new Response(JSON.stringify({ id: data.id, confirmationSent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("book-appointment error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
