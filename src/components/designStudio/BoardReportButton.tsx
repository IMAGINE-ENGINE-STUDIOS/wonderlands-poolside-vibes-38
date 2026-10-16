/**
 * BoardReportButton — "Reports" in the Design Studio header. Opens one widget
 * with a tab per element type (Pools, Decks, Fences, Screens, Turf), showing the
 * same measurements each original drawing board reports: lengths, areas,
 * perimeters, posts, gates/doors and costs — for every element on the board.
 * Credit: Imagine Engine Studios Corp.
 */
import * as React from "react";
import { ClipboardList } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSiteElements, elementQty, gateLines, type SiteElement } from "./SiteElementsLayer";

type Pt = { x: number; y: number };
const len = (p: Pt[], s: number, closed = false) => { let d = 0; for (let i = 1; i < p.length; i++) d += Math.hypot(p[i].x - p[i - 1].x, p[i].y - p[i - 1].y); if (closed && p.length > 2) d += Math.hypot(p[0].x - p[p.length - 1].x, p[0].y - p[p.length - 1].y); return d / s; };
const area = (p: Pt[], s: number) => Math.abs(p.reduce((a, q, i) => { const r = p[(i + 1) % p.length]; return a + q.x * r.y - r.x * q.y; }, 0) / 2) / (s * s);
const money = (n: number) => `$${Math.round(n).toLocaleString()}`;
const f1 = (n: number) => Math.round(n * 10) / 10;

interface Props { scale: number; poolPts: Pt[]; deckPts: Pt[]; poolDepth?: number; additionalPools?: Array<{ id: string; type?: string; points: Pt[] }>; additionalDecks?: Record<string, Pt[]> }

const Table: React.FC<{ head: string[]; rows: Array<Array<React.ReactNode>>; empty: string }> = ({ head, rows, empty }) =>
  rows.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">{empty}</p> : (
    <div className="max-h-[55vh] overflow-auto">
      <table className="w-full text-[12px]">
        <thead><tr className="border-b border-border text-left text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{head.map((h) => <th key={h} className="py-2 pr-3 font-semibold">{h}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => <tr key={i} className="border-b border-border/60 text-foreground">{r.map((c, j) => <td key={j} className="py-2 pr-3 align-top">{c}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );

export const BoardReportButton: React.FC<Props> = ({ scale, poolPts, deckPts, poolDepth = 6, additionalPools = [], additionalDecks = {} }) => {
  const [open, setOpen] = React.useState(false);
  const [items] = useSiteElements();
  const s = scale || 10;
  const by = (k: SiteElement["kind"]) => items.filter((e) => e.kind === k);

  const pools = [
    ...(poolPts.length >= 3 ? [{ name: "Main pool", pts: poolPts, deck: deckPts }] : []),
    ...additionalPools.filter((p) => p.points?.length >= 3).map((p, i) => ({ name: `${p.type === "spa" ? "Spa" : "Pool"} ${i + 2}`, pts: p.points, deck: additionalDecks[p.id] ?? [] })),
  ];
  const lin = (e: SiteElement) => {
    const g = gateLines(e);
    return { q: elementQty(e, s), g, gCost: g.reduce((a, x) => a + x.price, 0), gText: g.length ? g.map((x) => `${x.n}× ${x.label}`).join(", ") : "—" };
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border bg-background px-3 text-[11px] font-bold uppercase tracking-[0.15em] text-foreground hover:bg-muted" aria-label="Reports">
        <ClipboardList className="h-3.5 w-3.5" /><span className="hidden md:inline">Reports</span>
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>Board reports</DialogTitle></DialogHeader>
          <Tabs defaultValue="pools">
            <TabsList className="flex w-full flex-wrap">
              <TabsTrigger value="pools">Pools & spas</TabsTrigger>
              <TabsTrigger value="decks">Decks</TabsTrigger>
              <TabsTrigger value="fences">Fences</TabsTrigger>
              <TabsTrigger value="screens">Screens</TabsTrigger>
              <TabsTrigger value="turf">Turf</TabsTrigger>
            </TabsList>
            <TabsContent value="pools">
              <Table empty="No pools on the board yet." head={["Body", "Water area", "Perimeter", "Corners", "Deep end", "Deck around"]}
                rows={pools.map((p) => [p.name, `${f1(area(p.pts, s))} sq ft`, `${f1(len(p.pts, s, true))} ft`, p.pts.length, `${poolDepth} ft`, p.deck.length >= 3 ? `${f1(Math.max(0, area(p.deck, s) - area(p.pts, s)))} sq ft` : "No deck"])} />
            </TabsContent>
            <TabsContent value="decks">
              <Table empty="No decks on the board yet." head={["Deck", "Paver", "Area", "Perimeter", "Cost"]}
                rows={[...pools.filter((p) => p.deck.length >= 3).map((p) => [`${p.name} deck`, "Pool deck paver", `${f1(Math.max(0, area(p.deck, s) - area(p.pts, s)))} sq ft`, `${f1(len(p.deck, s, true))} ft`, "In pool total"]),
                  ...by("deck").map((e, i) => [`Drawn deck ${i + 1}`, e.label, `${f1(area(e.pts, s))} sq ft`, `${f1(len(e.pts, s, true))} ft`, money(area(e.pts, s) * e.rate)])]} />
            </TabsContent>
            <TabsContent value="fences">
              <Table empty="No fences on the board yet." head={["Fence", "Style", "Height", "Length", "Posts (6 ft)", "Gates", "Cost"]}
                rows={by("fence").map((e, i) => { const r = lin(e); return [`Fence ${i + 1}`, e.label, `${e.height ?? 4} ft`, `${f1(r.q)} lf`, Math.ceil(r.q / 6) + 1, r.gText, money(r.q * e.rate + r.gCost)]; })} />
            </TabsContent>
            <TabsContent value="screens">
              <Table empty="No screens on the board yet." head={["Screen", "Style", "Height", "Footprint", "Perimeter", "Doors", "Cost"]}
                rows={by("enclosure").map((e, i) => { const r = lin(e); return [`Screen ${i + 1}`, e.label, `${e.height ?? 10} ft`, `${f1(area(e.pts, s))} sq ft`, `${f1(len(e.pts, s, true))} ft`, r.gText, money(r.q * e.rate + r.gCost)]; })} />
            </TabsContent>
            <TabsContent value="turf">
              <Table empty="No turf on the board yet." head={["Turf", "Product", "Area", "Edge length", "Cost"]}
                rows={by("turf").map((e, i) => [`Turf ${i + 1}`, e.label, `${f1(area(e.pts, s))} sq ft`, `${f1(len(e.pts, s, true))} ft`, money(area(e.pts, s) * e.rate)])} />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
};
