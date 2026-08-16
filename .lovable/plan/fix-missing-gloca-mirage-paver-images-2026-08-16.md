# Fix missing Gloca Mirage paver images

## What's wrong

The six Gloca Mirage porcelain deck products point at their images with raw string
paths that start with `/src/assets/...`. That is an internal source folder, not a
public web path, so the browser gets nothing back and the swatch renders empty.
The image files themselves are present in the project — only the way they are
referenced is broken.

Confirmed in `src/data/paverData.ts` (lines 188, 196, 204, 212, 220, 228):

```text
Gloca Mirage Ideal 48x48      -> /src/assets/pavers/gloca-mirage-ideal.jpg
Gloca Mirage Ideal 24x48      -> /src/assets/pavers/gloca-mirage-ideal.jpg
Gloca Mirage Concrete 48x48   -> /src/assets/pavers/gloca-mirage-concrete.webp
Gloca Mirage Concrete 24x48   -> /src/assets/pavers/gloca-mirage-concrete.webp
Gloca Mirage Chairmues 48x48  -> /src/assets/pavers/gloca-mirage-chairmues.webp
Gloca Mirage Chairmues 24x48  -> /src/assets/pavers/gloca-mirage-chairmues.webp
```

Files that exist in `src/assets/pavers/`: `gloca-mirage-ideal.jpg`,
`gloca-mirage-ideal.webp`, `gloca-mirage-concrete.webp`,
`gloca-mirage-chairmues.webp`.

## The fix

1. Convert the Gloca entries in `src/data/paverData.ts` to proper ES6 asset
   imports (the project standard), so the build resolves and fingerprints each
   image instead of shipping a dead path.
2. Use the optimized `.webp` variant for all three colors (Ideal switches from
   `.jpg` to the existing `.webp`), per the performance rule.
3. Keep names, ids, descriptions, prices and ordering exactly as they are — only
   the image reference changes.

## Same bug elsewhere (fix in the same pass)

Three other places use the same dead `/src/assets/...` string pattern and will be
converted to ES6 imports too:

- `src/components/EditablePoolProductCard.tsx` line 633 — pool heater image
- `src/components/SurveyQuoteTool.tsx` lines 2167-2181 — the five artificial
  grass color images used on quotes

## Verification

- Typecheck passes.
- Load the Wonderlands Studio deck-paver picker in the preview and confirm all
  six Gloca swatches render, with no failing image requests in the network log.
