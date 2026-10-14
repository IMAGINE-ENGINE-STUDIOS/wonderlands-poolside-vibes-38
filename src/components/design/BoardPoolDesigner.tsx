/**
 * BoardPoolDesigner — the full 2D Design Studio pool tool (same PoolBuilder,
 * category toolbar and tool sub-menu) opened over the Global Design Board V2.
 * "Place on board" converts the drawn outline (PoolBuilder px → feet via its
 * own scale) into one board piece, centred where the board's origin is.
 * Imagine Engine Studios Corp.
 */
import * as React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PoolBuilder } from "@/components/PoolBuilder";
import { CategoryToolbar } from "@/components/designStudio/CategoryToolbar";
import { SubToolbar } from "@/components/designStudio/SubToolbar";
import type { DesignCategory, ToolDefinition } from "@/components/designStudio/featureTypes";

type Pt = { x: number; y: number };

export default function BoardPoolDesigner({ kind, onClose, onPlace }: { kind: "pool" | "spa"; onClose: () => void; onPlace: (pts: Pt[]) => void }) {
  const [category, setCategory] = React.useState<DesignCategory>("pool");
  const [tool, setTool] = React.useState<string | null>(null);
  const [data, setData] = React.useState<any>(null);

  const place = () => {
    const pts: Pt[] = data?.points ?? [];
    const k = data?.scale || 10;
    if (pts.length < 3) return;
    const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length, cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
    onPlace(pts.map((p) => ({ x: Math.round(((p.x - cx) / k) * 10) / 10, y: Math.round(((p.y - cy) / k) * 10) / 10 })));
  };

  return (
    <div className="fixed inset-0 z-[10060] flex flex-col bg-background">
      <CategoryToolbar hideCategories activeCategory={category} onCategoryChange={setCategory}
        headerLeft={<div><p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">Global Design Board · 2D Studio</p><h2 className="font-serif text-lg leading-none">Design a {kind} from scratch</h2></div>}
        headerRight={<div className="flex items-center gap-2">
          <Button size="sm" className="h-8 rounded-none bg-foreground text-background hover:bg-foreground/85 text-[10px] uppercase tracking-[0.2em]" disabled={!data?.points?.length} onClick={place}>Place on board</Button>
          <Button size="sm" variant="outline" className="h-8 rounded-none" onClick={onClose} aria-label="Close"><X className="h-3.5 w-3.5" /></Button>
        </div>} />
      <SubToolbar hideTools category={category} activeTool={tool} onToolSelect={(t: ToolDefinition) => setTool(t.id)}
        stats={data ? { perimeter: data.perimeter, area: data.area, corners: data.points?.length || 0, features: data.features?.length || 0, deckArea: data.deckArea || 0, totalCost: data.breakdown?.total || data.totalCost || 0 } : null} />
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <PoolBuilder startInDrawMode externalTool={tool} externalTab={category} hideInternalTabs onToolUsed={() => {}} onPoolDataChange={setData} />
      </div>
    </div>
  );
}
