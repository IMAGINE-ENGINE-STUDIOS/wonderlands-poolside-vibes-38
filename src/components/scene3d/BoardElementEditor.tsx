/**
 * Widget for Global Design Board pieces in the 3D Studio — same panel look as
 * the pool widgets. Click a fence, screen cage or extra pool/spa to edit it:
 *  - Fence: metal color, height.
 *  - Screen enclosure: frame color, wall height, roof (mansard / flat).
 *  - Pools / spas are edited by the main pool widgets (see UnifiedPoolVisualizer activeWater).
 * Edits write back through updateBoard3D so they persist and re-render live.
 * Imagine Engine Studios Corp.
 */
import * as React from "react";
import { X } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useDraggablePanel } from "./useDraggablePanel";
import { updateBoard3D, loadBoard3D, BOARD_3D_EVENT, type Board3D, waterAxis, waterCenter } from "@/lib/design/board3D";
import { DepthProfileEditor } from "./DepthProfileEditor";
import { createDefaultLinearAnchors, getZeroEntry, applyZeroEntry, removeZeroEntry } from "./depthUtils";
import { buildFinishTextures, buildWaterlineTextures, buildPaverTextures } from "@/data/textureLibrary";
import { BOARD_SELECT_EVENT, type BoardSelection } from "./BoardElements3D";

const METALS = [{ n: "Black", c: "#1f1f1f" }, { n: "Bronze", c: "#6b4a2b" }, { n: "White", c: "#f4f4f2" }, { n: "Silver", c: "#b8bcc2" }];
/** Vinyl fence tints (panels and posts are picked separately). */
const VINYLS = [{ n: "White", c: "#ffffff" }, { n: "Almond", c: "#e8dcc4" }, { n: "Tan", c: "#c8b28c" }, { n: "Clay", c: "#a89a86" }, { n: "Grey", c: "#8d9093" }, { n: "Black", c: "#2a2a2a" }];
/** Same catalog photos the main pool widgets use (finish, waterline, coping). */
let photoLists: { f: { n: string; c: string }[]; t: { n: string; c: string }[]; k: { n: string; c: string }[] } | null = null;
const photos = () => photoLists ??= {
  f: buildFinishTextures().map((x) => ({ n: x.name, c: x.url })),
  t: buildWaterlineTextures().map((x) => ({ n: x.name, c: x.url })),
  k: buildPaverTextures("coping").map((x) => ({ n: x.name, c: x.url })),
};

const Swatches: React.FC<{ label: string; list: { n: string; c: string }[]; value: string; onPick: (c: string) => void }> = ({ label, list, value, onPick }) => (
  <div className="space-y-1.5">
    <Label className="text-xs">{label}</Label>
    <div className="grid max-h-40 grid-cols-4 gap-2 overflow-y-auto pr-1">
      {list.map((o) => (
        <button key={o.c} onClick={() => onPick(o.c)} title={o.n}
          className={`relative h-12 rounded-lg overflow-hidden border-2 transition-all ${value === o.c ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/50"}`}
          style={/^(\/|https?:)/.test(o.c) ? undefined : { background: o.c }}>
          {/^(\/|https?:)/.test(o.c) && <img src={o.c} alt={o.n} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />}
          <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-1 pb-0.5 text-[9px] font-medium text-white truncate">{o.n}</span>
        </button>
      ))}
    </div>
  </div>
);
const Range: React.FC<{ label: string; v: number; min: number; max: number; step: number; unit?: string; on: (n: number) => void }> = ({ label, v, min, max, step, unit = "ft", on }) => (
  <div className="space-y-1.5">
    <Label className="text-xs">{label}: {Math.round(v * 10) / 10} {unit}</Label>
    <Slider value={[v]} min={min} max={max} step={step} onValueChange={([n]) => on(n)} />
  </div>
);

