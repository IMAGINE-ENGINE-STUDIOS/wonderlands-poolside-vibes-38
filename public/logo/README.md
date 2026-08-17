# public/logo/

This folder contains the official Wonderlands World brand logo in public-facing formats.

## Files

- `wonderlands-logo.png` — Full-resolution PNG (lossless, ~1.4 MB) for email templates and external embeds.
- `wonderlands-logo.webp` — Optimized WebP for the web app UI.

## Why this folder exists

Brand marks were previously mixed into `public/images/`. Keeping the logo in its own
dedicated folder makes it easier to find, cache, and reference consistently across
components, email edge functions, and marketing assets without accidentally treating
it as a generic product image.

## Consumers

- `src/pages/GalleryFilesPage.tsx` — masthead icon (`/logo/wonderlands-logo.webp`)
- `supabase/functions/milestone-completed-email/index.ts` — email header image
- `supabase/functions/share-project-email/index.ts` — email header image

## Note for programmers

If you need to change the logo, replace both files here and update the versioned
references in the consumers above. Do **not** place the logo back into `public/images/`.
