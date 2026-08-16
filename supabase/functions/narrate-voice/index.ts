import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BUCKET = "narrations";

const audioHeaders = (source: "library" | "fresh") => ({
  ...corsHeaders,
  "Content-Type": "audio/mpeg",
  "Cache-Control": "public, max-age=86400",
  "X-Narration-Source": source,
});

/** Stable file name for a reading: the key and the exact words spoken. */
async function objectPath(key: string, text: string, voice: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`${key}::${voice}::${text}`),
  );
  const hex = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
  return `readings/${hex}.mp3`;
}

/**
 * Genius' voice. Every reading is recorded once into the narrations library and
 * reused for every later guest (and for "read again"), so the same page is
 * never generated — or billed — twice.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

    const body = await req.json();
    const text = typeof body?.text === "string" ? body.text.trim() : "";
    const key = typeof body?.key === "string" && body.key ? body.key : "";
    const voice = typeof body?.voice === "string" && body.voice ? body.voice : "alloy";

    if (!text) {
      return new Response(JSON.stringify({ error: "text is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const admin =
      key && supabaseUrl && serviceKey
        ? createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })
        : null;

    const path = key ? await objectPath(key, text, voice) : "";

    /* 1. Already recorded? Serve the library copy. */
    if (admin && path) {
      const { data: existing } = await admin.storage.from(BUCKET).download(path);
      if (existing) {
        const bytes = new Uint8Array(await existing.arrayBuffer());
        const { data: row } = await admin
          .from("narration_cache")
          .select("plays")
          .eq("cache_key", key)
          .maybeSingle();
        await admin
          .from("narration_cache")
          .upsert(
            {
              cache_key: key,
              script: text,
              voice,
              audio_path: path,
              plays: (row?.plays ?? 0) + 1,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "cache_key" },
          );
        return new Response(bytes, { headers: audioHeaders("library") });
      }
    }

    /* 2. Not recorded yet — generate once. */
    const res = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini-tts",
        input: text.slice(0, 1800),
        voice,
        response_format: "mp3",
        instructions:
          "Speak as a warm, cultured outdoor-living designer reading a luxury magazine aloud. Unhurried, human, lightly enchanting. Natural pauses between sentences.",
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(`narrate-voice gateway error [${res.status}]: ${detail}`);
      return new Response(JSON.stringify({ error: "Voice unavailable", status: res.status }), {
        status: res.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const bytes = new Uint8Array(await res.arrayBuffer());

    /* 3. Record it for everyone who opens this page later. */
    if (admin && path) {
      const { error: uploadError } = await admin.storage
        .from(BUCKET)
        .upload(path, bytes, { contentType: "audio/mpeg", upsert: true });
      if (uploadError) console.error("narrate-voice upload error:", uploadError.message);
      const { error: rowError } = await admin.from("narration_cache").upsert(
        {
          cache_key: key,
          script: text,
          voice,
          audio_path: path,
          plays: 1,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "cache_key" },
      );
      if (rowError) console.error("narrate-voice cache row error:", rowError.message);
    }

    return new Response(bytes, { headers: audioHeaders("fresh") });
  } catch (error) {
    console.error("narrate-voice error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
