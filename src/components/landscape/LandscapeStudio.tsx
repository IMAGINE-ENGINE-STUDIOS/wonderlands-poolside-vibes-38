/**
 * Wonderlands Landscaping Studio — chapters I (Inspire) and II (Design).
 *
 * Wraps the existing planting board with: starting looks, "import my pool",
 * a Genius bar (Groq via `landscape-genius`, local phrase parser first), a live
 * take-off strip and a handoff to the plant catalog + estimate below.
 *
 * The plan lives in the shared FLIP board store under the global design board
 * id, so it is the SAME plan the global design board and its estimate read.
 */
import * as React from "react";
import { Suspense, lazy, useMemo, useState } from "react";
import { Box as Box3, Droplets, FileText, MapPinned, Ruler, Send, Shovel, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { setFlipBoardValue, useFlipBoard, getFlipBoardValue } from "@/components/flip/flipBoardStore";
import { measureLandscapeLayout, type LandscapeLayout, type LandscapeTakeoff } from "@/lib/landscape/landscapeEstimate";
import { LANDSCAPE_LOOKS, buildLook } from "@/lib/landscape/presets";
import { layoutTo3D, saveLandscape3D } from "@/lib/landscape/landscape3D";
import { applyLandscapeEdit, parseLocalEdit, type Frame, type LandscapeEdit } from "@/lib/landscape/landscapeOps";

const LandscapeDrawingBoard = lazy(() => import("./LandscapeDrawingBoard"));

export const LANDSCAPE_STUDIO_BOARD = "landscaping__global-design";
const SITE_BOARD = "pools__global-design";

/** Pool + deck bounding box (feet) from the shared site plan, if drawn. */
export function poolHoleFromSite(): Frame["hole"] | undefined {
  const site = getFlipBoardValue(SITE_BOARD).site;
  const px = site?.pxPerFt || 10;
  const pts = (site?.shapes ?? []).filter((s) => s.layer === "pool" || s.layer === "deck").flatMap((s) => s.points);
  if (!pts.length) return undefined;
  const xs = pts.map((p) => p.x / px), ys = pts.map((p) => p.y / px);
  return { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) };
}

const usd = (n: number) => `$${Math.round(n).toLocaleString()}`;

interface Props {
  onTakeoff?: (t: LandscapeTakeoff) => void;
  /** Called when a look that is priced by an agent is chosen */
  onAgentLook?: () => void;
  compact?: boolean;
  /** Override the 3D handoff (e.g. showroom opens its own 3D studio) */
  onView3D?: () => void;
}

