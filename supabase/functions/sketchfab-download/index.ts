// Returns a temporary GLB download URL for a Sketchfab model, using the
// platform's SKETCHFAB_API_TOKEN so the key never reaches the browser.
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    const { uid } = await req.json();
    if (typeof uid !== "string" || !/^[a-f0-9]{32}$/i.test(uid)) return json({ error: "invalid uid" }, 400);
    const token = Deno.env.get("SKETCHFAB_API_TOKEN");
    if (!token) return json({ error: "not configured" }, 500);
    const res = await fetch(`https://api.sketchfab.com/v3/models/${uid}/download`, {
      headers: { Authorization: `Token ${token}` },
    });
    if (!res.ok) return json({ error: `sketchfab ${res.status}` }, res.status === 404 ? 404 : 502);
    const data = await res.json();
    return json({ glb: data?.glb?.url ?? null });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
