# Website Builder V2 — world-class editor with Genius

Credit: Imagine Engine Studios Corp.

## Already done (this turn)
- Company workspace, Command Center and customer account now use the full screen width (no empty side gutters).

## What V1 has today
Pages, sections (hero, text, spacer, services, testimonials, CTA, image, gallery, video, product cards, lead form, Wonderlands tool), theme (fonts, colours, logo), draft/publish, custom domain, leads into CRM.

## What is missing (from research of Webflow, Framer, Wix Studio, Squarespace)
1. **Full-screen editor mode** — editor takes the whole window, collapsible left (blocks/layers) and right (settings) panels, zoom 50–150%.
2. **Device preview** — desktop / tablet / mobile frames, with per-device hide/show per section.
3. **Direct on-canvas editing** — click text to type in place, drag to reorder sections, duplicate/delete toolbar on hover.
4. **Undo / redo + autosave** with "saved" indicator and version history (restore any published snapshot).
5. **More blocks** — header/nav menu, footer, pricing table, FAQ accordion, team, stats counter, logo strip, map/location, before–after slider, booking (Calendly link), columns/grid container, embed (HTML), blog post list.
6. **Design system per site** — global button styles, spacing scale, section presets (light/dark/brand), saved reusable sections.
7. **Media library** — company image uploads in storage, reuse across sections, alt text.
8. **SEO & sharing** — per-page title, description, social image, slug editing, sitemap for each public site, 301 when slug changes.
9. **Forms V2** — custom fields, required toggle, thank-you message or redirect, spam honeypot; submissions already go to CRM.
10. **Blog / posts** — simple post collection with list + detail pages.
11. **Analytics** — page views and form conversions per site, shown in the builder.
12. **Templates gallery** — several trade starter templates (pools, landscaping, solar, roofing, general contractor) besides the Wonderlands one.

## Genius inside the builder (Groq, never Lovable AI)
- **"Build my site"**: company describes the business in a sentence → Genius drafts pages, sections and copy into the draft (never publishes on its own).
- **Section helper**: rewrite, shorten, translate, change tone on any text block.
- **Command box**: "add a FAQ about financing", "make the hero darker", "add a page for solar" → applied as edits, undoable.
- **SEO assist**: suggests page titles/descriptions.
- Uses a new Groq edge function `site-genius` returning structured section edits validated against the block list; local fallback when unavailable. Nothing says "AI" in public pages.

## Build order (phases)
1. Full-screen editor shell, device preview, zoom, undo/redo, autosave, drag reorder, inline text edit.
2. New blocks (header/footer/FAQ/pricing/team/stats/logos/map/booking/columns/embed) + per-device visibility.
3. Media library, SEO per page, forms V2, version history.
4. Genius builder (build-my-site, command box, text helper, SEO assist).
5. Templates gallery, blog, analytics.

## Technical details
- Keep `SiteDoc` in `lib/siteBuilder/model.ts`; add optional fields (`seo`, `hidden: {mobile,tablet,desktop}`, `history`) so V1 sites keep working.
- Split editor into `components/siteBuilder/editor/*` (Canvas, LeftPanel, RightPanel, Toolbar, DeviceFrame) and `blocks/*` (one file per block, shared by SiteRenderer).
- New tables (company_id scoped, is_company_member RLS): `site_media`, `site_versions`, `site_posts`, `site_events`.
- Public pages still read only the `published` snapshot via the existing RPC.
- Groq key stays server-side in the edge function.
