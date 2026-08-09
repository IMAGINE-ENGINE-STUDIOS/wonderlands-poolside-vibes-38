import * as React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, CheckCircle2, CircleAlert, Plus, Printer, RotateCcw, Search, ShieldCheck, Upload } from 'lucide-react';
import usePersistentState from '@/hooks/usePersistentState';
import BlueprintSheet from '@/components/blueprint/BlueprintSheet';
import BlueprintImportDialog from '@/components/blueprint/BlueprintImportDialog';
import SurveyAnalyzerDialog from '@/components/blueprint/SurveyAnalyzerDialog';
import FloridaDigitalSealDialog from '@/components/blueprint/FloridaDigitalSealDialog';
import { canonicalSignaturePayload } from '@/components/blueprint/signaturePayload';
import type { BlueprintProject } from '@/components/blueprint/types';
import { measureSitePlan } from '@/components/blueprint/SiteDrawingBoard';
import {
  JURISDICTIONS,
  PERMIT_TYPES,
  PROJECT_TYPES,
  findJurisdiction,
  findProjectType,
  resolveNoteGroups,
  resolveSheets,
  type PermitTypeId,
  type ProjectTypeId,
} from '@/data/blueprintJurisdictions';
import { DEFAULT_POOL_ROW, SHEET_TEMPLATES } from '@/data/blueprintTemplates';

const today = () => new Date().toLocaleDateString('en-US');

const INITIAL: BlueprintProject = {
  jurisdictionId: 'port-richey-pasco',
  projectTypeId: 'fiberglass-pool',
  permitTypeIds: ['residential-pool', 'electrical-sub', 'plumbing-sub'],
  engineer: {
    firm: 'ENGINEER OF RECORD',
    firmLicense: '',
    address: '',
    website: '',
    engineerName: '',
    engineerLicense: '',
    engineerEmail: '',
    shaCode: '',
    sealDisclaimer:
      'IF ITEM HAS BEEN ELECTRONICALLY SIGNED AND SEALED, MUST USE THE SHA AUTHENTICATION CODE TO VERIFY ELECTRONIC COPIES. PRINTED COPIES OF THIS DOCUMENT ARE NOT CONSIDERED SIGNED AND SEALED; MUST VERIFY THE PRINTED SHA. DUPLICATION AND DISTRIBUTION OF THIS DRAWING SHOULD BE REQUESTED FROM THE ENGINEER OF RECORD.',
  },
  contractor: {
    tradeName: 'Wonderlands World',
    legalName: 'WONDERLANDS WORLD LLC',
    license: '',
    address: '',
    phone: '',
  },
  project: {
    jobNumber: '00001',
    title: 'POOL DESIGN',
    clientName: '',
    address: '',
    cityStateZip: '',
    parcelId: '',
    scale: '1" = 20\'',
    pageSize: '36x24',
    filePath: 'PROJECTS / POOL DESIGN / R0',
  },
  revisions: [{ rev: '0', description: 'FOR CONST.', drawn: '', drawnDate: today(), approved: '', approvedDate: today() }],
  pool: { ...DEFAULT_POOL_ROW },
  scopeOfWork: PROJECT_TYPES[0].scope,
  existingAreas: { building: 0, driveway: 0, patio: 0 },
  site: { shapes: [], pxPerFt: 8 },
  signatures: {
    engineerSignedDate: '',
    contractorSignerName: '',
    contractorSignedDate: '',
    ownerSignerName: '',
    ownerSignedDate: '',
    sealNote: '',
  },
  sheetNotes: {},
  disabledSheets: [],
};

const PRINT_CSS = `
@media print {
  body * { visibility: hidden !important; }
  #bp-print, #bp-print * { visibility: visible !important; }
  #bp-print { position: absolute; inset: 0; width: 100%; }
  .bp-sheet { break-after: page; page-break-after: always; box-shadow: none !important; }
  .bp-sheet:last-child { break-after: auto; page-break-after: auto; }
  @page { size: 36in 24in landscape; margin: 0.25in; }
}
`;

