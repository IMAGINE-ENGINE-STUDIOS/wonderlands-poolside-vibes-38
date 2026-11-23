import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  arUrlForModel,
  buildBasePayload,
  buildPlacementPayload,
  choosableOptionGroups,
  complementsFromSelections,
  selectionsFromSuiteExtras,
  fetchSaunaPack,
  generateSaunaPlacement,
  markerPointFor,
  modelSizeLine,
  parseSaunaPack,
  placementGroupsForDisplay,
  placementImageSize,
  placementScaleEstimated,
  tapPctFromEvent,
  tapPercentFor,
  DEFAULT_BASE_SELECTION,
  FALLBACK_BASES,
  PlacementUnavailableError,
  type PlacementMeta,
  type PlacementRequest,
} from "./saunaPlacement";

/* Fixtures mirror the SERVED pack shapes (verified live 2026-11-19):
 * models carry heroPhoto/mediaPhotos/threeDUrl and a dimensions object;
 * selection choices arrive as plain name strings; booleans carry none. */
const PACK_FIXTURE = {
  models: [
    {
      id: "pinnacle-4-person-barrel-sauna",
      name: "Pinnacle 4 Person Barrel Sauna",
      form: "barrel",
      capacity: "4 persons",
      stockHeater: "6.0kW KIP electric",
      dimensions: {
        asStated: "6' x 6' classic barrel",
        footprintFt: { a: 6, b: 6 },
        status: "numeric footprint stated in source (order as printed)",
        heightFt: null,
      },
      heroPhoto: "https://example.com/pinnacle.jpg",
      mediaPhotos: [
        "https://example.com/pinnacle.jpg",
        "https://example.com/pinnacle-2.jpg",
      ],
      threeDUrl: "https://almostheaven.com/products/pinnacle-4-person-barrel-sauna",
      threeDStatus: "manufacturer 3D/AR page",
    },
    {
      id: "vienna-2-person-canopy-barrel-sauna",
      name: "Vienna 2 Person Canopy Barrel Sauna",
      form: "canopy barrel",
      capacity: "2 persons",
      stockHeater: "6.0kW KIP electric",
      dimensions: {
        asStated: "4+1 canopy barrel",
        footprintFt: null,
        status: "GAP: prose only — no numeric footprint in saunaData.ts",
        heightFt: null,
      },
      heroPhoto: "https://example.com/vienna.jpg",
      mediaPhotos: ["https://example.com/vienna.jpg"],
      threeDUrl: null,
      threeDStatus: "GAP: no manufacturer 3D page",
    },
    {
      /* The official object (live shape, verified 2026-11-19): the
       * legacy block still flags this model a gap, while the harvested
       * manufacturer knowledge holds its real assembled size. */
      id: "lewisburg-6-8-person-barrel-sauna",
      name: "Lewisburg 6-8 Person Barrel Sauna",
      form: "barrel",
      capacity: "6-8 persons",
      stockHeater: "8kW electric",
      dimensions: {
        asStated: "7' x 8' classic barrel",
        footprintFt: null,
        status: "GAP: prose only in the legacy record",
        heightFt: null,
      },
      official: {
        assembled: "81 in W x 94 in D x 85 7/8 in H",
        heightFt: 7.16,
        footprintFt: { w: 6.75, d: 7.83 },
      },
      heroPhoto: "https://example.com/lewisburg.jpg",
      mediaPhotos: ["https://example.com/lewisburg.jpg"],
      threeDUrl: "https://mysaunaworld.com/products/almost-heaven-lewisburg",
      threeDStatus: "manufacturer 3D/AR page",
    },
  ],
  options: [
    {
      id: "saunaDoor",
      label: "Door Upgrade",
      type: "selection",
      placementClass: "front",
      visualEffect: "Changes the front door of the sauna.",
      choices: ["Included Door", "All-Wood Door"],
    },
    {
      id: "rainJacket",
      label: "Barrel Sauna Rain Jacket",
      type: "boolean",
      placementClass: "exterior",
      visualEffect: "A fitted weather cover draped over the top.",
      choices: [],
    },
    {
      id: "coldPlunge",
      label: "Cold Plunge",
      type: "selection",
      placementClass: "adjacent",
      visualEffect: "A separate plunge unit beside the sauna.",
      choices: ["None", "Black Dip Plunge"],
    },
    {
      id: "saunaHeater",
      label: "Sauna Heater",
      type: "selection",
      placementClass: "interior",
      visualEffect: "Replaces the interior heater unit.",
      choices: ["Included Heater (as configured)"],
    },
    {
      id: "careSet",
      label: "Sauna Care Set",
      type: "boolean",
      placementClass: "none",
      visualEffect: "",
      choices: [],
    },
  ],
  bases: [
    { id: "existing", label: "Existing ground (keep the photo's ground)" },
    { id: "grass", label: "Grass lawn" },
    { id: "pebbles", label: "Pebbles / river rock" },
    { id: "belgard-pavers", label: "Belgard pavers" },
    { id: "concrete-pad", label: "Concrete pad" },
    { id: "wood-deck", label: "Wood deck platform" },
  ],
};

