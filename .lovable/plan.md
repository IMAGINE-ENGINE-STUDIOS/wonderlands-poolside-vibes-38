## Goal
On `/offer/:id`, display the contact info of the sales rep assigned to the visiting client (the primary `clients.assigned_sales_rep_id`).

## How to identify the client
The offer URL in promotional emails currently is `/offer/:id` with no client context. To know which client is viewing, append a client token to the URL sent in the email:
- Email link becomes `https://wonderlandsworld.com/offer/{promotion.id}?c={client.id}`
- Done in `supabase/functions/send-bulk-email/index.ts` when building `offerUrl` per-client (move `offerUrl` inside the per-client loop).

## Fetching rep info safely (no auth)
Public visitors can't read `clients` or `profiles` directly under RLS. Add a Supabase Edge Function `get-offer-rep`:
- Input: `{ client_id }`
- Uses service role to look up `clients.assigned_sales_rep_id` → join `profiles` → return only `{ first_name, last_name, email, sales_category }` (no sensitive fields).
- If no client_id or no assigned rep, return default Wonderlands contact: `Wonderlands Sales Team`, `sales@wonderlandsworld.com`.

## OfferPage UI changes (`src/pages/OfferPage.tsx`)
1. Read `?c=` from `useSearchParams`.
2. On mount, invoke `get-offer-rep` and store rep state.
3. Add a "Your Wonderlands Representative" card above the contact CTAs:
   - Rep full name + role label ("Sales Representative")
   - Email button → `mailto:{rep.email}` (prefilled subject = promotion name)
   - Phone/WhatsApp keep the company line (+1 239-257-0637) since profile has no phone column
4. Update the existing Email CTA to use the rep's email when available; keep Call/WhatsApp/Calendly as-is.

## Files to change
- `supabase/functions/send-bulk-email/index.ts` — per-client offerUrl with `?c={client.id}`
- `supabase/functions/get-offer-rep/index.ts` — new public function (no JWT)
- `supabase/config.toml` — register new function with `verify_jwt = false`
- `src/pages/OfferPage.tsx` — fetch + render rep card, route email CTA to rep

No DB schema changes.
