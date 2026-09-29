// Unsubscribe a client from marketing emails.
// Called by the /unsubscribe website page (JSON body { token }) and by mail
// apps' one-click "List-Unsubscribe" POST (token in ?t= query string).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    let token = new URL(req.url).searchParams.get("t") ?? "";
    if (!token && req.headers.get("content-type")?.includes("application/json")) {
      const body = await req.json().catch(() => ({}));
      token = typeof body?.token === "string" ? body.token : "";
    }
    if (!UUID.test(token)) return json({ success: false, error: "Invalid link" }, 400);

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data, error } = await supabase
      .from("clients")
      .update({ email_unsubscribed: true, email_unsubscribed_at: new Date().toISOString() })
      .eq("unsubscribe_token", token)
      .select("id");
    if (error) throw error;
    if (!data?.length) return json({ success: false, error: "Link not found" }, 404);
    return json({ success: true });
  } catch (e) {
    console.error("unsubscribe failed", e);
    return json({ success: false, error: "Could not unsubscribe" }, 500);
  }
});
