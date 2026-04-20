

## Add Custom Extra Items to Quote Tool

Allow the admin (in Edit Mode) to add custom line items to the final quote — each can have an optional uploaded image, an optional editable price (defaults to $0), and a name. Items get included in the grand total and persist through print/PDF/save.

### What the user sees

In the Quote Tool, after entering Edit Mode (via the existing `WONDERMAGIC` passcode):

1. A new **"+ Add Custom Item"** button appears at the bottom of the *Added Features* section (the same grid that currently shows extras like pavers, heaters, etc.).
2. Clicking it inserts a new card in the grid with:
   - **Image area**: shows a dashed "Click to upload image" placeholder. Clicking opens the existing image upload overlay so the admin can attach any image (or leave blank — placeholder hidden on print).
   - **Name field**: editable text input (default: "Custom Item").
   - **Price field**: editable number input (default: `$0`). Real-time formatting.
   - **Remove (×)** button in the corner of the card to delete it.
3. The **Total Investment** at the bottom automatically updates to include the sum of all custom items.
4. On save / print / PDF / Stripe checkout / send-quote-email, custom items appear exactly like other extras with their image (if uploaded) and price.

### Behavior rules

- Custom items only appear/can be added in Edit Mode. Out of Edit Mode, they render as normal read-only cards alongside other extras.
- Items with no image render as a clean card with just the name and price (no broken image, no placeholder).
- Items with `$0` price still render (no price line is hidden) — the user explicitly asked for a "no price" option, so price is treated as optional and shown only when > 0.
- Custom items are added to `editableQuoteAmount` so the existing "Total Investment" override logic continues to work.
- Items are included in the saved quote payload (`extras.customItems`) and in line items sent to `send-quote-email` / Stripe / invoice generation.

### Technical implementation

**File:** `src/components/SurveyQuoteTool.tsx`

1. **New state**:
   ```ts
   type CustomQuoteItem = { id: string; name: string; price: number; image?: string };
   const [customItems, setCustomItems] = useState<CustomQuoteItem[]>([]);
   ```

2. **Handlers**:
   - `handleAddCustomItem()` — pushes a new item with `crypto.randomUUID()`, `name: 'Custom Item'`, `price: 0`.
   - `handleUpdateCustomItem(id, patch)` — partial update for name/price/image.
   - `handleRemoveCustomItem(id)` — filters from array.

3. **Pricing integration** in `calculateQuote()` (around line 577):
   ```ts
   const customItemsTotal = customItems.reduce((s, i) => s + (Number(i.price) || 0), 0);
   basePrice += customItemsTotal;
   ```
   This runs *before* the early-return for `extras.totalPrice` is bypassed for custom items by adding `+ customItemsTotal` to that branch as well.

4. **UI additions** in the *Added Features* section (around lines 1815–1960):
   - After the existing `.map()` of `extras.extrasBreakdown`, render `customItems.map(...)` producing the same card style (`border border-coral-200 ... bg-gradient-to-br from-coral-50 ...`) so the existing outline is preserved.
   - Each card uses the existing `<ImageUploadOverlay>` component (already imported) with `imageKey={`custom-${item.id}`}` for image upload.
   - In Edit Mode: render `<Input>` for name and `<Input type="number">` for price + a small × button.
   - Out of Edit Mode: render plain text/price + image (only if present).
   - At the bottom of the grid in Edit Mode only, show the **+ Add Custom Item** button.
   - If `extras.extrasBreakdown` is empty *but* `customItems` has entries (or edit mode), still render the section (relax the existing `extras.extrasBreakdown.length > 0` guard to `|| customItems.length > 0 || isEditMode`).

5. **Persistence**:
   - Include `customItems` in the `saveQuoteToDatabase` payload under `extras.customItems`.
   - Include in `lineItems` for `send-quote-email` (around line 808 area) so the emailed/PDF quote contains them.
   - Stripe checkout uses the already-overridden `editableQuoteAmount` total, so no change needed there.

6. **Reset**: Clear `customItems` when dialog opens (`setCustomItems([])` alongside `setEditableQuoteAmount(0)` at line 215).

### What stays the same

- No changes to other product cards, Latham/Gilmer logic, paver data, grass options, or quote outline/style.
- No new dependencies.
- No DB schema changes (custom items live in the existing `extras` JSON column already saved with quotes).
- Image upload reuses the existing `ImageUploadOverlay` infrastructure.

