import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = "https://bwngxlbnavnhbtahyzbf.supabase.co";
const SITE_URL = "https://wonderlands-poolside-vibes-38.lovable.app";

/**
 * Convert relative image URLs to absolute URLs so external consumers can display them.
 */
function resolveImageUrls<T>(data: T): T {
  if (Array.isArray(data)) {
    return data.map(resolveImageUrls) as T;
  }
  if (data && typeof data === "object") {
    const obj = { ...data } as Record<string, unknown>;
    if (typeof obj.image_url === "string" && obj.image_url.startsWith("/")) {
      obj.image_url = `${SITE_URL}${obj.image_url}`;
    }
    return obj as T;
  }
  return data;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow GET
  if (req.method !== "GET") {
    return json({ error: "Method not allowed" }, 405);
  }

  // Validate bearer token
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return json({ error: "Missing or invalid Authorization header" }, 401);
  }

  const token = authHeader.replace("Bearer ", "");
  if (!token.startsWith("wl_")) {
    return json({ error: "Invalid API key format" }, 401);
  }

  // Hash the token to compare with stored hash
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const tokenHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  // Use service role to validate token
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(SUPABASE_URL, serviceRoleKey);

  const { data: apiToken, error: tokenError } = await supabase
    .from("user_api_tokens")
    .select("id, user_id, scopes, is_active, expires_at")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (tokenError || !apiToken) {
    return json({ error: "Invalid API key" }, 401);
  }

  if (!apiToken.is_active) {
    return json({ error: "API key is inactive" }, 403);
  }

  if (apiToken.expires_at && new Date(apiToken.expires_at) < new Date()) {
    return json({ error: "API key has expired" }, 403);
  }

  if (!apiToken.scopes?.includes("read")) {
    return json({ error: "API key does not have read permission" }, 403);
  }

  // Update last_used_at
  await supabase
    .from("user_api_tokens")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", apiToken.id);

  // Parse URL path
  const url = new URL(req.url);
  const pathParts = url.pathname.split("/").filter(Boolean);
  // Expected: /public-api/{resource} or /public-api/{resource}/{id}
  const resource = pathParts[1] || "";
  const resourceId = pathParts[2] || null;

  // Parse query params for pagination & filtering
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 100);
  const offset = (page - 1) * limit;
  const category = url.searchParams.get("category");
  const search = url.searchParams.get("search");
  const isActive = url.searchParams.get("is_active");

  switch (resource) {
    case "products": {
      let query = supabase
        .from("products")
        .select("id, name, description, price, category, subcategory, brand, image_url, sku, material, features_json, benefits, warranty_years_text, stock_quantity, collection_name, type_category, is_active", { count: "exact" })
        .eq("is_active", isActive !== "false")
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (category) query = query.eq("category", category);
      if (search) query = query.ilike("name", `%${search}%`);
      if (resourceId) query = query.eq("id", resourceId).single();

      const { data: products, error, count } = await query;
      if (error) return json({ error: error.message }, 400);

      return json({
        data: resolveImageUrls(products),
        ...(resourceId ? {} : { pagination: { page, limit, total: count } }),
      });
    }

    case "pools": {
      let query = supabase
        .from("pools")
        .select("id, model, category, price, dimensions, depth, features, finishes, image_url, warranty_years, installation_time_weeks, is_active", { count: "exact" })
        .eq("is_active", isActive !== "false")
        .order("price", { ascending: true })
        .range(offset, offset + limit - 1);

      if (category) query = query.eq("category", category);
      if (search) query = query.ilike("model", `%${search}%`);
      if (resourceId) query = query.eq("id", resourceId).single();

      const { data: pools, error, count } = await query;
      if (error) return json({ error: error.message }, 400);

      return json({
        data: resolveImageUrls(pools),
        ...(resourceId ? {} : { pagination: { page, limit, total: count } }),
      });
    }

    case "pavers": {
      let query = supabase
        .from("pavers")
        .select("id, name, description, collection, category, base_price, colors, image_url, is_active", { count: "exact" })
        .eq("is_active", isActive !== "false")
        .order("name", { ascending: true })
        .range(offset, offset + limit - 1);

      if (category) query = query.eq("category", category);
      if (search) query = query.ilike("name", `%${search}%`);
      if (resourceId) query = query.eq("id", resourceId).single();

      const { data: pavers, error, count } = await query;
      if (error) return json({ error: error.message }, 400);

      return json({
        data: resolveImageUrls(pavers),
        ...(resourceId ? {} : { pagination: { page, limit, total: count } }),
      });
    }

    case "": {
      return json({
        message: "Wonderlands World Public API",
        version: "1.0.0",
        endpoints: [
          { path: "/public-api/products", description: "List all products" },
          { path: "/public-api/products/:id", description: "Get product by ID" },
          { path: "/public-api/pools", description: "List all pools" },
          { path: "/public-api/pools/:id", description: "Get pool by ID" },
          { path: "/public-api/pavers", description: "List all pavers" },
          { path: "/public-api/pavers/:id", description: "Get paver by ID" },
        ],
        query_params: {
          page: "Page number (default: 1)",
          limit: "Items per page (default: 50, max: 100)",
          category: "Filter by category",
          search: "Search by name/model",
          is_active: "Filter by active status (default: true)",
        },
      });
    }

    default:
      return json({ error: `Unknown resource: ${resource}` }, 404);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
