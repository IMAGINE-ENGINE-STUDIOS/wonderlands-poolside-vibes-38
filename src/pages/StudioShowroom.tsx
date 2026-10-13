import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, ArrowUpRight, Loader2, Play, Waves, Boxes } from 'lucide-react';
import { cn } from '@/lib/utils';

import AdvancedSearch from '@/components/AdvancedSearch';
import StudioCartWidget from '@/components/StudioCartWidget';
import { PoolCalculator } from '@/components/PoolCalculator';
import HeaterSizeCalculator from '@/components/HeaterSizeCalculator';
import FinancingOptions from '@/components/FinancingOptions';
import ProductMediaGallery from '@/components/ProductMediaGallery';
import { DynamicFeatureRenderer } from '@/components/DynamicFeatureRenderer';
import { InlineCalculator } from '@/components/search/InlineCalculator';
import QuoteCalculators from '@/components/quote/QuoteCalculators';
import { SceneObjectsPanel } from '@/components/scene3d/SceneObjectsPanel';
import FlipProjectPipeline from '@/components/flip/FlipProjectPipeline';
import { DEFAULT_PX_PER_FT, type SitePlanData } from '@/components/blueprint/SiteDrawingBoard';
import { createDefaultDepthAxis, createDefaultLinearAnchors } from '@/components/scene3d/depthUtils';
import type { DepthAxis, LinearDepthAnchor } from '@/components/scene3d/types';
import type { FenceLayout } from '@/components/fence/FenceDrawingBoard';
import type { EnclosureLayout } from '@/components/enclosure/EnclosureDrawingBoard';
import { saunas } from '@/data/saunaData';

// ---- Main page widgets ----
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';
import SectionBanner from '@/components/SectionBanner';
import MissionVisionValues from '@/components/MissionVisionValues';
import BrowseCategoriesEditorial from '@/components/BrowseCategoriesEditorial';
import saunaBanner from '@/assets/banners/sauna-banner.webp';

import heroPool from '@/assets/hero/hero-pool-optimized.webp';
import maximaPool from '@/assets/pools/wonderlands/maxima-pool.webp';
import poolHeater from '@/assets/equipment/pool-heater.webp';

import { setNarratorContext } from '@/lib/narratorStore';
import {
  SHOWROOM_HOME_SECTIONS,
  SHOWROOM_WIDGETS,
  findShowroomWidget,
  registerShowroomControls,
  type ShowroomControls,
  type ShowroomWidget,
  type ShowroomFamily,
  SHOWROOM_FAMILY_LABEL,
  SHOWROOM_TIERS,
  showroomTierOf,
} from '@/lib/showroomBus';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { SocialiteGate } from '@/components/socialite/SocialiteAuth';

const DesignStudioTool = React.lazy(() => import('@/pages/DesignStudio'));
const FlipMagazine = React.lazy(() => import('@/components/flip/FlipMagazine'));
const FlipBuilderV2 = React.lazy(() => import('@/components/flip/FlipBuilderV2'));
const SocialiteTool = React.lazy(() => import('@/pages/Socialite'));
const SocialiteCloudSync = React.lazy(() => import('@/components/socialite/SocialiteCloudSync'));
const SolarCalculatorBoard = React.lazy(() => import('@/components/solar/SolarCalculatorBoard'));
const GlobalDesignBoardTool = React.lazy(() => import('@/pages/GlobalDesignBoard'));
const WonderlandsStudioTool = React.lazy(() => import('@/pages/WonderlandsStudio'));