/** Scale a ring about its centre along x (length) / z (width). */
const resize = (pts: { x: number; z: number }[], L: number, W: number) => {
  const xs = pts.map((p) => p.x), zs = pts.map((p) => p.z);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cz = (Math.min(...zs) + Math.max(...zs)) / 2;
  const kl = L / (Math.max(...xs) - Math.min(...xs) || 1), kw = W / (Math.max(...zs) - Math.min(...zs) || 1);
  return pts.map((p) => ({ x: cx + (p.x - cx) * kl, z: cz + (p.z - cz) * kw }));
};
const dims = (pts: { x: number; z: number }[]) => {
  const xs = pts.map((p) => p.x), zs = pts.map((p) => p.z);
  return { L: Math.max(...xs) - Math.min(...xs), W: Math.max(...zs) - Math.min(...zs) };
};

export const BoardElementEditor: React.FC = () => {
  const dragPanel = useDraggablePanel("board-piece");
  const [sel, setSel] = React.useState<BoardSelection>(null);
  const [data, setData] = React.useState<Board3D | null>(() => loadBoard3D());
  const [profileOpen, setProfileOpen] = React.useState(false);
  const [anchorSel, setAnchorSel] = React.useState<string | null>(null);
  React.useEffect(() => {
    const onSel = (e: Event) => setSel((e as CustomEvent<BoardSelection>).detail);
    const onData = () => setData(loadBoard3D());
    window.addEventListener(BOARD_SELECT_EVENT, onSel); window.addEventListener(BOARD_3D_EVENT, onData);
    return () => { window.removeEventListener(BOARD_SELECT_EVENT, onSel); window.removeEventListener(BOARD_3D_EVENT, onData); };
  }, []);
  if (!sel || !data) return null;
  const edit = (fn: (d: Board3D) => void) => updateBoard3D((d) => { const n: Board3D = JSON.parse(JSON.stringify(d)); fn(n); return n; });

  let title = "", body: React.ReactNode = null;
  if (sel.type === "fence" && data.fences[sel.i]) {
    const f = data.fences[sel.i];
    title = "Fence";
    body = <>
      {f.style === "vinyl" ? <>
        {/* Vinyl: panels and posts are colored separately (both white by default). */}
        <Swatches label="Panel color" list={VINYLS} value={f.color} onPick={(c) => edit((d) => { d.fences[sel.i].color = c; })} />
        <Swatches label="Post color" list={VINYLS} value={f.postColor ?? "#ffffff"} onPick={(c) => edit((d) => { d.fences[sel.i].postColor = c; })} />
      </> : <Swatches label="Metal color" list={METALS} value={f.color} onPick={(c) => edit((d) => { d.fences[sel.i].color = c; })} />}
      <Range label="Height" v={f.height} min={3} max={8} step={0.5} on={(n) => edit((d) => { d.fences[sel.i].height = n; })} />
    </>;
  } else if (sel.type === "screen" && data.screens[sel.i]) {
    const s = data.screens[sel.i];
    title = "Screen enclosure";
    body = <>
      <Swatches label="Frame color" list={METALS} value={s.color} onPick={(c) => edit((d) => { d.screens[sel.i].color = c; })} />
      <Range label="Wall height" v={s.height} min={8} max={20} step={0.5} on={(n) => edit((d) => { d.screens[sel.i].height = n; })} />
      <div className="space-y-1.5">
        <Label className="text-xs">Roof</Label>
        <div className="flex gap-1.5">{(["mansard", "flat"] as const).map((r) => (
          <button key={r} onClick={() => edit((d) => { d.screens[sel.i].roof = r; })}
            className={`glass-btn h-8 flex-1 rounded-lg text-xs capitalize ${(s.roof ?? "mansard") === r ? "ring-2 ring-primary" : ""}`}>{r}</button>
        ))}</div>
      </div>
    </>;
  } else return null;

  return (
    <div {...dragPanel.panelProps} className="fixed right-4 top-1/2 -translate-y-1/2 w-80 glass-panel rounded-xl shadow-2xl z-[9999] animate-in slide-in-from-right duration-300 pointer-events-auto">
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
        <h3 className="font-semibold text-base">{title} Settings</h3>
        <button aria-label="Close" onClick={() => setSel(null)} className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-muted"><X className="h-4 w-4" /></button>
      </div>
      <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">{body}</div>
    </div>
  );
};

export default BoardElementEditor;
