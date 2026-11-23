import * as React from "react";
import ProductSuite, { type SuiteModel } from "@/components/product-suite/ProductSuite";
import SaunaPlacementTool from "@/components/sauna/SaunaPlacementTool";
import { saunas } from "@/data/saunaData";

/**
 * Sauna Suite — /suites/saunas
 * Uses the shared ProductSuite shell so saunas get the same dropdown +
 * carousel option mechanism as the fiberglass pools, plus the Sauna Pad Board.
 * Models come straight from `src/data/saunaData.ts` (turnkey retail prices).
 *
 * The AI placement tool lives inside the suite (founder strategy,
 * 2026-11-22): the detail view carries the tool as a section for the
 * model being configured, and both entries — the banner above the
 * suite and the shell's "See it in your space" action — scroll to it.
 * The standalone page (/suites/saunas/place) runs the same tool with
 * its own picker for deep links.
 */
const SaunaSuite = () => {
  const models: SuiteModel[] = React.useMemo(
    () =>
      saunas.map((s) => ({
        id: s.id,
        name: s.name,
        price: s.price,
        image: s.image,
        brand: "Almost Heaven Saunas",
        dimensions: s.dimensions,
        description: s.description,
        features: s.features,
        meta: `${s.capacity} · ${s.heaterPower}`,
        threeDUrl: s.threeDUrl,
      })),
    [],
  );

  const scrollToPlacement = () =>
    document
      .getElementById("suite-placement")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <>
      <div className="mx-auto w-full max-w-3xl px-4 pt-6">
        <button
          type="button"
          onClick={scrollToPlacement}
          className="block min-h-[52px] w-full rounded-2xl bg-neutral-900 px-4 py-3 text-center font-semibold text-white"
        >
          See a sauna in your space
        </button>
        <p className="mt-2 text-center text-sm text-neutral-600">
          Take a photo of your yard and tap the spot. We show the sauna
          standing there at its true size.
        </p>
      </div>
      <ProductSuite
        categoryId="saunas"
        categoryLabel="Saunas"
        productType="sauna"
        eyebrow="Wonderlands · Heat"
        title="The Sauna Suite"
        blurb="Barrel, cabin and panorama cabins from Almost Heaven Saunas, configured line by line — heater, control, stones, door, glass and the cold plunge that follows the heat."
        models={models}
        detailAddon={(m, ctx) => (
          <SaunaPlacementTool
            embedded
            modelId={m.id}
            initialFromExtras={ctx.extras}
          />
        )}
      />
    </>
  );
};

export default SaunaSuite;
