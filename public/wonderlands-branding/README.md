# public/wonderlands-branding/

This folder groups brand and marketing-related uploads that were previously
scattered under `public/lovable-uploads/`. Keeping them together makes them
easier to find, cache, and reference consistently across the app, emails, and
database seed data.

## Files

| File | Purpose | Consumers |
|------|---------|-----------|
| `02222bf9-70e0-46ee-9772-cacbabb3e9c2.{png,webp}` | Wonderlands professional logo | `Header.tsx`, `EcommerceTemplate.tsx`, `InvoiceDetailPage.tsx`, `send-quote-email` edge function, migration email template |
| `0c70745d-4bf3-4394-8fb2-da6024bf72b9.png` | Aquamarine Crystal finish swatch | `AdvancedSearch.tsx` |
| `1412e1fb-72ec-4219-a98f-4fcffbd15095.png` | Product feature image | `productFeatures.ts` |
| `1c6556f8-0571-434d-a877-e5152aee1726.{png,webp}` | Synergy pool product image | `poolProductLookup.ts`, `PoolCatalog.tsx`, `AdvancedSearch.tsx`, `QuoteDetailPage.tsx`, `SurveyQuoteTool.tsx` |
| `2ad9f663-7ae0-4ea4-8ae6-cf232b78f58e.png` | Oasis Bar Cart / brand showcase | `WonderlandsBrandShowcase.tsx`, migrations |
| `5bfe3308-05a6-4d01-9f62-014d86ea281c.webp` | Brand/marketing image | (add consumer when known) |
| `96a7bfbb-d930-451c-a0cd-1d8297bb7512.{png,webp}` | Paradise lounge / default fallback image | `PoolDetails.tsx`, `WonderlandsBrandShowcase.tsx`, migrations |

## Note for programmers

These files are referenced by their stable UUID filenames in source code, email
templates, and SQL migrations. If you replace an image, keep the same filename or
update every consumer. Do not move files back into `public/lovable-uploads/`
without updating all references.