const FenceDrawingBoard = React.lazy(() => import('@/components/fence/FenceDrawingBoard'));
const FenceConfigurator = React.lazy(() => import('@/components/fence/FenceConfigurator'));
const EnclosureDrawingBoard = React.lazy(() => import('@/components/enclosure/EnclosureDrawingBoard'));
const EnclosureConfigurator = React.lazy(() => import('@/components/enclosure/EnclosureConfigurator'));
const SaunaSalesPricingDialog = React.lazy(() => import('@/components/sauna/SaunaSalesPricingDialog'));
const SurveyQuoteTool = React.lazy(() => import('@/components/SurveyQuoteTool'));
const StudioSitePlanner = React.lazy(() =>
  import('@/components/studio/StudioSitePlanner').then((m) => ({ default: m.StudioSitePlanner })),
);
const GrassConfigurator = React.lazy(() => import('@/components/grass/GrassConfigurator'));
const FlipSearch = React.lazy(() => import('@/components/flip/FlipSearch'));
const SignaturePad = React.lazy(() =>
  import('@/components/blueprint/SignaturePad').then((m) => ({ default: m.SignaturePad })),
);
const BlueprintImportDialog = React.lazy(() =>
  import('@/components/blueprint/BlueprintImportDialog').then((m) => ({ default: m.BlueprintImportDialog })),
);
const DepthProfileEditor = React.lazy(() =>
  import('@/components/scene3d/DepthProfileEditor').then((m) => ({ default: m.DepthProfileEditor })),
);
const ShowroomStudio3D = React.lazy(() => import('@/components/showroom/ShowroomStudio3D'));
const ShowroomDemoSession = React.lazy(() => import('@/components/showroom/ShowroomDemoSession'));
const SiteBuilderTool = React.lazy(() => import('@/components/siteBuilder/SiteBuilder'));
const AdminDashboardTool = React.lazy(() => import('@/pages/AdminDashboard'));
const CompanyWorkspaceTool = React.lazy(() => import('@/pages/CompanyWorkspace'));
const CustomerAccountTool = React.lazy(() => import('@/pages/CustomerAccount'));
const SalesRepTool = React.lazy(() => import('@/pages/SalesRepDashboard'));
const BlueprintBuilderTool = React.lazy(() => import('@/pages/BlueprintBuilder'));
const SaunaProductCard = React.lazy(() => import('@/components/SaunaProductCard'));

// Home page catalog sections — lazy so only the selected one loads
const HOME_COMPONENTS: Record<string, React.LazyExoticComponent<any>> = {
  pools: React.lazy(() => import('@/components/PoolCatalog')),
  'gilmer-pools': React.lazy(() => import('@/components/GilmerPoolsSection')),
  saunas: React.lazy(() => import('@/components/SaunaSection')),
  spas: React.lazy(() => import('@/components/SpaCatalog')),
  'gilmer-spas': React.lazy(() => import('@/components/GilmerSpasSection')),
  'tanning-ledges': React.lazy(() => import('@/components/TanningLedgeSection')),
  'screen-enclosures': React.lazy(() => import('@/components/ScreenEnclosureSection')),
  'patio-fencing': React.lazy(() => import('@/components/PatioFencingSection')),
  lanai: React.lazy(() => import('@/components/LanaiSection')),
  pavers: React.lazy(() => import('@/components/PaversSection')),
  'artificial-grass': React.lazy(() => import('@/components/ArtificialGrassSection')),
  landscaping: React.lazy(() => import('@/components/LandscapingSection')),
  covers: React.lazy(() => import('@/components/AutomaticCoversSection')),
  'driveway-gates': React.lazy(() => import('@/components/DrivewayGateSection')),
  'pool-finishes': React.lazy(() => import('@/components/PoolFinishesSection')),
  liners: React.lazy(() => import('@/components/LinersSection')),
};

const Fallback = () => (
  <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
    <Loader2 className="h-4 w-4 animate-spin" /> Loading widget…
  </div>
);

const W = (id: string): ShowroomWidget => findShowroomWidget(id)!;

/* Each solution family gets its own frame chrome so frames are told apart at a glance. */
const FAMILY_CHROME: Record<ShowroomFamily, { bar: string; body: string; label: string }> = {
  cad: { bar: 'bg-foreground text-background', body: 'border-foreground/80 border-2', label: 'CAD · live canvas' },
  magazine: { bar: 'bg-muted text-foreground font-serif italic', body: 'border-double border-4 border-foreground/40', label: 'FLIP · edition' },
  console: { bar: 'bg-primary text-primary-foreground', body: 'border-primary/60 border-2', label: 'SOCIALITE · console' },
  desk: { bar: 'bg-background text-foreground border-b border-dashed border-foreground/40', body: 'border-dashed border-foreground/50 border', label: 'Document desk' },
  terminal: { bar: 'bg-secondary text-secondary-foreground font-mono', body: 'border-secondary border-2', label: 'Estimator terminal' },
  commerce: { bar: 'bg-accent text-accent-foreground', body: 'border-accent border', label: 'Commerce' },
  dashboard: { bar: 'bg-foreground/90 text-background font-mono', body: 'border-foreground/60 border-2 border-double', label: 'Dashboard · live' },
  catalog: { bar: 'bg-muted/60 text-muted-foreground', body: 'border-border/70 border', label: 'Catalog' },
};

