import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Loader2, Sparkles, Waves, Boxes } from 'lucide-react';
import { cn } from '@/lib/utils';

import AdvancedSearch from '@/components/AdvancedSearch';
import StudioCartWidget from '@/components/StudioCartWidget';
import MiniCart from '@/components/MiniCart';
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
import maximaPool from '@/assets/pools/kits/maxima-pool.webp';
import poolHeater from '@/assets/equipment/pool-heater.webp';

import { setNarratorContext } from '@/lib/narratorStore';
import {
  SHOWROOM_HOME_SECTIONS,
  SHOWROOM_WIDGETS,
  findShowroomWidget,
  registerShowroomControls,
  type ShowroomControls,
  type ShowroomWidget,
} from '@/lib/showroomBus';

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

const Frame = ({
  section,
  active,
  children,
}: {
  section: ShowroomWidget;
  active?: boolean;
  children: React.ReactNode;
}) => (
  <section id={section.id} className="scroll-mt-28">
    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
      <span className="font-mono text-xs tracking-[0.3em] text-muted-foreground">{section.index}</span>
      <h2 className="text-2xl md:text-3xl font-light tracking-tight">{section.title}</h2>
      <Badge variant="outline" className="rounded-none text-[10px] tracking-[0.2em] uppercase">{section.tag}</Badge>
      {active && (
        <Badge className="rounded-none text-[10px] tracking-[0.2em] uppercase">
          <Sparkles className="mr-1 h-3 w-3" /> Genius here
        </Badge>
      )}
    </div>
    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">{section.description}</p>
    <Card
      className={cn(
        'mt-6 rounded-none border-border/70 bg-card p-4 md:p-6 overflow-hidden transition-shadow duration-500',
        active && 'ring-1 ring-primary/50 shadow-[0_30px_90px_-50px_hsl(var(--primary)/0.6)]',
      )}
    >
      {children}
    </Card>
  </section>
);

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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/70">
        <div className="container mx-auto px-6 py-10">
          <Link to="/" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-3 w-3" /> Wonderlands
          </Link>
          <h1 className="mt-8 text-4xl md:text-6xl font-light tracking-tight">Studio Widget Showroom</h1>
          <p className="mt-4 max-w-2xl text-sm md:text-base leading-relaxed text-muted-foreground">
            Every interactive component of the Wonderlands Studio, live and fully functional, with a short note on what
            each one does. Ask Genius for anything — a search, a design, a full product explanation or a finished quote —
            and she will open the right tool here and work it with you.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {SHOWROOM_WIDGETS.map((s) => (
              <a key={s.id} href={`#${s.id}`} onClick={() => setActiveWidget(s.id)}>
                <Badge variant="secondary" className="rounded-none text-[11px] tracking-wide">
                  {s.index} · {s.title}
                </Badge>
              </a>
            ))}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-14 space-y-16">
        <Frame section={W('search')} active={isActive('search')}>
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
        </Frame>

        <Frame section={W('flip-search')} active={isActive('flip-search')}>
          <React.Suspense fallback={<Fallback />}>
            <FlipSearch
              onOpenCategory={(categoryId) => navigate(`/flip?category=${encodeURIComponent(categoryId)}`)}
              onOpenProduct={(categoryId, entry) =>
                navigate(`/flip?category=${encodeURIComponent(categoryId)}&product=${encodeURIComponent(entry.id)}`)
              }
            />
          </React.Suspense>
        </Frame>

        <Frame section={W('cart')} active={isActive('cart')}>
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
        </Frame>

        <Frame section={W('minicart')} active={isActive('minicart')}>
          <div className="max-w-md">
            <MiniCart onViewFullCart={() => undefined} />
          </div>
        </Frame>

        <Frame section={W('features')} active={isActive('features')}>
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
        </Frame>

        <Frame section={W('media')} active={isActive('media')}>
          <div className="max-w-2xl">
            <ProductMediaGallery media={media} productName="Wonderlands Aurora" />
          </div>
        </Frame>

        <Frame section={W('pool-calc')} active={isActive('pool-calc')}>
          <PoolCalculator />
        </Frame>

        <Frame section={W('heater-calc')} active={isActive('heater-calc')}>
          <HeaterSizeCalculator currentSelection={heater} onSelectHeater={setHeater} />
          {heater && <p className="mt-4 text-sm text-muted-foreground">Selected heater: {heater}</p>}
        </Frame>

        <Frame section={W('inline-calc')} active={isActive('inline-calc')}>
          <div className="grid gap-6 md:grid-cols-2">
            <InlineCalculator type="screen" onResult={setInlineResult} />
            <InlineCalculator type="fence" onResult={setInlineResult} />
          </div>
          {inlineResult && <p className="mt-4 text-sm text-muted-foreground">Last result: {inlineResult}</p>}
        </Frame>

        <Frame section={W('flip-calculators')} active={isActive('flip-calculators')}>
          <QuoteCalculators heading="FLIP Calculators" eyebrow="Every discipline" />
        </Frame>

        <Frame section={W('site-planner')} active={isActive('site-planner')}>
          <React.Suspense fallback={<Fallback />}>
            <StudioSitePlanner modelName="Maxima" meta="16' × 40'" categoryId="pools" />
          </React.Suspense>
        </Frame>

        <Frame section={W('fence')} active={isActive('fence')}>
          <React.Suspense fallback={<Fallback />}>
            <div className="space-y-8">
              <FenceDrawingBoard layout={fenceLayout} onChange={setFenceLayout} />
              <Separator />
              <FenceConfigurator />
            </div>
          </React.Suspense>
        </Frame>

        <Frame section={W('enclosure')} active={isActive('enclosure')}>
          <React.Suspense fallback={<Fallback />}>
            <div className="space-y-8">
              <EnclosureDrawingBoard layout={enclosureLayout} onChange={setEnclosureLayout} />
              <Separator />
              <EnclosureConfigurator />
            </div>
          </React.Suspense>
        </Frame>

        <Frame section={W('grass')} active={isActive('grass')}>
          <React.Suspense fallback={<Fallback />}>
            <GrassConfigurator />
          </React.Suspense>
        </Frame>

        <Frame section={W('blueprint')} active={isActive('blueprint')}>
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={() => setBlueprintOpen(true)}>Import a plan set</Button>
            <Button variant="outline" onClick={() => navigate('/blueprint-builder')}>
              Open the Blueprint Builder
            </Button>
            <span className="text-xs text-muted-foreground">
              {importedPlan.shapes.length
                ? `${importedPlan.shapes.length} geometry layers imported and editable`
                : 'PDF, JPG, DXF, SVG'}
            </span>
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
        </Frame>

        <Frame section={W('signature')} active={isActive('signature')}>
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
        </Frame>

        <Frame section={W('depth')} active={isActive('depth')}>
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
        </Frame>

        <Frame section={W('scene-objects')} active={isActive('scene-objects')}>
          <div className="max-w-sm">
            <SceneObjectsPanel groups={DEMO_SCENE_GROUPS} defaultOpen />
          </div>
        </Frame>

        <Frame section={W('financing')} active={isActive('financing')}>
          <div className="max-w-xl">
            <FinancingOptions totalPrice={68500} productName="Wonderlands Aurora 14x28" productId="showroom-demo" />
          </div>
        </Frame>

        <Frame section={W('quote')} active={isActive('quote')}>
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
        </Frame>

        <Frame section={W('turnkey')} active={isActive('turnkey')}>
          <div className="grid gap-8 lg:grid-cols-2">
            <FlipProjectPipeline categoryId="pools" part="scope" />
            <FlipProjectPipeline categoryId="pools" part="steps" />
          </div>
        </Frame>

        <Frame section={W('sauna-card')} active={isActive('sauna-card')}>
          <div className="max-w-sm">
            <React.Suspense fallback={<Fallback />}>
              {demoSauna && <SaunaProductCard sauna={demoSauna as any} />}
            </React.Suspense>
          </div>
        </Frame>

        <Frame section={W('sauna-pricing')} active={isActive('sauna-pricing')}>
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
        </Frame>

        <Frame section={W('site-header')} active={isActive('site-header')}>
          <div className="relative">
            <Header />
          </div>
        </Frame>

        <Frame section={W('hero')} active={isActive('hero')}>
          <Hero />
        </Frame>

        <Frame section={W('mission')} active={isActive('mission')}>
          <MissionVisionValues />
        </Frame>

        <Frame section={W('browse-categories')} active={isActive('browse-categories')}>
          <BrowseCategoriesEditorial activeId={browseActive} onSelect={setBrowseActive} />
          <p className="mt-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">Selected: {browseActive}</p>
        </Frame>

        <Frame section={W('section-banner')} active={isActive('section-banner')}>
          <SectionBanner
            image={saunaBanner}
            alt="Premium saunas"
            title="Premium Saunas"
            subtitle="Experience the ultimate relaxation with our collection of luxury indoor and outdoor saunas"
          />
        </Frame>

        <Frame section={W('home-sections')} active={isActive('home-sections')}>
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
        </Frame>

        <Frame section={W('site-footer')} active={isActive('site-footer')}>
          <Footer />
        </Frame>
      </main>

      <footer className="border-t border-border/70 py-10 text-center text-xs uppercase tracking-[0.25em] text-muted-foreground">
        Wonderlands World · Internal component showroom
      </footer>
    </div>
  );
};

export default StudioShowroom;