const Field: React.FC<{ label: string; value: string; onChange: (v: string) => void; placeholder?: string }> = ({
  label,
  value,
  onChange,
  placeholder,
}) => (
  <div className="space-y-1">
    <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</Label>
    <Input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="h-8 text-sm" />
  </div>
);

const BlueprintBuilder: React.FC = () => {
  const [data, setData] = usePersistentState<BlueprintProject>('blueprint_builder_v1', INITIAL);
  const [jurisdictionQuery, setJurisdictionQuery] = React.useState('');
  const [activeSheet, setActiveSheet] = usePersistentState<string>('blueprint_active_sheet', 'A1');
  const [sealDialogOpen, setSealDialogOpen] = React.useState(false);
  const [printAll, setPrintAll] = React.useState(false);
  const [importOpen, setImportOpen] = React.useState(false);

  const jurisdiction = findJurisdiction(data.jurisdictionId);
  const projectType = findProjectType(data.projectTypeId);
  const resolved = resolveSheets(data.jurisdictionId, data.projectTypeId);
  const sheets = resolved.filter(code => !data.disabledSheets.includes(code));
  const noteGroups = resolveNoteGroups(data.jurisdictionId, data.projectTypeId, sheets);
  const measured = measureSitePlan(data.site);

  React.useEffect(() => {
    if (!sheets.includes(activeSheet) && sheets.length) setActiveSheet(sheets[0]);
  }, [sheets, activeSheet, setActiveSheet]);

  const patch = (fn: (draft: BlueprintProject) => BlueprintProject) => setData(prev => fn(prev));

  const filteredJurisdictions = React.useMemo(() => {
    const q = jurisdictionQuery.trim().toLowerCase();
    if (!q) return JURISDICTIONS;
    return JURISDICTIONS.filter(j => `${j.city} ${j.county} ${j.authority}`.toLowerCase().includes(q));
  }, [jurisdictionQuery]);

  const availablePermits = PERMIT_TYPES.filter(p => projectType.permits.includes(p.id));

  const checklist = React.useMemo(() => {
    const items: { label: string; done: boolean }[] = [
      { label: 'Jurisdiction selected', done: Boolean(data.jurisdictionId) },
      { label: 'Property boundary drawn', done: measured.propertySqFt > 0 },
      { label: 'Residence footprint drawn', done: measured.byLayer.building > 0 },
      { label: 'Proposed pool / structure drawn', done: measured.byLayer.pool > 0 || measured.byLayer.deck > 0 },
      { label: `Impervious within ${jurisdiction.maxImperviousPct}% limit`, done: measured.imperviousPct <= jurisdiction.maxImperviousPct },
      { label: 'Pool barrier / fence shown', done: measured.fenceLinearFt > 0 },
      { label: 'Contractor license entered', done: Boolean(data.contractor.license) },
      { label: 'Project address entered', done: Boolean(data.project.address && data.project.cityStateZip) },
      { label: 'Client name entered', done: Boolean(data.project.clientName) },
    ];
    if (jurisdiction.requiresEngineerSeal) {
      items.push({ label: 'Engineer of record + license entered', done: Boolean(data.engineer.engineerName && data.engineer.engineerLicense) });
      items.push({
        label: 'Florida electronic signature & seal applied',
        done: Boolean(data.signatures.digitalSignature?.signedAt),
      });
    }
    data.permitTypeIds.forEach(id => {
      const permit = PERMIT_TYPES.find(p => p.id === id);
      if (permit) items.push({ label: `${permit.label} selected`, done: true });
    });
    return items;
  }, [data, jurisdiction, measured]);

  const readiness = Math.round((checklist.filter(c => c.done).length / checklist.length) * 100);

  const applyProjectType = (id: ProjectTypeId) => {
    const pt = findProjectType(id);
    patch(prev => ({
      ...prev,
      projectTypeId: id,
      scopeOfWork: pt.scope,
      permitTypeIds: pt.permits,
      disabledSheets: [],
    }));
  };

  const togglePermit = (id: PermitTypeId) =>
    patch(prev => ({
      ...prev,
      permitTypeIds: prev.permitTypeIds.includes(id) ? prev.permitTypeIds.filter(p => p !== id) : [...prev.permitTypeIds, id],
    }));

  const handlePrint = (all: boolean) => {
    setPrintAll(all);
    window.setTimeout(() => {
      window.print();
      window.setTimeout(() => setPrintAll(false), 500);
    }, 120);
  };

  const printedSheets = printAll ? sheets : [activeSheet];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Blueprint Builder | Permit Plan Sets for Florida Pools & Patios</title>
        <meta
          name="description"
          content="Build permit-ready pool, patio and enclosure plan sets with title blocks, code notes, signature panels and county-specific requirements across Florida."
        />
        <link rel="canonical" href="https://www.wonderlandsworld.com/blueprint-builder" />
      </Helmet>
      <style>{PRINT_CSS}</style>

      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur print:hidden">
        <div className="mx-auto flex max-w-[1700px] flex-wrap items-center gap-3 px-4 py-3">
          <Button asChild variant="ghost" size="sm">
            <Link to="/">
              <ArrowLeft className="mr-1 h-4 w-4" /> Home
            </Link>
          </Button>
          <div>
            <h1 className="text-lg font-semibold leading-tight">Blueprint Builder</h1>
            <p className="text-xs text-muted-foreground">
              Permit plan sets adapted to your county, project type and permit type
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {readiness}% submittal ready
            </Badge>
            <Button size="sm" variant="outline" onClick={() => handlePrint(false)}>
              <Printer className="mr-1 h-4 w-4" /> Print sheet
            </Button>
            <Button size="sm" onClick={() => handlePrint(true)}>
              <Printer className="mr-1 h-4 w-4" /> Print full set
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1700px] gap-4 px-4 py-4 lg:grid-cols-[340px_minmax(0,1fr)]">
        {/* Control column */}
        <div className="space-y-4 print:hidden">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Jurisdiction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  value={jurisdictionQuery}
                  onChange={e => setJurisdictionQuery(e.target.value)}
                  placeholder="Search city or county"
                  className="h-9 pl-8 text-sm"
                />
              </div>
              <ScrollArea className="h-44 rounded-md border border-border">
                <div className="divide-y divide-border">
                  {filteredJurisdictions.map(j => (
                    <button
                      key={j.id}
                      type="button"
                      onClick={() => patch(prev => ({ ...prev, jurisdictionId: j.id }))}
                      className={`w-full px-3 py-2 text-left text-sm transition hover:bg-muted ${
                        data.jurisdictionId === j.id ? 'bg-muted font-medium' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {j.city}, {j.county}
                        {j.reference ? (
                          <Badge variant="secondary" className="text-[10px]">
                            reference set
                          </Badge>
                        ) : null}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {j.windSpeedMph} mph &middot; max {j.maxImperviousPct}% impervious
                      </div>
                    </button>
                  ))}
                  {!filteredJurisdictions.length ? (
                    <p className="px-3 py-4 text-sm text-muted-foreground">No jurisdiction matches that search.</p>
                  ) : null}
                </div>
              </ScrollArea>

              <div className="space-y-1">
                <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Project type</Label>
                <Select value={data.projectTypeId} onValueChange={v => applyProjectType(v as ProjectTypeId)}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROJECT_TYPES.map(p => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Permit types</Label>
                {availablePermits.map(p => (
                  <label key={p.id} className="flex cursor-pointer items-start gap-2 text-sm">
                    <Checkbox checked={data.permitTypeIds.includes(p.id)} onCheckedChange={() => togglePermit(p.id)} />
                    <span>
                      {p.label}
                      <span className="block text-[11px] text-muted-foreground">{p.submittals.length} submittal items</span>
                    </span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Sheet set</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {resolved.map(code => {
                const enabled = !data.disabledSheets.includes(code);
                return (
                  <div key={code} className="flex items-center gap-2">
                    <Checkbox
                      checked={enabled}
                      onCheckedChange={() =>
                        patch(prev => ({
                          ...prev,
                          disabledSheets: enabled ? [...prev.disabledSheets, code] : prev.disabledSheets.filter(c => c !== code),
                        }))
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setActiveSheet(code)}
                      className={`flex-1 rounded px-2 py-1 text-left text-sm transition hover:bg-muted ${
                        activeSheet === code ? 'bg-muted font-medium' : ''
                      }`}
                    >
                      <span className="font-mono text-xs">{code}</span> {SHEET_TEMPLATES[code]?.description}
                    </button>
                  </div>
                );
              })}
              <div className="pt-2">
                <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Add optional sheet</Label>
                <Select
                  value=""
                  onValueChange={code =>
                    patch(prev => ({ ...prev, disabledSheets: prev.disabledSheets.filter(c => c !== code) }))
                  }
                >
                  <SelectTrigger className="mt-1 h-9 text-sm">
                    <SelectValue placeholder="Restore a removed sheet" />
                  </SelectTrigger>
                  <SelectContent>
                    {data.disabledSheets.length ? (
                      data.disabledSheets.map(code => (
                        <SelectItem key={code} value={code}>
                          {code} - {SHEET_TEMPLATES[code]?.description}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>
                        Nothing removed
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Submittal readiness</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {checklist.map(item => (
                <div key={item.label} className="flex items-start gap-2 text-sm">
                  {item.done ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  ) : (
                    <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                  <span className={item.done ? '' : 'text-muted-foreground'}>{item.label}</span>
                </div>
              ))}
              <div className="pt-2 text-[11px] text-muted-foreground">
                Local requirements: {jurisdiction.localRequirements.join('; ')}
              </div>
            </CardContent>
          </Card>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setData({ ...INITIAL, site: { shapes: [], pxPerFt: 8 } })}
            className="w-full"
          >
            <RotateCcw className="mr-1 h-4 w-4" /> Reset plan set
          </Button>

          <BlueprintImportDialog
            open={importOpen}
            onOpenChange={setImportOpen}
            site={data.site}
            onApply={site => setData(prev => ({ ...prev, site }))}
          />
          <Button variant="outline" size="sm" onClick={() => setImportOpen(true)} className="w-full">
            <Upload className="mr-1 h-4 w-4" /> Import existing blueprint
          </Button>

          <SurveyAnalyzerDialog
            open={surveyOpen}
            onOpenChange={setSurveyOpen}
            project={data}
            onApply={next => setData(next)}
          />
          <Button size="sm" onClick={() => setSurveyOpen(true)} className="w-full">
            <Ruler className="mr-1 h-4 w-4" /> Analyze survey &amp; autofill
          </Button>
        </div>

        {/* Sheet + data entry */}
        <div className="space-y-4">
          <Tabs defaultValue="sheet">
            <TabsList className="print:hidden">
              <TabsTrigger value="sheet">Sheet</TabsTrigger>
              <TabsTrigger value="info">Info boxes</TabsTrigger>
              <TabsTrigger value="signatures">Signatures</TabsTrigger>
            </TabsList>

            <TabsContent value="sheet" className="mt-3">
              <div className="mb-2 flex flex-wrap gap-1.5 print:hidden">
                {sheets.map(code => (
                  <Button
                    key={code}
                    size="sm"
                    variant={activeSheet === code ? 'default' : 'outline'}
                    onClick={() => setActiveSheet(code)}
                  >
                    {code}
                  </Button>
                ))}
              </div>
              <div id="bp-print" className="space-y-6">
                {printedSheets.map(code => (
                  <BlueprintSheet
                    onRequestImport={() => setImportOpen(true)}

                    key={code}
                    data={data}
                    sheetCode={code}
                    sheets={sheets}
                    noteGroups={noteGroups}
                    onSiteChange={site => patch(prev => ({ ...prev, site }))}
                    onDataChange={patch}
                    onSheetSelect={setActiveSheet}
                    readOnly={printAll && code !== activeSheet}
                  />
                ))}
              </div>
              <div className="mt-3 space-y-1 print:hidden">
                <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Project specific notes for {activeSheet}
                </Label>
                <Textarea
                  value={data.sheetNotes[activeSheet] || ''}
                  onChange={e =>
                    patch(prev => ({ ...prev, sheetNotes: { ...prev.sheetNotes, [activeSheet]: e.target.value } }))
                  }
                  placeholder="Additional notes printed on this sheet"
                  className="min-h-[80px] text-sm"
                />
              </div>
            </TabsContent>

            <TabsContent value="info" className="mt-3 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Project information</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-3">
                  <Field label="Job number" value={data.project.jobNumber} onChange={v => patch(p => ({ ...p, project: { ...p.project, jobNumber: v } }))} />
                  <Field label="Drawing title" value={data.project.title} onChange={v => patch(p => ({ ...p, project: { ...p.project, title: v } }))} />
                  <Field label="Client name" value={data.project.clientName} onChange={v => patch(p => ({ ...p, project: { ...p.project, clientName: v } }))} />
                  <Field label="Address" value={data.project.address} onChange={v => patch(p => ({ ...p, project: { ...p.project, address: v } }))} />
                  <Field label="City, state, zip" value={data.project.cityStateZip} onChange={v => patch(p => ({ ...p, project: { ...p.project, cityStateZip: v } }))} />
                  <Field label="Parcel ID" value={data.project.parcelId} onChange={v => patch(p => ({ ...p, project: { ...p.project, parcelId: v } }))} />
                  <Field label="Scale" value={data.project.scale} onChange={v => patch(p => ({ ...p, project: { ...p.project, scale: v } }))} />
                  <Field label="Page size" value={data.project.pageSize} onChange={v => patch(p => ({ ...p, project: { ...p.project, pageSize: v } }))} />
                  <Field label="File path" value={data.project.filePath} onChange={v => patch(p => ({ ...p, project: { ...p.project, filePath: v } }))} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Engineer of record</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-3">
                  <Field label="Firm" value={data.engineer.firm} onChange={v => patch(p => ({ ...p, engineer: { ...p.engineer, firm: v } }))} />
                  <Field label="Firm license" value={data.engineer.firmLicense} onChange={v => patch(p => ({ ...p, engineer: { ...p.engineer, firmLicense: v } }))} />
                  <Field label="Firm address" value={data.engineer.address} onChange={v => patch(p => ({ ...p, engineer: { ...p.engineer, address: v } }))} />
                  <Field label="Website" value={data.engineer.website} onChange={v => patch(p => ({ ...p, engineer: { ...p.engineer, website: v } }))} />
                  <Field label="Engineer name" value={data.engineer.engineerName} onChange={v => patch(p => ({ ...p, engineer: { ...p.engineer, engineerName: v } }))} />
                  <Field label="Engineer license no." value={data.engineer.engineerLicense} onChange={v => patch(p => ({ ...p, engineer: { ...p.engineer, engineerLicense: v } }))} />
                  <Field label="Engineer email" value={data.engineer.engineerEmail} onChange={v => patch(p => ({ ...p, engineer: { ...p.engineer, engineerEmail: v } }))} />
                  <Field label="SHA authentication code" value={data.engineer.shaCode} onChange={v => patch(p => ({ ...p, engineer: { ...p.engineer, shaCode: v } }))} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Contractor</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-3">
                  <Field label="Trade name" value={data.contractor.tradeName} onChange={v => patch(p => ({ ...p, contractor: { ...p.contractor, tradeName: v } }))} />
                  <Field label="Legal name" value={data.contractor.legalName} onChange={v => patch(p => ({ ...p, contractor: { ...p.contractor, legalName: v } }))} />
                  <Field label="License number" value={data.contractor.license} onChange={v => patch(p => ({ ...p, contractor: { ...p.contractor, license: v } }))} />
                  <Field label="Address" value={data.contractor.address} onChange={v => patch(p => ({ ...p, contractor: { ...p.contractor, address: v } }))} />
                  <Field label="Phone" value={data.contractor.phone} onChange={v => patch(p => ({ ...p, contractor: { ...p.contractor, phone: v } }))} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Pool data schedule</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-4">
                  <Field label="Model" value={data.pool.model} onChange={v => patch(p => ({ ...p, pool: { ...p.pool, model: v } }))} />
                  <Field label="Code" value={data.pool.code} onChange={v => patch(p => ({ ...p, pool: { ...p.pool, code: v } }))} />
                  <Field label="Width x length" value={data.pool.size} onChange={v => patch(p => ({ ...p, pool: { ...p.pool, size: v } }))} />
                  <Field label="Depths" value={data.pool.depths} onChange={v => patch(p => ({ ...p, pool: { ...p.pool, depths: v } }))} />
                  <Field label="Gallons" value={data.pool.gallons} onChange={v => patch(p => ({ ...p, pool: { ...p.pool, gallons: v } }))} />
                  <Field label="Water surface (SF)" value={data.pool.waterSurfaceSf} onChange={v => patch(p => ({ ...p, pool: { ...p.pool, waterSurfaceSf: v } }))} />
                  <Field label="Perimeter (LF)" value={data.pool.perimeterFt} onChange={v => patch(p => ({ ...p, pool: { ...p.pool, perimeterFt: v } }))} />
                  <Field label="Steps (LF)" value={data.pool.stepsFt} onChange={v => patch(p => ({ ...p, pool: { ...p.pool, stepsFt: v } }))} />
                  <Field label="Seats (LF)" value={data.pool.seatsFt} onChange={v => patch(p => ({ ...p, pool: { ...p.pool, seatsFt: v } }))} />
                  <Field label="Weight (lb)" value={data.pool.weightLb} onChange={v => patch(p => ({ ...p, pool: { ...p.pool, weightLb: v } }))} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Existing impervious areas (sq ft)</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-3">
                  <Field
                    label="Building areas"
                    value={String(data.existingAreas.building)}
                    onChange={v => patch(p => ({ ...p, existingAreas: { ...p.existingAreas, building: Number(v) || 0 } }))}
                  />
                  <Field
                    label="Driveway"
                    value={String(data.existingAreas.driveway)}
                    onChange={v => patch(p => ({ ...p, existingAreas: { ...p.existingAreas, driveway: Number(v) || 0 } }))}
                  />
                  <Field
                    label="Conc. patio / AC pad"
                    value={String(data.existingAreas.patio)}
                    onChange={v => patch(p => ({ ...p, existingAreas: { ...p.existingAreas, patio: Number(v) || 0 } }))}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Scope of work</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {data.scopeOfWork.map((line, i) => (
                    <div key={`${line}-${i}`} className="flex gap-2">
                      <Input
                        value={line}
                        onChange={e =>
                          patch(p => ({ ...p, scopeOfWork: p.scopeOfWork.map((l, idx) => (idx === i ? e.target.value : l)) }))
                        }
                        className="h-8 text-sm"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => patch(p => ({ ...p, scopeOfWork: p.scopeOfWork.filter((_, idx) => idx !== i) }))}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button size="sm" variant="outline" onClick={() => patch(p => ({ ...p, scopeOfWork: [...p.scopeOfWork, ''] }))}>
                    <Plus className="mr-1 h-4 w-4" /> Add scope line
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Revisions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {data.revisions.map((r, i) => (
                    <div key={`${r.rev}-${i}`} className="grid gap-2 md:grid-cols-6">
                      {(['rev', 'description', 'drawn', 'drawnDate', 'approved', 'approvedDate'] as const).map(key => (
                        <Input
                          key={key}
                          value={r[key]}
                          placeholder={key}
                          onChange={e =>
                            patch(p => ({
                              ...p,
                              revisions: p.revisions.map((row, idx) => (idx === i ? { ...row, [key]: e.target.value } : row)),
                            }))
                          }
                          className="h-8 text-sm"
                        />
                      ))}
                    </div>
                  ))}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      patch(p => ({
                        ...p,
                        revisions: [
                          ...p.revisions,
                          {
                            rev: String(p.revisions.length),
                            description: 'REVISION',
                            drawn: '',
                            drawnDate: today(),
                            approved: '',
                            approvedDate: today(),
                          },
                        ],
                      }))
                    }
                  >
                    <Plus className="mr-1 h-4 w-4" /> Add revision
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="signatures" className="mt-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Signature &amp; seal section</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-2">
                  <Field label="Engineer signed date" value={data.signatures.engineerSignedDate} onChange={v => patch(p => ({ ...p, signatures: { ...p.signatures, engineerSignedDate: v } }))} />
                  <Field label="Contractor signer" value={data.signatures.contractorSignerName} onChange={v => patch(p => ({ ...p, signatures: { ...p.signatures, contractorSignerName: v } }))} />
                  <Field label="Contractor signed date" value={data.signatures.contractorSignedDate} onChange={v => patch(p => ({ ...p, signatures: { ...p.signatures, contractorSignedDate: v } }))} />
                  <Field label="Owner signer" value={data.signatures.ownerSignerName} onChange={v => patch(p => ({ ...p, signatures: { ...p.signatures, ownerSignerName: v } }))} />
                  <Field label="Owner signed date" value={data.signatures.ownerSignedDate} onChange={v => patch(p => ({ ...p, signatures: { ...p.signatures, ownerSignedDate: v } }))} />
                  <div className="md:col-span-2 space-y-1.5 rounded-md border p-3">
                    <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      Florida electronic signature &amp; seal
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Florida requires the design professional's electronic signature to be a digital certificate
                      signature or a published SHA authentication code, with the statutory statement printed beside the
                      seal. Applying it here binds the signature to a hash of this plan set — any later edit prints as
                      invalidated.
                    </p>
                    {data.signatures.digitalSignature?.signedAt ? (
                      <p className="break-all font-mono text-[11px]">
                        {data.signatures.digitalSignature.hashAlgorithm} AUTH CODE:{' '}
                        {data.signatures.digitalSignature.authCode}
                      </p>
                    ) : null}
                    <Button variant="outline" size="sm" onClick={() => setSealDialogOpen(true)}>
                      <ShieldCheck className="mr-1.5 h-4 w-4" />
                      {data.signatures.digitalSignature?.signedAt ? 'Manage signature & seal' : 'Sign & seal plan set'}
                    </Button>
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Seal disclaimer</Label>
                    <Textarea
                      value={data.engineer.sealDisclaimer}
                      onChange={e => patch(p => ({ ...p, engineer: { ...p.engineer, sealDisclaimer: e.target.value } }))}
                      className="min-h-[90px] text-sm"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-1.5">
                    <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Required submittals</Label>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {data.permitTypeIds
                        .flatMap(id => PERMIT_TYPES.find(p => p.id === id)?.submittals || [])
                        .map(s => (
                          <li key={s}>&middot; {s}</li>
                        ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <FloridaDigitalSealDialog
        open={sealDialogOpen}
        onOpenChange={setSealDialogOpen}
        payload={canonicalSignaturePayload(data)}
        value={data.signatures.digitalSignature}
        defaultSignerName={data.engineer.engineerName}
        defaultLicense={data.engineer.engineerLicense}
        onApply={signature =>
          patch(p => ({
            ...p,
            signatures: { ...p.signatures, digitalSignature: signature },
            engineer: { ...p.engineer, shaCode: signature.authCode },
          }))
        }
        onRemove={() =>
          patch(p => ({
            ...p,
            signatures: { ...p.signatures, digitalSignature: undefined },
            engineer: { ...p.engineer, shaCode: '' },
          }))
        }
      />
    </div>
  );
};

export default BlueprintBuilder;
