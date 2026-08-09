import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, CircleAlert, Loader2, Ruler, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { importBlueprintFile, type ImportedDrawing } from '@/lib/blueprintImport';
import { analyzeSurveySheet, applySurveyToProject, surveyGaps, vectorizeSurvey } from '@/lib/surveyAnalysis';
import { CANVAS_H, CANVAS_W, type SitePlanData } from './SiteDrawingBoard';
import type { BlueprintProject, SurveyRecord } from './types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: BlueprintProject;
  onApply: (next: BlueprintProject) => void;
}

const Row: React.FC<{ label: string; value?: string | number | null }> = ({ label, value }) => (
  <div className="flex items-start justify-between gap-3 border-b border-border/60 py-1 text-xs">
    <span className="text-muted-foreground">{label}</span>
    <span className="max-w-[60%] text-right font-medium">{value === null || value === undefined || value === '' ? '—' : value}</span>
  </div>
);

/**
 * Reads an uploaded survey (PDF / JPG / PNG), transcribes its permit data and
 * vectorizes the lot and improvements into fully editable drawing-board splines.
 */
export const SurveyAnalyzerDialog: React.FC<Props> = ({ open, onOpenChange, project, onApply }) => {
  const [busy, setBusy] = React.useState<'reading' | 'analyzing' | null>(null);
  const [source, setSource] = React.useState<ImportedDrawing | null>(null);
  const [pageIndex, setPageIndex] = React.useState(0);
  const [survey, setSurvey] = React.useState<SurveyRecord | null>(null);
  const [keepUnderlay, setKeepUnderlay] = React.useState(true);
  const [replaceShapes, setReplaceShapes] = React.useState(true);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const reset = () => {
    setSource(null);
    setSurvey(null);
    setPageIndex(0);
    setBusy(null);
  };

  const handleFile = async (file: File) => {
    setBusy('reading');
    setSurvey(null);
    try {
      const imported = await importBlueprintFile(file);
      if (!imported.rasterPages.length) {
        throw new Error('Upload a PDF, JPG or PNG of the survey sheet.');
      }
      setSource(imported);
      setPageIndex(0);
      imported.warnings.forEach(w => toast.warning(w));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not read that file.');
    } finally {
      setBusy(null);
    }
  };

  const runAnalysis = async () => {
    const page = source?.rasterPages[pageIndex];
    if (!source || !page) return;
    setBusy('analyzing');
    try {
      const result = await analyzeSurveySheet({ imageDataUrl: page.dataUrl, textLayer: source.text });
      setSurvey({ ...result, sourceFile: source.fileName });
      toast.success('Survey read — review the values, then vectorize.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'The survey could not be analyzed.');
    } finally {
      setBusy(null);
    }
  };

  const apply = () => {
    if (!survey || !source) return;
    const page = source.rasterPages[pageIndex];
    const base: SitePlanData = replaceShapes ? { ...project.site, shapes: [] } : project.site;
    let site = vectorizeSurvey(survey, base);

    if (keepUnderlay && page) {
      const scale = Math.min((CANVAS_W - 40) / page.widthPx, (CANVAS_H - 40) / page.heightPx);
      site = {
        ...site,
        underlay: {
          dataUrl: page.dataUrl,
          x: (CANVAS_W - page.widthPx * scale) / 2,
          y: (CANVAS_H - page.heightPx * scale) / 2,
          scale,
          opacity: 0.35,
          visible: true,
          locked: false,
          label: `${source.fileName} — ${page.label}`,
          naturalWidth: page.widthPx,
          naturalHeight: page.heightPx,
        },
      };
    }

    onApply(applySurveyToProject(project, { ...survey, sourceFile: source.fileName }, site));
    toast.success('Survey applied — boundary, improvements and permit data are now editable.');
    reset();
    onOpenChange(false);
  };

  const gaps = survey ? surveyGaps(survey) : [];
  const featureCount = survey?.geometry?.features?.length || 0;

  return (
    <Dialog
      open={open}
      onOpenChange={o => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ruler className="h-4 w-4 text-primary" /> Survey analyzer
          </DialogTitle>
          <DialogDescription>
            Upload a boundary, plot or topographic survey. The sheet is read, its permit data transcribed, and the lot plus every
            improvement vectorized into editable splines you can reshape and build a pool on.
          </DialogDescription>
        </DialogHeader>

        <div
          onDragOver={e => e.preventDefault()}
          onDrop={e => {
            e.preventDefault();
            const file = e.dataTransfer.files?.[0];
            if (file) handleFile(file);
          }}
          className="flex flex-col items-center gap-2 rounded-md border border-dashed border-border bg-muted/30 p-5 text-center"
        >
          {busy === 'reading' ? <Loader2 className="h-6 w-6 animate-spin text-primary" /> : <Upload className="h-6 w-6 text-muted-foreground" />}
          <p className="text-sm text-muted-foreground">Drop the survey here, or</p>
          <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={!!busy}>
            Choose survey file
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,image/*"
            className="hidden"
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = '';
            }}
          />
        </div>

        {source ? (
          <ScrollArea className="max-h-[52vh] pr-3">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <Badge variant="secondary">{source.kind.toUpperCase()}</Badge>
                <span className="font-medium">{source.fileName}</span>
                {source.rasterPages.length > 1 ? (
                  <div className="ml-auto w-40">
                    <Select value={String(pageIndex)} onValueChange={v => setPageIndex(Number(v))}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {source.rasterPages.map((p, i) => (
                          <SelectItem key={i} value={String(i)}>
                            {p.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : null}
              </div>

              <img
                src={source.rasterPages[pageIndex]?.dataUrl}
                alt={`Survey sheet preview: ${source.rasterPages[pageIndex]?.label}`}
                loading="lazy"
                className="w-full rounded-md border border-border bg-white"
              />

              {!survey ? (
                <Button type="button" onClick={runAnalysis} disabled={busy === 'analyzing'} className="w-full">
                  {busy === 'analyzing' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Read this survey
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Property</Label>
                      <Row label="Lot" value={survey.property?.lotNumber} />
                      <Row label="Subdivision" value={survey.property?.subdivision} />
                      <Row label="Phase" value={survey.property?.phase} />
                      <Row label="Plat book / pages" value={[survey.property?.platBook, survey.property?.platPages].filter(Boolean).join(' / ')} />
                      <Row label="County" value={survey.property?.county} />
                      <Row label="Address" value={survey.property?.streetAddress} />
                      <Row label="Parcel ID" value={survey.property?.parcelId} />
                      <Row label="Scale" value={survey.property?.scaleText} />
                    </div>
                    <div>
                      <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Lot & elevations</Label>
                      <Row label="Width" value={survey.lot?.widthFt ? `${survey.lot.widthFt}'` : null} />
                      <Row label="Depth" value={survey.lot?.depthFt ? `${survey.lot.depthFt}'` : null} />
                      <Row label="Area" value={survey.lot?.areaSf ? `${survey.lot.areaSf.toLocaleString()} SF` : null} />
                      <Row label="Finished floor" value={survey.elevations?.finishedFloorFt} />
                      <Row label="Flood zone" value={survey.elevations?.floodZone} />
                      <Row label="FIRM panel" value={survey.elevations?.firmPanel} />
                      <Row label="Surveyor" value={survey.surveyor?.name || survey.surveyor?.firm} />
                      <Row label="License" value={survey.surveyor?.licenseNumber} />
                    </div>
                  </div>

                  <div>
                    <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Setbacks read from the sheet</Label>
                    <div className="mt-1 grid grid-cols-2 gap-x-4 sm:grid-cols-3">
                      <Row label="Front" value={survey.setbacks?.frontFt} />
                      <Row label="Front porch" value={survey.setbacks?.frontPorchFt} />
                      <Row label="Rear" value={survey.setbacks?.rearFt} />
                      <Row label="Side" value={survey.setbacks?.sideFt} />
                      <Row label="Side corner" value={survey.setbacks?.sideCornerFt} />
                      <Row label="Rear pool" value={survey.setbacks?.rearPoolFt} />
                    </div>
                  </div>

                  <div className="rounded-md border border-border p-3 text-xs">
                    <div className="flex items-center gap-2 font-medium">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      {featureCount} improvement{featureCount === 1 ? '' : 's'} traced + lot boundary
                      {survey.geometry?.lotPolygon?.length ? ` (${survey.geometry.lotPolygon.length} corners)` : ''}
                    </div>
                    {gaps.length ? (
                      <div className="mt-2 flex items-start gap-2 text-muted-foreground">
                        <CircleAlert className="mt-[2px] h-4 w-4 shrink-0" />
                        <span>Not found on this sheet — fill in by hand: {gaps.join(', ')}.</span>
                      </div>
                    ) : (
                      <p className="mt-2 text-muted-foreground">Every permit field required by the plan set was found.</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs">
                      <Checkbox checked={replaceShapes} onCheckedChange={v => setReplaceShapes(!!v)} />
                      Replace what is currently drawn
                    </label>
                    <label className="flex items-center gap-2 text-xs">
                      <Checkbox checked={keepUnderlay} onCheckedChange={v => setKeepUnderlay(!!v)} />
                      Keep the survey sheet behind the drawing as a faded reference
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <Button type="button" variant="outline" className="flex-1" onClick={runAnalysis} disabled={busy === 'analyzing'}>
                      {busy === 'analyzing' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Re-read
                    </Button>
                    <Button type="button" className="flex-1" onClick={apply}>
                      Vectorize & autofill
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default SurveyAnalyzerDialog;
