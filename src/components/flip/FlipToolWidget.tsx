import * as React from "react";
import { Suspense, lazy, useCallback, useMemo, useState } from "react";
import { Maximize2 } from "lucide-react";
import { usePersistentState } from "@/hooks/usePersistentState";
import { boardForCategory } from "./FlipEditorBoard";
import {
  DEFAULT_PX_PER_FT,
  type SitePlanData,
} from "@/components/blueprint/SiteDrawingBoard";
import type { EnclosureLayout, EnclosureTakeoff } from "@/components/enclosure/EnclosureDrawingBoard";
import type { FenceLayout } from "@/components/fence/FenceDrawingBoard";
import type { GrassLayout, GrassTakeoff } from "@/components/grass/GrassDrawingBoard";

/**
 * The live design widget printed on a dossier page — the real drawing board for
 * the discipline (enclosure, fence, turf or site plan), not a picture of one.
 * Drawings persist per category and can be expanded to the full Editor Board.
 */

const SiteDrawingBoard = lazy(() => import("@/components/blueprint/SiteDrawingBoard"));
const FenceDrawingBoard = lazy(() => import("@/components/fence/FenceDrawingBoard"));
const EnclosureDrawingBoard = lazy(() => import("@/components/enclosure/EnclosureDrawingBoard"));
const GrassDrawingBoard = lazy(() => import("@/components/grass/GrassDrawingBoard"));

const emptySite: SitePlanData = { shapes: [], pxPerFt: DEFAULT_PX_PER_FT };
const emptyEnclosure: EnclosureLayout = { points: [], closed: false, features: {} };
const emptyFence: FenceLayout = { points: [], closed: false, gateSegments: [] };
const emptyGrass: GrassLayout = { areas: [] };

type Props = {
  categoryId: string;
  /** Expand into the full-screen Editor Board */
  onExpand?: () => void;
};

const FlipToolWidget: React.FC<Props> = ({ categoryId, onExpand }) => {
  const board = boardForCategory(categoryId);
  const [readout, setReadout] = useState<string>("");

  const [site, setSite] = usePersistentState<SitePlanData>(`flip_tool_site_${categoryId}`, emptySite);
  const [enclosure, setEnclosure] = usePersistentState<EnclosureLayout>(
    `flip_tool_enclosure_${categoryId}`,
    emptyEnclosure,
  );
  const [fence, setFence] = usePersistentState<FenceLayout>(`flip_tool_fence_${categoryId}`, emptyFence);
  const [grass, setGrass] = usePersistentState<GrassLayout>(`flip_tool_grass_${categoryId}`, emptyGrass);
  const [grassId, setGrassId] = usePersistentState<string>(`flip_tool_grass_active_${categoryId}`, "");

  const onEnclosureMeasure = useCallback((t: EnclosureTakeoff) => {
    setReadout(
      t.areaSqFt > 0
        ? `${Math.round(t.areaSqFt).toLocaleString()} sq ft footprint · ${Math.round(t.perimeterFt)} lf perimeter`
        : "",
    );
  }, []);
  const onFenceMeasure = useCallback((linearFt: number, gates: number) => {
    setReadout(linearFt > 0 ? `${Math.round(linearFt).toLocaleString()} linear ft · ${gates} gate${gates === 1 ? "" : "s"}` : "");
  }, []);
  const onGrassMeasure = useCallback((t: GrassTakeoff) => {
    setReadout(t.areaSqFt > 0 ? `${Math.round(t.areaSqFt).toLocaleString()} sq ft of turf` : "");
  }, []);

  const headerBlock = (
    <div className="flex items-center justify-between gap-3">
      <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
        {readout || "Draw on the grid — 1 ft squares"}
      </p>
      {onExpand && (
        <button
          onClick={onExpand}
          className="inline-flex items-center gap-2 border border-border/60 px-3 py-1.5 text-[8px] uppercase tracking-[0.3em] transition-colors hover:bg-foreground hover:text-background"
        >
          Full board <Maximize2 className="h-3 w-3" />
        </button>
      )}
    </div>
  );

  const surface = useMemo(() => {
    if (board.kind === "enclosure")
      return (
        <EnclosureDrawingBoard
          layout={enclosure}
          onChange={setEnclosure}
          onMeasure={onEnclosureMeasure}
          header={headerBlock}
        />
      );
    if (board.kind === "fence")
      return (
        <FenceDrawingBoard layout={fence} onChange={setFence} onMeasure={onFenceMeasure} header={headerBlock} />
      );
    if (board.kind === "grass")
      return (
        <GrassDrawingBoard
          layout={grass}
          onChange={setGrass}
          onMeasure={onGrassMeasure}
          activeGrassId={grassId}
          onActiveGrassChange={setGrassId}
          header={headerBlock}
        />
      );
    return <SiteDrawingBoard data={site} onChange={setSite} header={headerBlock} />;
  }, [
    headerBlock,
    board.kind,
    enclosure,
    setEnclosure,
    onEnclosureMeasure,
    fence,
    setFence,
    onFenceMeasure,
    grass,
    setGrass,
    onGrassMeasure,
    grassId,
    setGrassId,
    site,
    setSite,
  ]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-auto">
        <Suspense
          fallback={
            <div className="flex h-40 items-center justify-center text-[9px] uppercase tracking-[0.35em] text-muted-foreground">
              Preparing the board…
            </div>
          }
        >
          {surface}
        </Suspense>
      </div>
    </div>
  );
};

export default FlipToolWidget;