const REQ: PlacementRequest = {
  photoUrl: "https://example.com/clean.jpg",
  markedPhotoUrl: "https://example.com/marked.jpg",
  tapPct: { x: 0.5, y: 0.68 },
  modelId: "pinnacle-4-person-barrel-sauna",
  referencePhotos: ["https://example.com/pinnacle.jpg"],
  dimensionsText: "6' x 6' classic barrel",
  complements: [
    { id: "saunaDoor", choice: "All-Wood Door" },
    { id: "rainJacket" },
  ],
  base: DEFAULT_BASE_SELECTION,
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

describe("tapPctFromEvent", () => {
  const rect = { left: 100, top: 50, width: 200, height: 100 };
  it("centre of the photo is 0.5 / 0.5", () => {
    assert.deepEqual(tapPctFromEvent(200, 100, rect), { x: 0.5, y: 0.5 });
  });
  it("corners are 0 and 1", () => {
    assert.deepEqual(tapPctFromEvent(100, 50, rect), { x: 0, y: 0 });
    assert.deepEqual(tapPctFromEvent(300, 150, rect), { x: 1, y: 1 });
  });
  it("taps outside the photo clamp to the nearest edge", () => {
    assert.deepEqual(tapPctFromEvent(40, 999, rect), { x: 0, y: 1 });
    assert.deepEqual(tapPctFromEvent(999, -5, rect), { x: 1, y: 0 });
  });
  it("a zero size rect yields 0 / 0, never NaN", () => {
    assert.deepEqual(
      tapPctFromEvent(10, 10, { left: 0, top: 0, width: 0, height: 0 }),
      { x: 0, y: 0 },
    );
  });
});

describe("tapPercentFor (the contract's percent conversion)", () => {
  it("0.5 / 0.68 becomes 50 / 68", () => {
    assert.deepEqual(tapPercentFor({ x: 0.5, y: 0.68 }), { x: 50, y: 68 });
  });
  it("edges stay inside 0..100", () => {
    assert.deepEqual(tapPercentFor({ x: 0, y: 1 }), { x: 0, y: 100 });
    assert.deepEqual(tapPercentFor({ x: 0.004, y: 0.996 }), { x: 0, y: 100 });
  });
});

describe("markerPointFor", () => {
  it("scales the tap onto natural pixels", () => {
    assert.deepEqual(markerPointFor({ x: 0.5, y: 0.5 }, 2000, 1000), {
      x: 1000,
      y: 500,
    });
    assert.deepEqual(markerPointFor({ x: 0.333, y: 1 }, 1000, 500), {
      x: 333,
      y: 500,
    });
  });
});

describe("placementImageSize", () => {
  it("leaves a photo under the cap untouched", () => {
    assert.deepEqual(placementImageSize(800, 600), { width: 800, height: 600 });
  });
  it("caps a landscape long edge at 1536 keeping aspect", () => {
    assert.deepEqual(placementImageSize(3000, 2000), {
      width: 1536,
      height: 1024,
    });
  });
  it("caps a portrait long edge at 1536 keeping aspect", () => {
    assert.deepEqual(placementImageSize(1000, 3000), {
      width: 512,
      height: 1536,
    });
  });
  it("a full-resolution phone photo renders at the capped size, and the tap maps onto the same relative spot", () => {
    // The founder's failed pass (2026-11-19): a regular iPhone photo
    // (4032 x 3024) uploaded at full size was rejected as too large to
    // edit. The uploads render at placementImageSize, and the tap —
    // a percentage — lands at the same relative spot on the resize.
    const size = placementImageSize(4032, 3024);
    assert.deepEqual(size, { width: 1536, height: 1152 });
    const onResized = markerPointFor({ x: 0.55, y: 0.62 }, size.width, size.height);
    assert.deepEqual(onResized, { x: 845, y: 714 });
    const onNatural = markerPointFor({ x: 0.55, y: 0.62 }, 4032, 3024);
    assert.ok(Math.abs(onResized.x / size.width - onNatural.x / 4032) < 0.001);
    assert.ok(Math.abs(onResized.y / size.height - onNatural.y / 3024) < 0.001);
  });
});

describe("parseSaunaPack", () => {
  const pack = parseSaunaPack(PACK_FIXTURE);
  it("parses every model and group", () => {
    assert.equal(pack.models.length, 3);
    assert.equal(pack.optionGroups.length, 5);
  });
  it("a numeric footprint model is not scale estimated; a GAP model is", () => {
    assert.equal(pack.models[0].scaleEstimated, false);
    assert.equal(pack.models[1].scaleEstimated, true);
    assert.equal(pack.models[1].dimensionsAsStated, "4+1 canopy barrel");
    assert.match(pack.models[1].dimensionStatus, /^GAP/);
  });
  it("the official object is the size truth: a legacy GAP model with held manufacturer dimensions is not scale estimated", () => {
    const m = pack.models[2];
    assert.equal(m.scaleEstimated, false);
    assert.equal(m.officialAssembled, "81 in W x 94 in D x 85 7/8 in H");
    assert.deepEqual(m.officialFootprintFt, { w: 6.75, d: 7.83 });
    assert.equal(m.officialHeightFt, 7.16);
    assert.equal(modelSizeLine(m), "81 in W x 94 in D x 85 7/8 in H");
  });
  it("without an official object the size line is the stated dimensions, unchanged", () => {
    assert.equal(pack.models[0].officialAssembled, null);
    assert.equal(pack.models[0].officialFootprintFt, null);
    assert.equal(pack.models[0].officialHeightFt, null);
    assert.equal(modelSizeLine(pack.models[0]), "6' x 6' classic barrel");
    assert.equal(modelSizeLine(pack.models[1]), "4+1 canopy barrel");
  });
  it("reference photos are the hero plus media, deduped in order", () => {
    assert.deepEqual(pack.models[0].referencePhotos, [
      "https://example.com/pinnacle.jpg",
      "https://example.com/pinnacle-2.jpg",
    ]);
  });
  it("threeDUrl survives when present and is null for a gap model", () => {
    assert.equal(
      pack.models[0].threeDUrl,
      "https://almostheaven.com/products/pinnacle-4-person-barrel-sauna",
    );
    assert.equal(pack.models[1].threeDUrl, null);
  });
  it("throws PlacementUnavailableError on an unusable response", () => {
    assert.throws(() => parseSaunaPack({}), PlacementUnavailableError);
    assert.throws(
      () => parseSaunaPack({ models: [], options: [] }),
      PlacementUnavailableError,
    );
    assert.throws(() => parseSaunaPack(null), PlacementUnavailableError);
  });
  it("parses the served bases, ids and labels intact", () => {
    assert.deepEqual(
      pack.bases.map((b) => b.id),
      ["existing", "grass", "pebbles", "belgard-pavers", "concrete-pad", "wood-deck"],
    );
    assert.equal(pack.bases[3].label, "Belgard pavers");
  });
  it("falls back to the contract base set when the pack serves none", () => {
    const noBases = parseSaunaPack({
      models: PACK_FIXTURE.models,
      options: PACK_FIXTURE.options,
    });
    assert.deepEqual(noBases.bases, FALLBACK_BASES);
  });
});

describe("placementScaleEstimated (official dimensions stand the gap flags down)", () => {
  const pack = parseSaunaPack(PACK_FIXTURE);
  const metaWith = (over: Partial<PlacementMeta>): PlacementMeta => ({
    footprintUsed: null,
    dimensionStatus: null,
    appliedVisualOptions: [],
    excludedOptions: [],
    warnings: [],
    threeDUrl: null,
    baseApplied: null,
    cannotRender: false,
    cannotRenderReason: null,
    modelForm: null,
    modelHeroPhoto: null,
    fidelityVerdict: null,
    fidelitySeenForm: null,
    fidelitySeenFinish: null,
    officialDimensions: null,
    heightFt: null,
    ...over,
  });
  it("a GAP model with no official size anywhere stays estimated", () => {
    assert.equal(placementScaleEstimated(pack.models[1], metaWith({})), true);
    assert.equal(
      placementScaleEstimated(
        pack.models[1],
        metaWith({ dimensionStatus: "GAP: no structured height" }),
      ),
      true,
    );
  });
  it("a held manufacturer footprint in the pack clears the estimate", () => {
    assert.equal(
      placementScaleEstimated(
        pack.models[2],
        metaWith({ dimensionStatus: "GAP: legacy flag" }),
      ),
      false,
    );
  });
  it("official dimensions or a height in the placement meta clear it too", () => {
    assert.equal(
      placementScaleEstimated(
        pack.models[1],
        metaWith({ officialDimensions: "81 in W x 94 in D x 85 7/8 in H" }),
      ),
      false,
    );
    assert.equal(
      placementScaleEstimated(pack.models[1], metaWith({ heightFt: 7.16 })),
      false,
    );
  });
  it("a numeric legacy model was never estimated", () => {
    assert.equal(placementScaleEstimated(pack.models[0], metaWith({})), false);
  });
});

describe("choosableOptionGroups", () => {
  it("offers front, exterior and adjacent only — never interior or none", () => {
    const pack = parseSaunaPack(PACK_FIXTURE);
    assert.deepEqual(
      choosableOptionGroups(pack).map((g) => g.id),
      ["saunaDoor", "rainJacket", "coldPlunge"],
    );
  });
});

describe("placementGroupsForDisplay (the full set, split for the suite)", () => {
  it("keeps every pack group: visible first, the rest after, none dropped", () => {
    const pack = parseSaunaPack(PACK_FIXTURE);
    const { visible, rest } = placementGroupsForDisplay(pack);
    assert.deepEqual(
      visible.map((g) => g.id),
      ["saunaDoor", "rainJacket", "coldPlunge"],
    );
    assert.deepEqual(
      rest.map((g) => g.id),
      ["saunaHeater", "careSet"],
    );
    assert.equal(visible.length + rest.length, pack.optionGroups.length);
  });
});

describe("complementsFromSelections (every chosen group rides the request)", () => {
  const pack = parseSaunaPack(PACK_FIXTURE);
  const { visible, rest } = placementGroupsForDisplay(pack);
  const all = [...visible, ...rest];

  it("carries selection choices and boolean toggles across BOTH halves", () => {
    const out = complementsFromSelections(
      all,
      { saunaDoor: "All-Wood Door", saunaHeater: "Included Heater (as configured)" },
      { rainJacket: true, careSet: true },
    );
    assert.deepEqual(out, [
      { id: "saunaDoor", choice: "All-Wood Door" },
      { id: "rainJacket" },
      { id: "saunaHeater", choice: "Included Heater (as configured)" },
      { id: "careSet" },
    ]);
  });

  it("an unchosen group contributes nothing", () => {
    assert.deepEqual(complementsFromSelections(all, {}, {}), []);
    assert.deepEqual(
      complementsFromSelections(all, { coldPlunge: "" }, { rainJacket: false }),
      [],
    );
  });
});

describe("selectionsFromSuiteExtras (the suite configuration carries into the picture)", () => {
  const pack = parseSaunaPack(PACK_FIXTURE);
  const { visible, rest } = placementGroupsForDisplay(pack);
  const all = [...visible, ...rest];

  it("seeds selections and toggles whose names the pack carries", () => {
    const out = selectionsFromSuiteExtras(all, {
      saunaDoor: "All-Wood Door",
      saunaHeater: "Included Heater (as configured)",
      rainJacket: true,
    });
    assert.deepEqual(out.selections, {
      saunaDoor: "All-Wood Door",
      saunaHeater: "Included Heater (as configured)",
    });
    assert.deepEqual(out.toggles, { rainJacket: true });
  });

  it("seeds nothing for a deselection, an unknown choice, or a quantity", () => {
    const out = selectionsFromSuiteExtras(all, {
      saunaDoor: "None",
      saunaHeater: "A Heater The Pack Does Not Carry",
      coldPlunge: 2,
      careSet: false,
    });
    assert.deepEqual(out, { selections: {}, toggles: {} });
  });
});

describe("arUrlForModel (pack lookup)", () => {
  const pack = parseSaunaPack(PACK_FIXTURE);
  it("returns the manufacturer page for a covered model", () => {
    assert.equal(
      arUrlForModel(pack, "pinnacle-4-person-barrel-sauna"),
      "https://almostheaven.com/products/pinnacle-4-person-barrel-sauna",
    );
  });
  it("returns null for a gap model, an unknown id, and no pack", () => {
    assert.equal(arUrlForModel(pack, "vienna-2-person-canopy-barrel-sauna"), null);
    assert.equal(arUrlForModel(pack, "no-such-model"), null);
    assert.equal(arUrlForModel(null, "pinnacle-4-person-barrel-sauna"), null);
  });
});

describe("buildPlacementPayload (the exact contract body)", () => {
  const body = buildPlacementPayload(REQ, { width: 1536, height: 1024 });
  it("matches the contract field for field", () => {
    assert.deepEqual(body, {
      action: "sauna-placement",
      photo_url: "https://example.com/clean.jpg",
      marked_photo_url: "https://example.com/marked.jpg",
      tap_percent: { x: 50, y: 68 },
      model_id: "pinnacle-4-person-barrel-sauna",
      reference_photos: ["https://example.com/pinnacle.jpg"],
      dimensions_text: "6' x 6' classic barrel",
      complements: [
        { id: "saunaDoor", choice: "All-Wood Door" },
        { id: "rainJacket" },
      ],
      width: 1536,
      height: 1024,
    });
  });
  it("a boolean complement carries no choice key at all", () => {
    const complements = body.complements as Array<Record<string, unknown>>;
    assert.equal("choice" in complements[1], false);
    assert.equal(complements[0].choice, "All-Wood Door");
  });
  it("the untouched default base stays out of the payload", () => {
    assert.equal("base" in body, false);
  });
});

describe("buildBasePayload (the base send rule)", () => {
  it("omits the field for existing ground with lighting off", () => {
    assert.equal(
      buildBasePayload({
        surface: "existing",
        paverCollection: null,
        lighting: false,
      }),
      undefined,
    );
    assert.equal(buildBasePayload(DEFAULT_BASE_SELECTION), undefined);
  });
  it("sends surface and lighting for a plain surface change", () => {
    assert.deepEqual(
      buildBasePayload({
        surface: "pebbles",
        paverCollection: null,
        lighting: false,
      }),
      { surface: "pebbles", lighting: false },
    );
  });
  it("carries the collection on the paver surface only when chosen", () => {
    assert.deepEqual(
      buildBasePayload({
        surface: "belgard-pavers",
        paverCollection: "Melville",
        lighting: true,
      }),
      {
        surface: "belgard-pavers",
        lighting: true,
        paver_collection: "Melville",
      },
    );
    assert.deepEqual(
      buildBasePayload({
        surface: "belgard-pavers",
        paverCollection: null,
        lighting: false,
      }),
      { surface: "belgard-pavers", lighting: false },
    );
  });
  it("drops a stray collection on any other surface", () => {
    assert.deepEqual(
      buildBasePayload({
        surface: "grass",
        paverCollection: "Melville",
        lighting: false,
      }),
      { surface: "grass", lighting: false },
    );
  });
  it("lighting alone on existing ground still sends the field", () => {
    assert.deepEqual(
      buildBasePayload({
        surface: "existing",
        paverCollection: null,
        lighting: true,
      }),
      { surface: "existing", lighting: true },
    );
  });
  it("the payload carries the base object end to end", () => {
    const withBase = buildPlacementPayload(
      {
        ...REQ,
        base: {
          surface: "belgard-pavers",
          paverCollection: "Melville",
          lighting: true,
        },
      },
      { width: 800, height: 600 },
    );
    assert.deepEqual(withBase.base, {
      surface: "belgard-pavers",
      lighting: true,
      paver_collection: "Melville",
    });
  });
});

describe("generateSaunaPlacement (stubbed fetch)", () => {
  it("posts the exact payload and prefers the durable image_url", async () => {
    let seenUrl = "";
    let seenBody: unknown = null;
    const stub = (async (url: string, init?: RequestInit) => {
      seenUrl = String(url);
      seenBody = JSON.parse(String(init?.body));
      return jsonResponse({
        image_url: "https://example.com/stored/result.jpg",
        image_data: "QUJD",
        sauna: {
          footprint_used: "6 ft x 6 ft",
          dimension_status: "numeric footprint stated in source",
          applied_visual_options: ["Door Upgrade: All-Wood Door"],
          excluded_options: ["Sauna Stones: interior"],
          warnings: ["HEIGHT GAP: no structured height in source"],
          fidelity: {
            verdict: "verified",
            seen_form: "classic barrel",
            seen_finish: "natural wood",
          },
          three_d_url:
            "https://almostheaven.com/products/pinnacle-4-person-barrel-sauna",
          base_applied: {
            surface: "belgard-pavers",
            paver_collection: "Melville",
            lighting: true,
          },
        },
      });
    }) as unknown as typeof fetch;

    const result = await generateSaunaPlacement(
      REQ,
      { width: 1536, height: 1024 },
      stub,
    );
    assert.match(seenUrl, /\/functions\/v1\/visual-agent$/);
    assert.deepEqual(
      seenBody,
      buildPlacementPayload(REQ, { width: 1536, height: 1024 }),
    );
    assert.equal(result.imageUrl, "https://example.com/stored/result.jpg");
    assert.equal(result.meta.footprintUsed, "6 ft x 6 ft");
    assert.equal(result.meta.modelForm, null);
    assert.equal(result.meta.modelHeroPhoto, null);
    assert.equal(result.meta.fidelityVerdict, "verified");
    assert.equal(result.meta.fidelitySeenForm, "classic barrel");
    assert.equal(result.meta.fidelitySeenFinish, "natural wood");
    assert.deepEqual(result.meta.appliedVisualOptions, [
      "Door Upgrade: All-Wood Door",
    ]);
    assert.deepEqual(result.meta.excludedOptions, ["Sauna Stones: interior"]);
    assert.equal(
      result.meta.threeDUrl,
      "https://almostheaven.com/products/pinnacle-4-person-barrel-sauna",
    );
    assert.deepEqual(result.meta.baseApplied, {
      surface: "belgard-pavers",
      paverCollection: "Melville",
      lighting: true,
    });
  });

  it("carries the placement's official dimensions and height from the additive meta", async () => {
    const stub = (async () =>
      jsonResponse({
        image_url: "https://example.com/stored/result.jpg",
        sauna: {
          footprint_used: "6.75 ft x 7.83 ft",
          dimension_status: "GAP: no structured height in source",
          official_dimensions: "81 in W x 94 in D x 85 7/8 in H",
          height_ft: 7.16,
        },
      })) as unknown as typeof fetch;
    const result = await generateSaunaPlacement(
      REQ,
      { width: 800, height: 600 },
      stub,
    );
    assert.equal(
      result.meta.officialDimensions,
      "81 in W x 94 in D x 85 7/8 in H",
    );
    assert.equal(result.meta.heightFt, 7.16);
  });

  it("a cannot-render report parses without any picture and carries its reason", async () => {
    const stub = (async () =>
      jsonResponse({
        image_url: null,
        image_data: null,
        sauna: {
          cannot_render: true,
          cannot_render_reason:
            "No reference photo shows this model in its listed finish.",
        },
      })) as unknown as typeof fetch;
    const result = await generateSaunaPlacement(
      REQ,
      { width: 800, height: 600 },
      stub,
    );
    assert.equal(result.meta.cannotRender, true);
    assert.equal(
      result.meta.cannotRenderReason,
      "No reference photo shows this model in its listed finish.",
    );
    assert.equal(result.imageUrl, "");
  });

  it("carries the resolved model's form and hero photo for the identity check", async () => {
    const stub = (async () =>
      jsonResponse({
        image_url: "https://example.com/stored/result.jpg",
        sauna: {
          model_form: "canopy barrel",
          model_hero_photo: "https://example.com/catalogue/audra-onyx.jpg",
        },
      })) as unknown as typeof fetch;
    const result = await generateSaunaPlacement(
      REQ,
      { width: 800, height: 600 },
      stub,
    );
    assert.equal(result.meta.modelForm, "canopy barrel");
    assert.equal(
      result.meta.modelHeroPhoto,
      "https://example.com/catalogue/audra-onyx.jpg",
    );
  });

  it("a 422 fidelity refusal resolves as a cannot-render answer, not a failure", async () => {
    const refusalBody = {
      error:
        "Genius could not render the Allegheny 6 Person Cabin Sauna faithfully from its own catalogue photos, so no picture was made.",
      sauna: {
        model_form: "cabin",
        model_hero_photo: "https://example.com/catalogue/allegheny.jpg",
        footprint_used: "6 ft x 5 ft",
        dimension_status: "numeric footprint stated in source",
        three_d_url: null,
        cannot_render: true,
        cannot_render_reason:
          "The render did not match this model's own catalogue photos after two attempts.",
        warnings: ["HEIGHT GAP: no structured height exists for this model"],
      },
    };
    const stub = (async () =>
      jsonResponse(refusalBody, 422)) as unknown as typeof fetch;
    const result = await generateSaunaPlacement(
      REQ,
      { width: 800, height: 600 },
      stub,
    );
    assert.equal(result.imageUrl, "");
    assert.equal(result.meta.cannotRender, true);
    assert.match(result.meta.cannotRenderReason ?? "", /Allegheny/);
    assert.equal(result.meta.modelForm, "cabin");
    assert.equal(
      result.meta.modelHeroPhoto,
      "https://example.com/catalogue/allegheny.jpg",
    );
    assert.equal(result.meta.footprintUsed, "6 ft x 5 ft");
  });

  it("a 422 without the refusal meta still surfaces as an error", async () => {
    const stub = (async () =>
      jsonResponse({ error: "Unknown model" }, 422)) as unknown as typeof fetch;
    await assert.rejects(
      () => generateSaunaPlacement(REQ, { width: 800, height: 600 }, stub),
      PlacementUnavailableError,
    );
  });

  it("cannot_render stays false when the response does not report it", async () => {
    const stub = (async () =>
      jsonResponse({
        image_url: "https://example.com/stored/result.jpg",
        sauna: {},
      })) as unknown as typeof fetch;
    const result = await generateSaunaPlacement(
      REQ,
      { width: 800, height: 600 },
      stub,
    );
    assert.equal(result.meta.cannotRender, false);
    assert.equal(result.meta.cannotRenderReason, null);
  });

  it("falls back to a data URL from image_data when image_url is null", async () => {
    const stub = (async () =>
      jsonResponse({
        image_url: null,
        image_data: "QUJD",
        sauna: {},
      })) as unknown as typeof fetch;
    const result = await generateSaunaPlacement(
      REQ,
      { width: 800, height: 600 },
      stub,
    );
    assert.equal(result.imageUrl, "data:image/jpeg;base64,QUJD");
    assert.equal(result.meta.footprintUsed, null);
    assert.equal(result.meta.baseApplied, null);
  });

  it("rejects with the server's clean message on a 400", async () => {
    const stub = (async () =>
      jsonResponse({ error: "Unknown model" }, 400)) as unknown as typeof fetch;
    await assert.rejects(
      generateSaunaPlacement(REQ, { width: 800, height: 600 }, stub),
      (err: unknown) =>
        err instanceof PlacementUnavailableError &&
        err.message === "Unknown model",
    );
  });

  it("never surfaces a 5xx body (raw provider detail stays off the screen)", async () => {
    const raw =
      "error sending request for url (https://provider.internal/v1/images/edits): connection reset";
    const stub = (async () =>
      jsonResponse({ error: raw }, 500)) as unknown as typeof fetch;
    await assert.rejects(
      generateSaunaPlacement(REQ, { width: 800, height: 600 }, stub),
      (err: unknown) =>
        err instanceof PlacementUnavailableError &&
        err.message === "The picture could not be made.",
    );
  });

  it("never surfaces a 4xx body that carries an address", async () => {
    const stub = (async () =>
      jsonResponse(
        { error: "failed at https://provider.internal/v1/images/edits" },
        400,
      )) as unknown as typeof fetch;
    await assert.rejects(
      generateSaunaPlacement(REQ, { width: 800, height: 600 }, stub),
      (err: unknown) =>
        err instanceof PlacementUnavailableError &&
        err.message === "The picture could not be made.",
    );
  });

  it("resolves an unverifiable-render 502 (cannot_render in the body) as a refusal", async () => {
    const stub = (async () =>
      jsonResponse(
        {
          error:
            "Genius could not verify the render for the Pinnacle 4 Person Barrel Sauna against its own catalogue photos, so no picture was made.",
          sauna: {
            model_id: "pinnacle-4-person-barrel-sauna",
            model_name: "Pinnacle 4 Person Barrel Sauna",
            cannot_render: true,
            cannot_render_reason:
              "The render could not be verified against this model's own catalogue photos.",
            warnings: [],
          },
        },
        502,
      )) as unknown as typeof fetch;
    const result = await generateSaunaPlacement(REQ, { width: 800, height: 600 }, stub);
    assert.equal(result.imageUrl, "");
    assert.equal(result.meta.cannotRender, true);
    assert.equal(
      result.meta.cannotRenderReason,
      "Genius could not verify the render for the Pinnacle 4 Person Barrel Sauna against its own catalogue photos, so no picture was made.",
    );
  });

  it("the flag is the test on any status, and a sauna object without it is not a refusal", async () => {
    const flagged = (async () =>
      jsonResponse(
        {
          error: "Genius could not render this sauna faithfully.",
          sauna: { cannot_render: true, warnings: [] },
        },
        500,
      )) as unknown as typeof fetch;
    const resolved = await generateSaunaPlacement(REQ, { width: 800, height: 600 }, flagged);
    assert.equal(resolved.meta.cannotRender, true);

    const unflagged = (async () =>
      jsonResponse(
        {
          error: "The picture maker is unavailable.",
          sauna: { warnings: [] },
        },
        422,
      )) as unknown as typeof fetch;
    await assert.rejects(
      generateSaunaPlacement(REQ, { width: 800, height: 600 }, unflagged),
      (err: unknown) =>
        err instanceof PlacementUnavailableError &&
        err.message === "The picture maker is unavailable.",
    );
  });

  it("a transient 502 without the flag still errors plainly", async () => {
    const stub = (async () =>
      jsonResponse({ error: "The picture maker is unavailable." }, 502)) as unknown as typeof fetch;
    await assert.rejects(
      generateSaunaPlacement(REQ, { width: 800, height: 600 }, stub),
      (err: unknown) =>
        err instanceof PlacementUnavailableError &&
        err.message === "The picture could not be made.",
    );
  });
});

describe("fetchSaunaPack (stubbed fetch)", () => {
  it("posts the sauna-pack action and parses the response", async () => {
    let seenBody: unknown = null;
    const stub = (async (_url: string, init?: RequestInit) => {
      seenBody = JSON.parse(String(init?.body));
      return jsonResponse(PACK_FIXTURE);
    }) as unknown as typeof fetch;
    const pack = await fetchSaunaPack(stub);
    assert.deepEqual(seenBody, { action: "sauna-pack" });
    assert.equal(pack.models.length, 3);
    assert.equal(pack.optionGroups.length, 5);
  });
});
