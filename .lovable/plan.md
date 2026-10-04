# Next build: Command Center redesign + Wonderlands Web Builder

## Already fixed (this turn)
The live site's sign-in page was blank: a leftover line in the page loader pointed browsers at a source file the live server can't run, so the whole app crashed before the form appeared. Removed; publish to make it live.

## Job A — Command Center in the home page / FLIP style
- New shell for `/admin`: editorial magazine look (Sora/Manrope, teal + coral accents, glass panels, large serif-style headlines, full-bleed cover band like the home hero) replacing the boxy tabs.
- Left "table of contents" rail like the FLIP reader, grouped: Today, Sales & CRM, Quotes & Invoices, Projects, Marketing (SOCIALITE), Builders (Web Builder, Flip V3), Settings.
- "Today" cover page: real metrics, action queue, technology hub (existing components restyled, no mock data).
- Admin role-preview switch: Command Center / Contractor workspace / Customer account.
- Contractor workspace and `/account` get the same light editorial skin.
- Existing quotes, product cards and images untouched.

## Job B — Web Builder (replaces Content Editor at `/editor`)
- Canvas: desktop/tablet/mobile, zoom, snapping guides, undo/redo, layers (order, lock, hide, duplicate).
- Sections + free drag: user drops any widget anywhere; resize handles; grid or free placement.
- Full control per element: text (font from the 50 FLIP fonts, size, weight, spacing, color), images (upload/replace/crop/zoom), backgrounds (color, gradient, image, video, overlay, blur).
- Widget library: every Wonderlands widget (pool/3D designer, solar calculator, enclosure, fencing, paver/turf calculators, quote tool, booking, cart, Genius) + all FLIP V3 layouts and blocks (spreads, bento, lookbook, minibooks, page jumps, add-to-cart).
- Products: connect to the company's own product list; edit card info (name, price, description, badges, buttons) per site, with a "My products" manager.
- Save, preview and publish pages per company at `/site/:company/:page`; flip books embed as blocks.
- Add Web Builder + FLIP to the main menu and Command Center rail.

## Technical
- New tables: `sites`, `site_pages` (JSON document, company_id, RLS by is_company_member, public read when published); company product overrides reuse `products` with company_id.
- Builder document model shared with FLIP V3 blocks (`lib/builder/*`), widgets registered in one registry, lazy-loaded.
- Order: Job A (1 run), Job B core canvas + editing (1 run), Job B widgets/products/publish (1 run).