const Frame = ({
  section,
  active,
  children,
}: {
  section: ShowroomWidget;
  active?: boolean;
  children: React.ReactNode;
}) => {
  const fam = section.family ?? 'catalog';
  const chrome = FAMILY_CHROME[fam];
  return (
    <section id={section.id} className="scroll-mt-28">
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
            <span className="font-mono text-xs tracking-[0.3em] text-muted-foreground">{section.index}</span>
            <h2 className="text-2xl md:text-3xl font-light tracking-tight">{section.title}</h2>
            <Badge variant="outline" className="rounded-none text-[10px] tracking-[0.2em] uppercase">{section.tag}</Badge>
            {active && (
              <Badge className="rounded-none text-[10px] tracking-[0.2em] uppercase">Genius here</Badge>
            )}
          </div>
          {section.eyebrow && (
            <p className="mt-3 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{section.eyebrow}</p>
          )}
          {section.headline && <p className="mt-1 font-serif text-xl">{section.headline}</p>}
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">{section.description}</p>
        </div>
        {section.capabilities?.length ? (
          <aside className="border-l border-border/70 pl-5 text-sm">
            {section.capabilities?.length ? (
              <ul className="space-y-1.5 text-muted-foreground">
                {section.capabilities.map((c) => (
                  <li key={c} className="flex gap-2"><span className="text-foreground">—</span>{c}</li>
                ))}
              </ul>
            ) : null}

          </aside>
        ) : null}
      </div>
      <div
        className={cn(
          'mt-6 overflow-hidden bg-card transition-shadow duration-500',
          chrome.body,
          active && 'ring-1 ring-primary/50 shadow-[0_30px_90px_-50px_hsl(var(--primary)/0.6)]',
        )}
      >
        <div className={cn('flex items-center justify-between px-4 py-2 text-[10px] uppercase tracking-[0.25em]', chrome.bar)}>
          <span>{section.index} · {chrome.label}</span>
          <span className="truncate opacity-70">Live in the showroom</span>
        </div>
        <div className="p-4 md:p-6">{children}</div>
      </div>
    </section>
  );
};

/** Auto-mounts page-scale tools when their frame scrolls near, so every tool plays in place yet the page stays fast. */
const AutoMount = ({ title, note, children, fit }: { title: string; note: string; children: React.ReactNode; fit?: boolean }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [on, setOn] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el || on) return;
    const io = new IntersectionObserver((e) => { if (e[0]?.isIntersecting) { setOn(true); io.disconnect(); } }, { rootMargin: '300px' });
    io.observe(el);
    return () => io.disconnect();
  }, [on]);
  if (!on) {
    return (
      <div ref={ref} className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">{note}</p>
        <Button className="rounded-none px-7 text-[10px] uppercase tracking-[0.28em]" onClick={() => setOn(true)}>
          <Play className="mr-2 h-3.5 w-3.5" /> Play {title}
        </Button>
      </div>
    );
  }
  return (
    <div className={cn('relative bg-background', fit ? 'overflow-x-auto' : 'max-h-[85vh] overflow-auto')}>
      <React.Suspense fallback={<Fallback />}>{children}</React.Suspense>
    </div>
  );
};

/** Website builder bound to the signed-in user's company. */
const ShowroomSiteBuilder = () => {
  const { user } = useAuth();
  const [co, setCo] = React.useState<{ id: string; name: string } | null | undefined>(undefined);
  React.useEffect(() => {
    if (!user) { setCo(null); return; }
    let alive = true;
    (async () => {
      const { data } = await supabase.from('company_members').select('company_id, companies(name)').eq('user_id', user.id).eq('is_active', true).limit(1).maybeSingle();
      if (alive) setCo(data ? { id: data.company_id, name: (data as any).companies?.name ?? 'My company' } : null);
    })();
    return () => { alive = false; };
  }, [user]);
  if (co === undefined) return <Fallback />;
  if (!co) return <p className="py-12 text-center text-sm text-muted-foreground">Sign in with a company account to build your website here.</p>;
  return <SiteBuilderTool companyId={co.id} companyName={co.name} />;
};

