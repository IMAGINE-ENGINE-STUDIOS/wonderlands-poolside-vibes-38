import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const MAX_BYTES = 8 * 1024 * 1024; // a LIVE turn is seconds long — anything larger is not speech

/**
 * Transcription for Genius LIVE only.
 *
 * The microphone button uses the browser's own free speech recognition; this
 * paid path is reached only when the guest turns LIVE on (or when the browser
 * has no recognition engine at all), so dictation costs nothing by default.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return json({ error: "LOVABLE_API_KEY is not configured" }, 500);

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return json({ error: "No audio was uploaded" }, 400);
    }
    if (file.size > MAX_BYTES) {
      return json({ error: "That recording is too long — speak in shorter turns" }, 413);
    }
    // header-only WAV: a silent mic or an instant stop, never worth a paid call
    if (file.size < 2048) return json({ text: "" });

    const language = form.get("language");

    const upstream = new FormData();
    upstream.append("model", "openai/gpt-4o-transcribe");
    upstream.append("file", file, file.name || "recording.wav");
    if (typeof language === "string" && /^[a-z]{2}$/.test(language)) {
      upstream.append("language", language);
    }

    const res = await fetch("https://ai.gateway.lovable.dev/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: upstream,
    });

    if (!res.ok) {
      const details = await res.text().catch(() => "");
      console.error(`Transcription failed [${res.status}]: ${details}`);
      return json({ error: "Transcription failed", status: res.status, details }, res.status);
    }

    const data = await res.json();
    return json({ text: typeof data?.text === "string" ? data.text : "" });
  } catch (err) {
    console.error("transcribe-audio error:", err);
    return json({ error: err instanceof Error ? err.message : "Unexpected error" }, 500);
  }
});
