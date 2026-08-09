import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import {
  importBlueprintFile,
  fitShapesToBox,
  guessSiteLayer,
  type ImportedDrawing,
} from '@/lib/blueprintImport';
import {
  CANVAS_H,
  CANVAS_W,
  SITE_LAYERS,
  type SiteLayerId,
  type SitePlanData,
  type SiteShape,
} from './SiteDrawingBoard';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  site: SitePlanData;
  onApply: (site: SitePlanData) => void;
}

/**
 * Brings an existing plan set into the builder. PDF / JPG / PNG sheets land as
 * a calibratable underlay to trace over; DXF and SVG geometry lands as real
 * editable site polygons with their CAD layers mapped onto our site layers.
 */
export const BlueprintImportDialog: React.FC<Props> = ({ open, onOpenChange, site, onApply }) => {
  const [busy, setBusy] = React.useState(false);
  const [result, setResult] = React.useState<ImportedDrawing | null>(null);
  const [pageIndex, setPageIndex] = React.useState(0);
  const [layerMap, setLayerMap] = React.useState<Record<string, SiteLayerId | 'skip'>>({});
  const inputRef = React.useRef<HTMLInputElement>(null);

  const reset = () => {
    setResult(null);
    setPageIndex(0);
    setLayerMap({});
  };

  const handleFile = async (file: File) => {
    setBusy(true);
    try {
      const imported = await importBlueprintFile(file);
      const map: Record<string, SiteLayerId | 'skip'> = {};
      imported.vectorShapes.forEach(s => {
        if (!map[s.sourceLayer]) map[s.sourceLayer] = guessSiteLayer(s.sourceLayer) as SiteLayerId;
      });
      setResult(imported);
      setLayerMap(map);
      setPageIndex(0);
      imported.warnings.forEach(w => toast.warning(w));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not read that file.');
    } finally {
      setBusy(false);
    }
  };

  const sourceLayers = React.useMemo(() => Object.keys(layerMap), [layerMap]);

  const apply = () => {
    if (!result) return;
    let next: SitePlanData = { ...site };

    const page = result.rasterPages[pageIndex];
    if (page) {
      const scale = Math.min((CANVAS_W - 40) / page.widthPx, (CANVAS_H - 40) / page.heightPx);
      next = {
        ...next,
        underlay: {
          dataUrl: page.dataUrl,
          x: (CANVAS_W - page.widthPx * scale) / 2,
          y: (CANVAS_H - page.heightPx * scale) / 2,
          scale,
          opacity: 0.55,
          visible: true,
          locked: false,
          label: `${result.fileName} — ${page.label}`,
          naturalWidth: page.widthPx,
          naturalHeight: page.heightPx,
        },
      };
    }

    const keep = result.vectorShapes.filter(s => layerMap[s.sourceLayer] !== 'skip');
    if (keep.length) {
      const fitted = fitShapesToBox(keep, { width: CANVAS_W, height: CANVAS_H, padding: 50 });
      const shapes: SiteShape[] = fitted.shapes.map((s, i) => ({
        id: `import-${Date.now()}-${i}`,
        layer: (layerMap[s.sourceLayer] as SiteLayerId) || 'property',
        points: s.points,
        closed: s.closed,
        importedFrom: result.fileName,
      }));
      next = { ...next, shapes: [...next.shapes, ...shapes] };
    }

    onApply(next);
    toast.success(
      `${result.fileName} imported${keep.length ? ` — ${keep.length} editable shapes` : ''}${page ? ' — underlay placed, use Calibrate to set the scale' : ''}.`
    );
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={o => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import an existing blueprint</DialogTitle>
          <DialogDescription>
            PDF, JPG or PNG sheets become a traceable underlay. AutoCAD DXF and Vectorworks / Illustrator SVG exports become
            fully editable site geometry. DWG, VWX and RVT must be exported to DXF, SVG or PDF first.
          </DialogDescription>
        </DialogHeader>

        <div
          onDragOver={e => e.preventDefault()}
          onDrop={e => {
            e.preventDefault();
            const file = e.dataTransfer.files?.[0];
            if (file) handleFile(file);
          }}
          className="flex flex-col items-center gap-2 rounded-md border border-dashed border-border bg-muted/30 p-6 text-center"
        >
          {busy ? (
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          ) : (
            <Upload className="h-6 w-6 text-muted-foreground" />
          )}
          <p className="text-sm text-muted-foreground">Drop a plan file here, or</p>
          <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={busy}>
            Choose file
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.dxf,.svg,image/*"
            className="hidden"
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = '';
            }}
          />
        </div>

        {result ? (
          <ScrollArea className="max-h-[46vh] pr-3">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <Badge variant="secondary">{result.kind.toUpperCase()}</Badge>
                <span className="font-medium">{result.fileName}</span>
                <span className="text-muted-foreground">
                  {result.rasterPages.length} page{result.rasterPages.length === 1 ? '' : 's'} &middot;{' '}
                  {result.vectorShapes.length} vector shapes
                </span>
              </div>

              {result.rasterPages.length > 1 ? (
                <div className="space-y-1">
                  <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Sheet to trace</Label>
                  <Select value={String(pageIndex)} onValueChange={v => setPageIndex(Number(v))}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {result.rasterPages.map((p, i) => (
                        <SelectItem key={i} value={String(i)}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}

              {result.rasterPages[pageIndex] ? (
                <img
                  src={result.rasterPages[pageIndex].dataUrl}
                  alt={`Imported sheet preview: ${result.rasterPages[pageIndex].label}`}
                  loading="lazy"
                  className="w-full rounded-md border border-border bg-white"
                />
              ) : null}

              {sourceLayers.length ? (
                <div className="space-y-2">
                  <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    Map source layers to site layers
                  </Label>
                  {sourceLayers.map(src => (
                    <div key={src} className="grid grid-cols-[1fr_1fr] items-center gap-2">
                      <span className="truncate font-mono text-xs">{src}</span>
                      <Select
                        value={layerMap[src]}
                        onValueChange={v => setLayerMap(m => ({ ...m, [src]: v as SiteLayerId | 'skip' }))}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SITE_LAYERS.map(l => (
                            <SelectItem key={l.id} value={l.id}>
                              {l.label}
                            </SelectItem>
                          ))}
                          <SelectItem value="skip">Do not import</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </ScrollArea>
        ) : null}

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={apply} disabled={!result || busy}>
            Import into builder
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BlueprintImportDialog;
