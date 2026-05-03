# Fix Promotion Emails + Add Offer Landing Pages

## Issues Identified

1. **Image not rendering in email**: The Spa + Sauna + Fireplace promotion uses `image_url = "/lovable-uploads/spa-sauna-fireplace-bundle.png"` — a relative path. Email clients (Gmail, Outlook) cannot resolve relative URLs; they require absolute `https://` URLs.
2. **Email link goes to homepage**: The `send-bulk-email` template hardcodes `https://wonderlandsworld.com` with no offer-specific destination. There is no per-promotion landing page where the recipient can view details and contact the team.

## Changes

### 1. New public route — Offer landing page
Create `src/pages/OfferPage.tsx` mounted at `/offer/:id`:
- Fetches the promotion from Supabase by ID
- Displays: image, name, highlight badge, description, bundle price, original price, savings, included items list, terms
- Contact CTAs: Call (tel:+1 239 257 0637), Email, WhatsApp (wa.me link), Schedule (Calendly link)
- "Back to Wonderlands World" link to `/`
- Themed using existing semantic tokens + brand teal/coral
- Graceful "Offer not found" fallback

Add to `src/App.tsx`:
```tsx
const OfferPage = lazy(() => import("./pages/OfferPage"));
<Route path="/offer/:id" element={<OfferPage />} />
```

### 2. Edge function — `send-bulk-email`
Update the inline promotion HTML builder so that:
- **Image URL is absolutized**: if `promotion.image_url` starts with `/`, prefix it with `https://wonderlandsworld.com`. Skip the `<img>` tag entirely if the URL is empty or a `blob:`/`data:` URI (those don't work in email).
- **CTA button links to `https://wonderlandsworld.com/offer/{promotion.id}`** instead of the homepage. The promotion ID is already passed from the client; add it to the `promotion` payload from `AdminPromotionsManager.tsx`.

### 3. Client — `AdminPromotionsManager.tsx`
Include `id` in the `promotion` body sent to `send-bulk-email` so the edge function can build the offer URL.

## Technical Details

**Why absolute URLs are required:**
Gmail/Outlook strip or fail to render `<img src="/path">` because there's no host to resolve against. The image must be served from a publicly reachable HTTPS URL. The existing `/lovable-uploads/...` path is publicly served at `https://wonderlandsworld.com/lovable-uploads/...`, so prefixing the host is sufficient — no Supabase Storage upload needed.

**Files touched:**
- New: `src/pages/OfferPage.tsx`
- Edit: `src/App.tsx` (add lazy import + route)
- Edit: `supabase/functions/send-bulk-email/index.ts` (absolutize image URL, use offer page link)
- Edit: `src/components/admin/AdminPromotionsManager.tsx` (include promotion `id` in the request body)

Existing offer pages will work for both promotions in the database (Spa+Sauna+Fireplace and Bermuda+Barrel Sauna) and any future promotion automatically — the page is data-driven from the `promotions` table.
