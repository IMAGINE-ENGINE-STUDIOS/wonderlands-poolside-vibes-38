import * as React from "react";
import SaunaPlacementTool from "@/components/sauna/SaunaPlacementTool";

/**
 * Sauna Placement — /suites/saunas/place (standalone page)
 *
 * The placement flow also lives inside the Sauna Suite, bound to the
 * model being configured there (founder, 2026-11-22). This page keeps
 * the standalone route working with its own model picker; in-context
 * entries (the suite, the Wonderlands Studio) link here with
 * ?model=<id> and the tool opens with that model already chosen.
 */
const SaunaPlacement = () => {
  const [requestedModelId] = React.useState<string | null>(() => {
    try {
      return new URLSearchParams(window.location.search).get("model");
    } catch {
      return null;
    }
  });

  return <SaunaPlacementTool initialModelId={requestedModelId} />;
};

export default SaunaPlacement;