export default function LandscapeStudio({ onTakeoff, onAgentLook, compact, onView3D }: Props) {
  const board = useFlipBoard(LANDSCAPE_STUDIO_BOARD);
  const layout = board.landscape;
  const [prompt, setPrompt] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [lookId, setLookId] = useState<string | null>(null);
  const hole = useMemo(() => poolHoleFromSite(), []);
  const takeoff = useMemo(() => measureLandscapeLayout(layout), [layout]);

  React.useEffect(() => { onTakeoff?.(takeoff); }, [takeoff, onTakeoff]);

  const setLayout = (l: LandscapeLayout) => setFlipBoardValue(LANDSCAPE_STUDIO_BOARD, { landscape: l });

  const pickLook = (id: string) => {
    const look = LANDSCAPE_LOOKS.find((l) => l.id === id)!;
    setLookId(id);
    setLayout(buildLook(look, hole));
    setNote(`${look.title} loaded — every plant is editable on the board.`);
    if (look.agentQuoted) onAgentLook?.();
    document.getElementById("landscape-design")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const apply = (edit: LandscapeEdit) => {
    setLayout(applyLandscapeEdit(getFlipBoardValue(LANDSCAPE_STUDIO_BOARD).landscape, edit, hole));
    setNote(edit.summary || "Plan updated.");
  };

  const ask = async () => {
    const text = prompt.trim();
    if (text.length < 3 || busy) return;
    setBusy(true);
    setNote("Genius is planning…");
    try {
      const summary = {
        beds: layout.beds.length,
        plants: takeoff.species.map((s) => `${s.qty}× ${s.name}`).slice(0, 20),
        pool: hole ? `${Math.round(hole.x1 - hole.x0)}×${Math.round(hole.y1 - hole.y0)} ft` : "none",
      };
      const { data, error } = await supabase.functions.invoke("landscape-genius", { body: { prompt: text, current: summary } });
      const edit = !error && data?.edit ? (data.edit as LandscapeEdit) : parseLocalEdit(text);
      if (edit) { apply(edit); setPrompt(""); }
      else setNote(data?.error || "Try naming a plant and where it goes — e.g. “three palms by the pool”.");
    } catch {
      const edit = parseLocalEdit(text);
      if (edit) { apply(edit); setPrompt(""); } else setNote("Genius is offline. Try naming a plant and a side.");
    } finally {
      setBusy(false);
    }
  };

  const stats = [
    { icon: Ruler, label: "Bed area", value: `${Math.round(takeoff.bedSqFt).toLocaleString()} sq ft` },
    { icon: MapPinned, label: "Edging", value: `${Math.round(takeoff.edgeFt)} ft` },
    { icon: Shovel, label: "Mulch", value: `${takeoff.mulchYards.toFixed(1)} cu yd` },
    { icon: FileText, label: "Plants", value: `${takeoff.plantCount}` },
    { icon: Droplets, label: "Irrigation", value: layout.irrigation ? `${takeoff.plantCount} points` : "Off" },
  ];

  return (
    <div className="space-y-14">
      {/* I. Inspire */}
      <div>
        <div className="flex items-baseline justify-between border-b border-border/60 pb-3 mb-6">
          <p className="text-[10px] uppercase tracking-[0.45em] text-muted-foreground">I. Inspire — start from a look</p>
          {hole && (
            <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
              <Waves className="h-3 w-3" /> Your pool is on the plan
            </span>
          )}
        </div>
        <div className={`grid gap-3 ${compact ? "grid-cols-2 md:grid-cols-5" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5"}`}>
          {LANDSCAPE_LOOKS.map((look, i) => (
            <button
              key={look.id}
              type="button"
              onClick={() => pickLook(look.id)}
              className={`text-left border p-5 transition-colors duration-300 ${lookId === look.id ? "border-foreground bg-foreground/5" : "border-border/60 hover:border-foreground/50"}`}
            >
              <span className="text-[9px] uppercase tracking-[0.35em] text-muted-foreground">Look {String(i + 1).padStart(2, "0")}</span>
              <div className="flex gap-1 my-3">
                {look.palette.map((c) => <span key={c} className="h-6 flex-1" style={{ background: c }} />)}
              </div>
              <div className="font-serif text-xl font-light text-foreground">{look.title}</div>
              {!compact && <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{look.mood}</p>}
            </button>
          ))}
        </div>
      </div>

      {/* II. Design */}
      <div id="landscape-design" className="scroll-mt-24">
        <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-border/60 pb-3 mb-4">
          <p className="text-[10px] uppercase tracking-[0.45em] text-muted-foreground">II. Design — draw beds, place real plants</p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="rounded-none text-[10px] uppercase tracking-[0.3em]" onClick={() => setLayout({ ...layout, irrigation: !layout.irrigation })}>
              Irrigation {layout.irrigation ? "on" : "off"}
            </Button>
            <Button size="sm" className="rounded-none text-[10px] uppercase tracking-[0.3em]" disabled={!layout.plantings.length && !layout.beds.length}
              onClick={() => { saveLandscape3D(layoutTo3D(layout, hole)); if (onView3D) onView3D(); else window.open("/studio-3d", "_blank", "noopener"); }}>
              <Box3 className="h-3.5 w-3.5 mr-2" /> View in 3D
            </Button>
            <Button size="sm" variant="ghost" className="rounded-none text-[10px] uppercase tracking-[0.3em]" onClick={() => { setLayout({ beds: [], plantings: [], irrigation: false }); setLookId(null); }}>
              Clear plan
            </Button>
          </div>
        </div>

        {/* Genius bar */}
        <form onSubmit={(e) => { e.preventDefault(); ask(); }} className="flex gap-2 mb-2">
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask Genius — “privacy hedge along the back”, “three palms by the pool”, “make it low-maintenance”"
            className="rounded-none"
            disabled={busy}
          />
          <Button type="submit" className="rounded-none text-[10px] uppercase tracking-[0.3em]" disabled={busy}>
            <Send className="h-3.5 w-3.5 mr-2" /> Genius
          </Button>
        </form>
        <p className="text-xs text-muted-foreground min-h-[1.25rem] mb-3">{note}</p>

        <div className="border border-border/60 bg-card/40 min-h-[520px]">
          <Suspense fallback={<div className="h-[520px] grid place-items-center text-sm text-muted-foreground">Opening the planting board…</div>}>
            <LandscapeDrawingBoard
              layout={layout}
              onChange={setLayout}
              activePlantKey={board.plantKey || undefined}
              onActivePlantChange={(k) => setFlipBoardValue(LANDSCAPE_STUDIO_BOARD, { plantKey: k })}
            />
          </Suspense>
        </div>

        {/* Live take-off */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 border border-t-0 border-border/60">
          {stats.map(({ icon: Icon, label, value }) => (
            <div key={label} className="p-4 border-r border-border/60 last:border-r-0">
              <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.35em] text-muted-foreground"><Icon className="h-3 w-3" />{label}</div>
              <div className="font-serif text-lg font-light text-foreground mt-1">{value}</div>
            </div>
          ))}
          <div className="p-4 bg-foreground/5">
            <div className="text-[9px] uppercase tracking-[0.35em] text-muted-foreground">Plan installed</div>
            <div className="font-serif text-lg font-light text-foreground mt-1">{usd(takeoff.total)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