const DEMO_SCENE_GROUPS = [
  {
    key: 'water',
    label: 'Water bodies',
    items: [
      { id: 'pool-1', label: 'Pool shell', detail: '16 × 40 ft · 3′9″ – 8′6″', icon: <Waves className="h-3.5 w-3.5" /> },
      { id: 'spa-1', label: 'Spa', detail: '7 × 7 ft raised', icon: <Waves className="h-3.5 w-3.5" /> },
    ],
  },
  {
    key: 'hardscape',
    label: 'Hardscape',
    items: [
      { id: 'deck-1', label: 'Paver deck', detail: '1,240 sq ft · Travertine', icon: <Boxes className="h-3.5 w-3.5" /> },
      { id: 'coping-1', label: 'Coping ring', detail: 'Bullnose · 96 lf', icon: <Boxes className="h-3.5 w-3.5" /> },
    ],
  },
];

const EMPTY_PLAN: SitePlanData = { shapes: [], pxPerFt: DEFAULT_PX_PER_FT };

const StudioShowroom = () => {
  const navigate = useNavigate();
  const [extrasPool, setExtrasPool] = React.useState<any>({});
  const [extrasSauna, setExtrasSauna] = React.useState<any>({});
  const [fenceLayout, setFenceLayout] = React.useState<FenceLayout>({ points: [], closed: false, gateSegments: [] });
  const [enclosureLayout, setEnclosureLayout] = React.useState<EnclosureLayout>({ points: [], closed: false, features: {} });
  const [heater, setHeater] = React.useState<string | undefined>();
  const [quoteOpen, setQuoteOpen] = React.useState(false);
  const [quoteSeed, setQuoteSeed] = React.useState<{ name: string; price: number; type: string }>({
    name: 'Wonderlands Aurora 14x28',
    price: 68500,
    type: 'pool',
  });
  const [saunaPricingOpen, setSaunaPricingOpen] = React.useState(false);
  const [signatureOpen, setSignatureOpen] = React.useState(false);
  const [signature, setSignature] = React.useState<string | null>(null);
  const [blueprintOpen, setBlueprintOpen] = React.useState(false);
  const [importedPlan, setImportedPlan] = React.useState<SitePlanData>(EMPTY_PLAN);
  const [depthOpen, setDepthOpen] = React.useState(false);
  const [anchors, setAnchors] = React.useState<LinearDepthAnchor[]>(() => createDefaultLinearAnchors(3.75, 8.5));
  const [depthAxis, setDepthAxis] = React.useState<DepthAxis>(() => createDefaultDepthAxis([], { length: 40, width: 16 }));
  const [selectedAnchor, setSelectedAnchor] = React.useState<string | null>(null);
  const [inlineResult, setInlineResult] = React.useState('');
  const [browseActive, setBrowseActive] = React.useState('pools');
  const [homeSection, setHomeSection] = React.useState('pools');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeWidget, setActiveWidget] = React.useState<string | null>(null);
  const [planner3D, setPlanner3D] = React.useState<{ scene: any; lib: any } | null>(null);

  const ActiveHomeSection = HOME_COMPONENTS[homeSection] ?? HOME_COMPONENTS.pools;

  /* Genius reads this screen and can operate every widget on it. */
  React.useEffect(() => {
    setNarratorContext({
      scope: 'page',
      title: 'Studio Showroom',
      route: '/studio-showroom',
      features: SHOWROOM_WIDGETS.map((s) => s.title),
      key: 'showroom:index',
    });
    return () => setNarratorContext(null);
  }, []);

  React.useEffect(() => {
    const controls: ShowroomControls = {
      focus: (id) => {
        const widget = findShowroomWidget(id);
        if (!widget) return false;
        setActiveWidget(id);
        window.setTimeout(() => {
          document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 40);
        return true;
      },
      openQuote: (seed) => {
        if (seed?.name) {
          setQuoteSeed({ name: seed.name, price: seed.price ?? 0, type: seed.type ?? 'pool' });
        }
        setQuoteOpen(true);
      },
      openSaunaPricing: () => setSaunaPricingOpen(true),
      setHomeSection: (id) => {
        if (!HOME_COMPONENTS[id]) return false;
        setHomeSection(id);
        setBrowseActive(id);
        return true;
      },
      search: (query) => setSearchQuery(query),
      openSignature: () => setSignatureOpen(true),
      openDepth: () => setDepthOpen(true),
      openBlueprintImport: () => setBlueprintOpen(true),
    };
    return registerShowroomControls(controls);
  }, []);

  const media = React.useMemo(
    () => [
      { type: 'image' as const, url: heroPool, alt: 'Wonderlands pool with sun deck' },
      { type: 'image' as const, url: maximaPool, alt: 'Maxima fiberglass pool' },
      { type: 'image' as const, url: poolHeater, alt: 'Pool heater unit' },
    ],
    [],
  );

  const demoSauna = React.useMemo(() => saunas[0], []);
  const isActive = (id: string) => activeWidget === id;

  const renderers: Record<string, React.ReactNode> = {
    'design-studio': (
      <>
          <AutoMount fit title="Design Studio" note="The latest 2D board and 3D scene in one tool. Draw in 2D, switch to 3D and back — your pool, textures and shape stay as you left them.">
            <DesignStudioTool />
          </AutoMount>
      </>
    ),
    'studio-3d': (
      <AutoMount fit title="the 3D Studio" note="A rectangular pool, live in 3D. Orbit, change finishes and lights, and walk the deck.">
        <ShowroomStudio3D />
      </AutoMount>
    ),
    'flip-v8': (
      <>
          <AutoMount title="FLIP V8" note="The magazine exactly as it opens on the home page. Turn pages with the arrows.">
            <FlipMagazine variant="v8" hideHeader />
          </AutoMount>
      </>
    ),
    'flip-builder': (
      <>
          <AutoMount title="Flip Builder V3" note="Build your own book here. Work in the showroom is saved separately from your real books.">
            <FlipBuilderV2 storageKey="showroom.flip.v3" />
          </AutoMount>
      </>
    ),
    'socialite': (
      <>
          <AutoMount title="SOCIALITE" note="The full SOCIALITE console, opened on a demo account — no sign in needed.">
            <ShowroomDemoSession>
              <SocialiteGate>
                <SocialiteCloudSync>
                  <SocialiteTool />
                </SocialiteCloudSync>
              </SocialiteGate>
            </ShowroomDemoSession>
          </AutoMount>
      </>
    ),
    'solar': (
      <>
          <AutoMount title="the Solar Board" note="Search an address, trace the roof and see what it can produce.">
            <SolarCalculatorBoard height={620} />
          </AutoMount>
      </>
    ),
    'global-board': (
      <>
          <AutoMount title="the Global Board" note="Every trade on one property drawing, priced as you draw.">
            <GlobalDesignBoardTool />
          </AutoMount>
      </>
    ),
    'wonderlands-studio': (
      <>
          <AutoMount title="the Configuration Studio" note="Every category with one running total.">
            <WonderlandsStudioTool />
          </AutoMount>
      </>
    ),
    'search': (
      <>
          <div className="space-y-8">
            <div>
              <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Default variant</p>
              <AdvancedSearch externalQuery={searchQuery} />
            </div>
            <Separator />
            <div>
              <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Slim variant (studio)</p>
              <AdvancedSearch variant="slim" />
            </div>
          </div>
      </>
    ),
    'flip-search': (
      <>
          <React.Suspense fallback={<Fallback />}>
            <FlipSearch
              onOpenCategory={(categoryId) => navigate(`/flip?category=${encodeURIComponent(categoryId)}`)}
              onOpenProduct={(categoryId, entry) =>
                navigate(`/flip?category=${encodeURIComponent(categoryId)}&product=${encodeURIComponent(entry.id)}`)
              }
            />
          </React.Suspense>
      </>
    ),
    'cart': (
      <>
          <div className="max-w-md">
            <StudioCartWidget
              currentPrice={68500}
              currentName="Wonderlands Aurora 14x28"
              currentCategory="Pool"
              currentExtras={[
                { name: 'Salt system', price: 2400, key: 'demo-salt' },
                { name: 'LED lighting', price: 1200, key: 'demo-led' },
              ]}
              onQuote={() => setQuoteOpen(true)}
            />
          </div>
      </>
    ),
    'features': (
      <>
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Pool options</p>
              <DynamicFeatureRenderer productType="pool" selectedExtras={extrasPool} onExtrasChange={setExtrasPool} />
            </div>
            <div>
              <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Sauna options</p>
              <DynamicFeatureRenderer productType="sauna" selectedExtras={extrasSauna} onExtrasChange={setExtrasSauna} />
            </div>
          </div>
      </>
    ),
    'media': (
      <>
          <div className="max-w-2xl">
            <ProductMediaGallery media={media} productName="Wonderlands Aurora" />
          </div>
      </>
    ),
    'pool-calc': (
      <>
          <PoolCalculator />
      </>
    ),
    'heater-calc': (
      <>
          <HeaterSizeCalculator currentSelection={heater} onSelectHeater={setHeater} />
          {heater && <p className="mt-4 text-sm text-muted-foreground">Selected heater: {heater}</p>}
      </>
    ),
    'inline-calc': (
      <>
          <div className="grid gap-6 md:grid-cols-2">
            <InlineCalculator type="screen" onResult={setInlineResult} />
            <InlineCalculator type="fence" onResult={setInlineResult} />
          </div>
          {inlineResult && <p className="mt-4 text-sm text-muted-foreground">Last result: {inlineResult}</p>}
      </>
    ),
    'flip-calculators': (
      <>
          <QuoteCalculators heading="FLIP Calculators" eyebrow="Every discipline" />
      </>
    ),
    'site-planner': (
      <>
          <React.Suspense fallback={<Fallback />}>
            <StudioSitePlanner modelName="Maxima" meta="16' × 40'" categoryId="pools" onViewIn3D={(scene, lib) => setPlanner3D({ scene, lib })} />
          </React.Suspense>
      </>
    ),
    'fence': (
      <>
          <React.Suspense fallback={<Fallback />}>
            <div className="space-y-8">
              <FenceDrawingBoard layout={fenceLayout} onChange={setFenceLayout} />
              <Separator />
              <FenceConfigurator />
            </div>
          </React.Suspense>
      </>
    ),
    'enclosure': (
      <>
          <React.Suspense fallback={<Fallback />}>
            <div className="space-y-8">
              <EnclosureDrawingBoard layout={enclosureLayout} onChange={setEnclosureLayout} />
              <Separator />
              <EnclosureConfigurator />
            </div>
          </React.Suspense>
      </>
    ),
    'grass': (
      <>
          <React.Suspense fallback={<Fallback />}>
            <GrassConfigurator />
          </React.Suspense>
      </>
    ),
    'blueprint': (
      <>
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={() => setBlueprintOpen(true)}>Import a plan set</Button>

            <span className="text-xs text-muted-foreground">
              {importedPlan.shapes.length
                ? `${importedPlan.shapes.length} geometry layers imported and editable`
                : 'PDF, JPG, DXF, SVG'}
            </span>
          </div>
          <div className="mt-6">
            <AutoMount title="the Blueprint Builder" note="The full plan-set builder, editable right here.">
              <BlueprintBuilderTool />
            </AutoMount>
          </div>
          <React.Suspense fallback={null}>
            {blueprintOpen && (
              <BlueprintImportDialog
                open={blueprintOpen}
                onOpenChange={setBlueprintOpen}
                site={importedPlan}
                onApply={setImportedPlan}
              />
            )}
          </React.Suspense>
      </>
    ),
    'signature': (
      <>
          <div className="flex flex-wrap items-center gap-4">
            <Button onClick={() => setSignatureOpen(true)}>Sign</Button>
            {signature && (
              <img src={signature} alt="Applied signature" className="h-16 border border-border/60 bg-background px-3" />
            )}
          </div>
          <React.Suspense fallback={null}>
            {signatureOpen && (
              <SignaturePad
                open={signatureOpen}
                onOpenChange={setSignatureOpen}
                title="Wonderlands signature"
                onApply={(dataUrl) => setSignature(dataUrl)}
              />
            )}
          </React.Suspense>
      </>
    ),
    'depth': (
      <>
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={() => setDepthOpen(true)}>Edit the depth profile</Button>
            <span className="text-xs text-muted-foreground">{anchors.length} depth anchors on a 16 × 40 shell</span>
          </div>
          <React.Suspense fallback={null}>
            {depthOpen && (
              <DepthProfileEditor
                isOpen={depthOpen}
                onClose={() => setDepthOpen(false)}
                linearDepthAnchors={anchors}
                onLinearDepthAnchorsChange={setAnchors}
                selectedAnchorId={selectedAnchor}
                onSelectAnchor={setSelectedAnchor}
                poolShallowDepth={3.75}
                poolDeepDepth={8.5}
                poolDimensions={{ length: 40, width: 16, depth: 8.5 }}
                depthAxis={depthAxis}
                onDepthAxisChange={setDepthAxis}
              />
            )}
          </React.Suspense>
      </>
    ),
    'scene-objects': (
      <>
          <div className="max-w-sm">
            <SceneObjectsPanel groups={DEMO_SCENE_GROUPS} defaultOpen />
          </div>
      </>
    ),
    'financing': (
      <>
          <div className="max-w-xl">
            <FinancingOptions totalPrice={68500} productName="Wonderlands Aurora 14x28" productId="showroom-demo" />
          </div>
      </>
    ),
    'quote': (
      <>
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={() => setQuoteOpen(true)}>Open the quote tool</Button>
            <span className="text-xs text-muted-foreground">Seeded with {quoteSeed.name}</span>
          </div>
          <React.Suspense fallback={null}>
            {quoteOpen && (
              <SurveyQuoteTool
                pool={null}
                isOpen={quoteOpen}
                onClose={() => setQuoteOpen(false)}
                customProduct={{ name: quoteSeed.name, price: quoteSeed.price, type: quoteSeed.type }}
              />
            )}
          </React.Suspense>
      </>
    ),
    'turnkey': (
      <>
          <div className="grid gap-8 lg:grid-cols-2">
            <FlipProjectPipeline categoryId="pools" part="scope" />
            <FlipProjectPipeline categoryId="pools" part="steps" />
          </div>
      </>
    ),
    'sauna-card': (
      <>
          <div className="max-w-sm">
            <React.Suspense fallback={<Fallback />}>
              {demoSauna && <SaunaProductCard sauna={demoSauna as any} />}
            </React.Suspense>
          </div>
      </>
    ),
    'sauna-pricing': (
      <>
          <Button variant="outline" onClick={() => setSaunaPricingOpen(true)}>Open sales pricing (passcode)</Button>
          <React.Suspense fallback={null}>
            {saunaPricingOpen && (
              <SaunaSalesPricingDialog
                open={saunaPricingOpen}
                onOpenChange={setSaunaPricingOpen}
                name="Almost Heaven Grandview"
                unitCost={9995}
                capacity="4 person"
                optionsRetail={1800}
              />
            )}
          </React.Suspense>
      </>
    ),
    'site-header': (
      <>
          <div className="relative">
            <Header />
          </div>
      </>
    ),
    'hero': (
      <>
          <Hero />
      </>
    ),
    'mission': (
      <>
          <MissionVisionValues />
      </>
    ),
    'browse-categories': (
      <>
          <BrowseCategoriesEditorial activeId={browseActive} onSelect={setBrowseActive} />
          <p className="mt-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">Selected: {browseActive}</p>
      </>
    ),
    'section-banner': (
      <>
          <SectionBanner
            image={saunaBanner}
            alt="Premium saunas"
            title="Premium Saunas"
            subtitle="Experience the ultimate relaxation with our collection of luxury indoor and outdoor saunas"
          />
      </>
    ),
    'home-sections': (
      <>
          <div className="flex flex-wrap gap-2">
            {SHOWROOM_HOME_SECTIONS.map((s) => (
              <Button
                key={s.id}
                size="sm"
                variant={homeSection === s.id ? 'default' : 'outline'}
                className="rounded-none text-xs"
                onClick={() => setHomeSection(s.id)}
              >
                {s.label}
              </Button>
            ))}
          </div>
          <Separator className="my-6" />
          <React.Suspense fallback={<Fallback />}>
            <ActiveHomeSection />
          </React.Suspense>
      </>
    ),
    'site-footer': (
      <>
          <Footer />
      </>
    ),
    'website-builder': (
      <AutoMount title="Website Builder" note="Edit your company website right here. Sign in with a company account to save and publish.">
        <ShowroomSiteBuilder />
      </AutoMount>
    ),
    'dash-command': (
      <AutoMount title="Command Center" note="Safe preview of the Command Center. No private data is shown unless you are a main admin.">
        <AdminDashboardTool previewMode />
      </AutoMount>
    ),
    'dash-workspace': (
      <AutoMount title="Company Workspace" note="Your company workspace. Sign in with a company account to see your own data.">
        <CompanyWorkspaceTool />
      </AutoMount>
    ),
    'dash-account': (
      <AutoMount title="Customer Account" note="The homeowner account. Sign in to see your own projects.">
        <CustomerAccountTool />
      </AutoMount>
    ),
    'dash-salesrep': (
      <AutoMount title="Sales Rep Dashboard" note="The sales team dashboard. Sign in with a sales account to see your leads.">
        <SalesRepTool />
      </AutoMount>
    ),
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="relative overflow-hidden border-b border-border/70">
        <div className="container mx-auto px-6 pt-8 pb-16">
          <Link to="/" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-3 w-3" /> Wonderlands World
          </Link>
          <div className="mt-14 grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:items-end">
            <div>
              <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">The Showroom · Edition {new Date().getFullYear()}</p>
              <h1 className="mt-5 font-serif text-5xl md:text-7xl leading-[0.95] tracking-tight">
                Every tool that builds<br /><em className="font-light">a Wonderlands project.</em>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
                Try each solution right here — nothing to install, nothing to sign. Build a website, draw a pool in 2D,
                walk it in 3D, publish a book and run a campaign. Ask Genius at any time and she will open the right tool for you.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild className="rounded-none px-7 text-[10px] uppercase tracking-[0.28em]">
                  <a href="#website-builder"><Play className="mr-2 h-3.5 w-3.5" /> Start with the Website Builder</a>
                </Button>
                <Button asChild variant="outline" className="rounded-none px-7 text-[10px] uppercase tracking-[0.28em]">
                  <a href="https://calendly.com/wonderlandsworlds/30min" target="_blank" rel="noreferrer">Book a guided tour <ArrowUpRight className="ml-2 h-3.5 w-3.5" /></a>
                </Button>
              </div>
            </div>
            <dl className="grid grid-cols-2 border-t border-l border-border/70">
              {[
                [String(SHOWROOM_WIDGETS.length), 'live solutions'],
                ['2D + 3D', 'design engines'],
                ['4', 'dashboards'],
                ['0', 'installs needed'],
              ].map(([n, l]) => (
                <div key={l} className="border-b border-r border-border/70 p-5">
                  <dt className="font-serif text-3xl">{n}</dt>
                  <dd className="mt-1 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{l}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
        <nav className="sticky top-0 z-30 border-t border-border/70 bg-background/90 backdrop-blur">
          <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 px-6">
            {SHOWROOM_TIERS.map((t) => (
              <a key={t.id} href={`#tier-${t.id}`} className="group border-r border-border/70 py-4 pr-4 last:border-r-0 md:pl-4 first:pl-0">
                <span className="font-serif italic text-muted-foreground">{t.number}.</span>{' '}
                <span className="text-[11px] uppercase tracking-[0.22em] group-hover:underline">{t.title}</span>
              </a>
            ))}
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-6 py-16">
        {SHOWROOM_TIERS.map((tier) => {
          const items = SHOWROOM_WIDGETS.filter((w) => renderers[w.id] && showroomTierOf(w.id) === tier.id);
          if (!items.length) return null;
          return (
            <section key={tier.id} id={`tier-${tier.id}`} className="scroll-mt-20 pb-24">
              <div className="mb-14 grid gap-6 border-b border-foreground pb-8 md:grid-cols-[auto_1fr_auto] md:items-end">
                <span className="font-serif text-7xl md:text-8xl leading-none">{tier.number}</span>
                <div>
                  <h2 className="font-serif text-3xl md:text-5xl tracking-tight">{tier.title}</h2>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">{tier.lede}</p>
                </div>
                <div className="flex flex-wrap gap-2 md:max-w-sm md:justify-end">
                  {items.map((s) => (
                    <a key={s.id} href={`#${s.id}`} onClick={() => setActiveWidget(s.id)} className="border border-border/70 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:border-foreground hover:text-foreground transition-colors">
                      {s.title}
                    </a>
                  ))}
                </div>
              </div>
              <div className="space-y-20">
                {items.map((w) => (
                  <Frame key={w.id} section={w} active={isActive(w.id)}>
                    {renderers[w.id]}
                  </Frame>
                ))}
              </div>
            </section>
          );
        })}
      </main>

      <Dialog open={!!planner3D} onOpenChange={(o) => !o && setPlanner3D(null)}>
        <DialogContent className="max-w-[95vw] w-[95vw] p-0 overflow-hidden">
          <DialogTitle className="sr-only">Site plan in 3D</DialogTitle>
          <React.Suspense fallback={<Fallback />}>
            {planner3D && <ShowroomStudio3D scene={planner3D.scene} textureLibrary={planner3D.lib} height="85vh" />}
          </React.Suspense>
        </DialogContent>
      </Dialog>

      <footer className="border-t border-border/70 py-10 text-center text-xs uppercase tracking-[0.25em] text-muted-foreground">
        Wonderlands World · The Showroom
      </footer>
    </div>
  );
};

export default StudioShowroom;
