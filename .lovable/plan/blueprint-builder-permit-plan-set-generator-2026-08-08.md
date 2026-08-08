# Blueprint Builder (Permit Plan Set Generator)

A new page where a user assembles a professional, permit-ready plan set — modeled exactly on the attached SQR Engineering / TechTerra "GONZALES" pool + patio drawing set for Port Richey (Pasco County, FL) — and adapts the sheet format and required notes to the selected city/county, project type, and permit type.

## What the user gets

New route `/blueprint-builder` with an architect-style workspace:

```text
┌───────────── Jurisdiction & Project bar ─────────────┐
│ County/City search  ▾ | Project type ▾ | Permit type ▾│
├──────────────┬───────────────────────────────────────┤
│  Sheet list  │        SHEET CANVAS (36x24)           │
│  A1 Site     │  ┌──────────────────┬──────────────┐  │
│  S1 Sections │  │                  │ Engineer of  │  │
│  S2 Details  │  │   drawing area   │ record block │  │
│  E1 Bonding  │  │   (2D board)     │ Sheet index  │  │
│  P1 Plumbing │  │                  │ Contractor   │  │
│              │  │                  │ Project info │  │
│  + Add sheet │  ├──────────────────┤ Revisions    │  │
│              │  │ notes / legends  │ Signature    │  │
└──────────────┴──┴──────────────────┴──────────────┘  │
```

- **Title block / side panel** reproducing every box from the PDF: engineer-of-record block (firm, license, address, email, SHA electronic-seal disclaimer), contractor block (company, license #, address), project information (project name, client, address, city/state/zip), revision table (R / description / drawn / date / app / date), drawing name, sheet number, sheet count, drawing number, scale, page size (36x24), and file path footer.
- **Signature & seal section**: engineer/architect seal placeholder, signature line, date, digital SHA authentication code field, plus contractor sign-off and owner acknowledgement lines.
- **Info boxes**: Areas / impervious table (property sqft, building, driveway, concrete patio + AC pad, pool, paver deck, gravel — with existing vs proposed totals and auto-calculated impervious %), pool data table (model, code, size, shallow/deep depth, gallons, water surface area, perimeter LF, steps LF, seats LF, weight), equipment legend (EQ1–EQ8), equipment options matrix (Jandy / Hayward / Pentair), sheet index table, scope of work, and reference codes (FBC 2023 8th Edition, 2023 NEC).
- **Note libraries** seeded verbatim from the PDF and toggleable per sheet: general site notes (1–12), structural notes, bonding notes (NEC 680.26), gas piping notes (FL Fuel Gas Code 2023 / NFPA 54), SOFA / drain cover notes (ANSI/APSP/ICC-16 2017), and barrier/gate notes (FBC 454.2.17 / R4501.17).
- **Site plan drawing area**: reuse of the existing 2D drawing board approach (the same 10px = 1ft canvas used by the enclosure board) so the user can trace the property boundary, house footprint, driveway, pool, deck, setbacks, fence, and equipment pad, with dimension labels and an auto area readout that feeds the impervious table.
- **Export**: print / PDF at 36x24 landscape, plus save/load of the whole plan set to local cache so nothing is lost on reload.

## Jurisdiction engine

- Searchable dropdown of Florida jurisdictions (county + city), seeded with **Pasco County / Port Richey** as the reference-accurate baseline taken from the attached set, plus the major counties and cities we serve.
- Each jurisdiction record carries: adopted codes, wind speed / exposure, required sheets, required notes, impervious/lot-coverage limits, barrier requirements, setback defaults, submittal checklist, and permit fee notes.
- **Project type** (new fiberglass pool, concrete pool, spa, paver deck/patio, retaining wall, screen enclosure/pool cage, pergola, fence, driveway) and **Permit type** (residential swimming pool, accessory structure, electrical, plumbing, gas, site/drainage, master permit + subs) are filtered by the selected jurisdiction, and selecting them switches the required sheet list, notes, and checklist automatically.
- A live "Submittal readiness" checklist flags missing items (e.g. missing survey, missing separate permit for deck/retaining wall/fence per the reference set).

## Technical notes

- New `src/pages/BlueprintBuilder.tsx` + route in `src/App.tsx`.
- New `src/data/blueprintJurisdictions.ts` (jurisdiction/project/permit catalog) and `src/data/blueprintTemplates.ts` (sheet templates, note libraries, legend and table seeds extracted from the PDF).
- New components under `src/components/blueprint/`: `SheetCanvas`, `TitleBlock`, `SignatureBlock`, `AreasTable`, `PoolDataTable`, `EquipmentLegend`, `NotesPanel`, `SheetIndex`, `RevisionTable`, `JurisdictionPicker`, `SiteDrawingBoard` (built on the existing board pattern).
- State persisted with the existing `usePersistentState` hook; print via a dedicated print stylesheet sized to 36x24.
- Design follows the current teal/coral tokens for the app chrome, with a true white CAD sheet inside the canvas; all colors through existing tokens, no hardcoded utilities.
- Content is generic-branded (Wonderlands World as contractor default, editable engineer-of-record fields) — the reference engineer's name/license is used only as an editable placeholder example, not baked in as ours.

## Out of scope for this pass

- Auto-generating structural/plumbing section details as vector CAD (S1/S2/P1 start as templated note + detail-callout sheets with an image/upload slot).
- Server-side PDF rendering or real permit portal submission.
