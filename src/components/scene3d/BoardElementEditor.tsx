/**
 * Widget for Global Design Board pieces in the 3D Studio — same panel look as
 * the pool widgets. Click a fence, screen cage or extra pool/spa to edit it:
 *  - Fence: metal color, height.
 *  - Screen enclosure: frame color, wall height, roof (mansard / flat).
 *  - Pool / spa: finish, waterline tile, coping color + width, depth, length, width.
 * Edits write back through updateBoard3D so they persist and re-render live.
 * Imagine Engine Studios Corp.
 */
import * as React from "react";
import { X } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useDraggablePanel } from "./useDraggablePanel";
import { updateBoard3D, loadBoard3D, BOARD_3D_EVENT, type Board3D } from "@/lib/design/board3D";
import { BOARD_SELECT_EVENT, type BoardSelection } from "./BoardElements3D";

const METALS = [{ n: "Black", c: "#1f1f1f" }, { n: "Bronze", c: "#6b4a2b" }, { n: "White", c: "#f4f4f2" }, { n: "Silver", c: "#b8bcc2" }];
const FINISHES = [{ n: "Pearl white", c: "#dfe8ea" }, { n: "Lagoon blue", c: "#5fb7d4" }, { n: "Midnight", c: "#2b4a66" }, { n: "Tahoe grey", c: "#8fa3ad" }];
const TILES = [{ n: "Ocean", c: "#2f6f8f" }, { n: "Glass teal", c: "#2aa7a7" }, { n: "Slate", c: "#4a5560" }, { n: "Sand", c: "#c9b28c" }];
const COPINGS = [{ n: "Travertine", c: "#e2d3b8" }, { n: "Coralina", c: "#d8d2c8" }, { n: "Concrete", c: "#c9c3b8" }, { n: "Appian", c: "#b98a62" }];

const Swatches: React.FC<{ label: string; list: { n: string; c: string }[]; value: string; onPick: (c: string) => void }> = ({ label, list, value, onPick }) => (
  <div className="space-y-1.5">
    <Label className="text-xs">{label}</Label>
    <div className="grid grid-cols-4 gap-2">
      {list.map((o) => (
        <button key={o.c} onClick={() => onPick(o.c)} title={o.n}
          className={`relative h-12 rounded-lg overflow-hidden border-2 transition-all ${value === o.c ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/50"}`}
          style={{ background: o.c }}>
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
      <Swatches label="Metal color" list={METALS} value={f.color} onPick={(c) => edit((d) => { d.fences[sel.i].color = c; })} />
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
  } else if (sel.type === "water" && data.waters?.[sel.i]) {
    const w = data.waters[sel.i]; const { L, W } = dims(w.pts);
    title = `${w.kind === "spa" ? "Spa" : "Pool"} · ${w.label}`;
    body = <>
      <Swatches label="Finish" list={FINISHES} value={w.finish} onPick={(c) => edit((d) => { d.waters![sel.i].finish = c; })} />
      <Swatches label="Waterline tile" list={TILES} value={w.waterline} onPick={(c) => edit((d) => { d.waters![sel.i].waterline = c; })} />
      <Swatches label="Coping" list={COPINGS} value={w.coping} onPick={(c) => edit((d) => { d.waters![sel.i].coping = c; })} />
      <Range label="Coping width" v={w.copingWidth} min={0.5} max={2} step={0.1} on={(n) => edit((d) => { d.waters![sel.i].copingWidth = n; })} />
      <Range label="Depth" v={w.depth} min={2} max={9} step={0.25} on={(n) => edit((d) => { d.waters![sel.i].depth = n; })} />
      <Range label="Length" v={L} min={4} max={60} step={0.5} on={(n) => edit((d) => { d.waters![sel.i].pts = resize(w.pts, n, W); })} />
      <Range label="Width" v={W} min={4} max={30} step={0.5} on={(n) => edit((d) => { d.waters![sel.i].pts = resize(w.pts, L, n); })} />
    </>;
  } else return null;

  return (
    <div className="absolute right-20 top-20 z-50 w-80 space-y-4 border border-border bg-background/95 p-4 text-foreground shadow-2xl backdrop-blur-md">
      <div className="flex items-center justify-between">
        <p className="font-serif text-lg leading-none">{title}</p>
        <button aria-label="Close" onClick={() => setSel(null)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
      </div>
      {body}
    </div>
  );
};

export default BoardElementEditor;
