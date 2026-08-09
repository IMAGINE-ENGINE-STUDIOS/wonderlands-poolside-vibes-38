import * as React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Loader2 } from 'lucide-react';

import AdvancedSearch from '@/components/AdvancedSearch';
import StudioCartWidget from '@/components/StudioCartWidget';
import MiniCart from '@/components/MiniCart';
import { PoolCalculator } from '@/components/PoolCalculator';
import HeaterSizeCalculator from '@/components/HeaterSizeCalculator';
import FinancingOptions from '@/components/FinancingOptions';
import ProductMediaGallery from '@/components/ProductMediaGallery';
import { DynamicFeatureRenderer } from '@/components/DynamicFeatureRenderer';
import { InlineCalculator } from '@/components/search/InlineCalculator';
import type { FenceLayout } from '@/components/fence/FenceDrawingBoard';
import type { EnclosureLayout } from '@/components/enclosure/EnclosureDrawingBoard';

// ---- Main page widgets ----
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';
import SectionBanner from '@/components/SectionBanner';
import MissionVisionValues from '@/components/MissionVisionValues';
import BrowseCategoriesEditorial from '@/components/BrowseCategoriesEditorial';
import saunaBanner from '@/assets/banners/sauna-banner.webp';

import heroPool from '@/assets/hero-pool-optimized.webp';
import maximaPool from '@/assets/maxima-pool.webp';
import poolHeater from '@/assets/pool-heater.webp';

const FenceDrawingBoard = React.lazy(() => import('@/components/fence/FenceDrawingBoard'));
const FenceConfigurator = React.lazy(() => import('@/components/fence/FenceConfigurator'));
const EnclosureDrawingBoard = React.lazy(() => import('@/components/enclosure/EnclosureDrawingBoard'));
const EnclosureConfigurator = React.lazy(() => import('@/components/enclosure/EnclosureConfigurator'));
const SaunaSalesPricingDialog = React.lazy(() => import('@/components/sauna/SaunaSalesPricingDialog'));
const SurveyQuoteTool = React.lazy(() => import('@/components/SurveyQuoteTool'));

// Home page catalog sections — lazy so only the selected one loads
const HOME_SECTIONS: { id: string; label: string; Component: React.LazyExoticComponent<any> }[] = [
  { id: 'pools', label: 'Pool Catalog', Component: React.lazy(() => import('@/components/PoolCatalog')) },
  { id: 'gilmer-pools', label: 'Latham / Gilmer Pools', Component: React.lazy(() => import('@/components/GilmerPoolsSection')) },
  { id: 'saunas', label: 'Saunas', Component: React.lazy(() => import('@/components/SaunaSection')) },
  { id: 'spas', label: 'Spa Catalog', Component: React.lazy(() => import('@/components/SpaCatalog')) },
  { id: 'gilmer-spas', label: 'Latham / Gilmer Spas', Component: React.lazy(() => import('@/components/GilmerSpasSection')) },
  { id: 'tanning-ledges', label: 'Tanning Ledges', Component: React.lazy(() => import('@/components/TanningLedgeSection')) },
  { id: 'screen-enclosures', label: 'Screen Enclosures', Component: React.lazy(() => import('@/components/ScreenEnclosureSection')) },
  { id: 'patio-fencing', label: 'Patio Fencing', Component: React.lazy(() => import('@/components/PatioFencingSection')) },
  { id: 'lanai', label: 'Lanai', Component: React.lazy(() => import('@/components/LanaiSection')) },
  { id: 'pavers', label: 'Pavers', Component: React.lazy(() => import('@/components/PaversSection')) },
  { id: 'artificial-grass', label: 'Artificial Grass', Component: React.lazy(() => import('@/components/ArtificialGrassSection')) },
  { id: 'landscaping', label: 'Landscaping', Component: React.lazy(() => import('@/components/LandscapingSection')) },
  { id: 'covers', label: 'Automatic Covers', Component: React.lazy(() => import('@/components/AutomaticCoversSection')) },
  { id: 'driveway-gates', label: 'Driveway Gates', Component: React.lazy(() => import('@/components/DrivewayGateSection')) },
  { id: 'pool-finishes', label: 'Pool Finishes', Component: React.lazy(() => import('@/components/PoolFinishesSection')) },
  { id: 'liners', label: 'Liners', Component: React.lazy(() => import('@/components/LinersSection')) },
];

const Fallback = () => (
  <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
    <Loader2 className="h-4 w-4 animate-spin" /> Loading widget…
  </div>
);

interface SectionDef {
  id: string;
  index: string;
  title: string;
  description: string;
  tag: string;
}

const SECTIONS: SectionDef[] = [
  { id: 'search', index: '01', title: 'Advanced Search', description: 'Catalog-wide search with filters, category routing and inline results. Shown in the full and slim variants used across the site.', tag: 'Navigation' },
  { id: 'cart', index: '02', title: 'Configuration & Cart Widget', description: 'The studio total-price widget: live configuration price, editable shopping list, feature swaps, quote and checkout actions.', tag: 'Commerce' },
  { id: 'minicart', index: '03', title: 'Mini Cart', description: 'Compact cart summary used in headers and product sections, with quantities and a link to the full cart.', tag: 'Commerce' },
  { id: 'features', index: '04', title: 'Dynamic Feature Renderer', description: 'Category-aware option engine. Renders carousels, toggles and counters from the product feature config — pool options and sauna options differ automatically.', tag: 'Configurator' },
  { id: 'media', index: '05', title: 'Product Media Gallery', description: 'Product image and video gallery with keyboard-friendly navigation and consistent media framing.', tag: 'Presentation' },
  { id: 'pool-calc', index: '06', title: 'Pool Calculator', description: 'Volume, heating and chemical calculator by pool shape and depth profile.', tag: 'Calculator' },
  { id: 'heater-calc', index: '07', title: 'Heater Sizing Calculator', description: 'Recommends heater capacity from pool dimensions and target temperature rise, and can push the pick back into a configuration.', tag: 'Calculator' },
  { id: 'inline-calc', index: '08', title: 'Inline Quick Calculators', description: 'Lightweight square-foot and linear-foot estimators for pavers, screen, fence and lanai used inside the search experience.', tag: 'Calculator' },
  { id: 'fence', index: '09', title: 'Fence Drawing Board & Configurator', description: 'Florida-code aluminum fence tool: draw the run on a 1 ft grid, flag gates, then price height, style and installation.', tag: 'Drawing' },
  { id: 'enclosure', index: '10', title: 'Screen Enclosure Studio', description: 'Draw the enclosure footprint with doors and house-attached walls, then configure fabric, frame and compliance with customer and contractor pricing views.', tag: 'Drawing' },
  { id: 'financing', index: '11', title: 'Financing Options', description: 'Monthly payment scenarios by term and rate — used on the checkout page.', tag: 'Commerce' },
  { id: 'quote', index: '12', title: 'Survey Quote Tool', description: 'Guided intake with name and email required, then a printable, itemized quote that includes everything in the cart plus a quote gallery.', tag: 'Documents' },
  { id: 'sauna-pricing', index: '13', title: 'Sauna Sales Pricing', description: 'Internal turnkey cost breakdown for the sales team. Passcode protected.', tag: 'Internal' },
  { id: 'site-header', index: '14', title: 'Site Header', description: 'Main page navigation bar: logo, menu, search entry, cart and account access.', tag: 'Home page' },
  { id: 'hero', index: '15', title: 'Hero', description: 'Main page opening statement with the headline, supporting copy and primary calls to action.', tag: 'Home page' },
  { id: 'mission', index: '16', title: 'Mission, Vision & Values', description: 'Editorial trio block presenting the Wonderlands mission, vision and values on the home page.', tag: 'Home page' },
  { id: 'browse-categories', index: '17', title: 'Browse Categories (Editorial)', description: 'Magazine-style category index used on the main page. Selecting a tile switches the active home section.', tag: 'Home page' },
  { id: 'section-banner', index: '18', title: 'Section Banner', description: 'Slim photographic banner that titles each home page section and acts as its scroll anchor.', tag: 'Home page' },
  { id: 'home-sections', index: '19', title: 'Home Catalog Sections', description: 'Every product section of the main page — pools, spas, saunas, enclosures, fencing, pavers, grass, landscaping, covers, gates, finishes and liners. Pick one to load it live.', tag: 'Home page' },
  { id: 'site-footer', index: '20', title: 'Site Footer', description: 'Main page footer: navigation, contact details, scheduling link and legal information.', tag: 'Home page' },
];

const Frame = ({ section, children }: { section: SectionDef; children: React.ReactNode }) => (
  <section id={section.id} className="scroll-mt-28">
    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
      <span className="font-mono text-xs tracking-[0.3em] text-muted-foreground">{section.index}</span>
      <h2 className="text-2xl md:text-3xl font-light tracking-tight">{section.title}</h2>
      <Badge variant="outline" className="rounded-none text-[10px] tracking-[0.2em] uppercase">{section.tag}</Badge>
    </div>
    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">{section.description}</p>
    <Card className="mt-6 rounded-none border-border/70 bg-card p-4 md:p-6 overflow-hidden">
      {children}
    </Card>
  </section>
);

const StudioShowroom = () => {
  const [extrasPool, setExtrasPool] = React.useState<any>({});
  const [extrasSauna, setExtrasSauna] = React.useState<any>({});
  const [fenceLayout, setFenceLayout] = React.useState<FenceLayout>({ points: [], closed: false, gateSegments: [] });
  const [enclosureLayout, setEnclosureLayout] = React.useState<EnclosureLayout>({ points: [], closed: false, features: {} });
  const [quoteOpen, setQuoteOpen] = React.useState(false);
  const [saunaPricingOpen, setSaunaPricingOpen] = React.useState(false);
  const [heater, setHeater] = React.useState<string>('');
  const [inlineResult, setInlineResult] = React.useState('');
  const [browseActive, setBrowseActive] = React.useState('pools');
  const [homeSection, setHomeSection] = React.useState('pools');
  const ActiveHomeSection = React.useMemo(
    () => HOME_SECTIONS.find((s) => s.id === homeSection)?.Component ?? HOME_SECTIONS[0].Component,
    [homeSection]
  );

  const media = React.useMemo(
    () => [
      { type: 'image' as const, url: heroPool, alt: 'Wonderlands pool with sun deck' },
      { type: 'image' as const, url: maximaPool, alt: 'Maxima fiberglass pool' },
      { type: 'image' as const, url: poolHeater, alt: 'Pool heater unit' },
    ],
    []
  );

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
            each one does. Use it as a reference for design, sales training and QA.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {SECTIONS.map((s) => (
              <a key={s.id} href={`#${s.id}`}>
                <Badge variant="secondary" className="rounded-none text-[11px] tracking-wide">
                  {s.index} · {s.title}
                </Badge>
              </a>
            ))}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-14 space-y-16">
        <Frame section={SECTIONS[0]}>
          <div className="space-y-8">
            <div>
              <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Default variant</p>
              <AdvancedSearch />
            </div>
            <Separator />
            <div>
              <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Slim variant (studio)</p>
              <AdvancedSearch variant="slim" />
            </div>
          </div>
        </Frame>

        <Frame section={SECTIONS[1]}>
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

        <Frame section={SECTIONS[2]}>
          <div className="max-w-md">
            <MiniCart onViewFullCart={() => undefined} />
          </div>
        </Frame>

        <Frame section={SECTIONS[3]}>
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

        <Frame section={SECTIONS[4]}>
          <div className="max-w-2xl">
            <ProductMediaGallery media={media} productName="Wonderlands Aurora" />
          </div>
        </Frame>

        <Frame section={SECTIONS[5]}>
          <PoolCalculator />
        </Frame>

        <Frame section={SECTIONS[6]}>
          <HeaterSizeCalculator currentSelection={heater} onSelectHeater={setHeater} />
          {heater && <p className="mt-4 text-sm text-muted-foreground">Selected heater: {heater}</p>}
        </Frame>

        <Frame section={SECTIONS[7]}>
          <div className="grid gap-6 md:grid-cols-2">
            <InlineCalculator type="screen" onResult={setInlineResult} />
            <InlineCalculator type="fence" onResult={setInlineResult} />
          </div>
          {inlineResult && <p className="mt-4 text-sm text-muted-foreground">Last result: {inlineResult}</p>}
        </Frame>

        <Frame section={SECTIONS[8]}>
          <React.Suspense fallback={<Fallback />}>
            <div className="space-y-8">
              <FenceDrawingBoard layout={fenceLayout} onChange={setFenceLayout} />
              <Separator />
              <FenceConfigurator />
            </div>
          </React.Suspense>
        </Frame>

        <Frame section={SECTIONS[9]}>
          <React.Suspense fallback={<Fallback />}>
            <div className="space-y-8">
              <EnclosureDrawingBoard layout={enclosureLayout} onChange={setEnclosureLayout} />
              <Separator />
              <EnclosureConfigurator />
            </div>
          </React.Suspense>
        </Frame>

        <Frame section={SECTIONS[10]}>
          <div className="max-w-xl">
            <FinancingOptions totalPrice={68500} productName="Wonderlands Aurora 14x28" productId="showroom-demo" />
          </div>
        </Frame>

        <Frame section={SECTIONS[11]}>
          <Button onClick={() => setQuoteOpen(true)}>Open the quote tool</Button>
          <React.Suspense fallback={null}>
            {quoteOpen && (
              <SurveyQuoteTool
                pool={null}
                isOpen={quoteOpen}
                onClose={() => setQuoteOpen(false)}
                customProduct={{ name: 'Wonderlands Aurora 14x28', price: 68500, type: 'pool' }}
              />
            )}
          </React.Suspense>
        </Frame>

        <Frame section={SECTIONS[12]}>
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
        <Frame section={SECTIONS[13]}>
          <div className="relative">
            <Header />
          </div>
        </Frame>

        <Frame section={SECTIONS[14]}>
          <Hero />
        </Frame>

        <Frame section={SECTIONS[15]}>
          <MissionVisionValues />
        </Frame>

        <Frame section={SECTIONS[16]}>
          <BrowseCategoriesEditorial activeId={browseActive} onSelect={setBrowseActive} />
          <p className="mt-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">Selected: {browseActive}</p>
        </Frame>

        <Frame section={SECTIONS[17]}>
          <SectionBanner
            image={saunaBanner}
            alt="Premium saunas"
            title="Premium Saunas"
            subtitle="Experience the ultimate relaxation with our collection of luxury indoor and outdoor saunas"
          />
        </Frame>

        <Frame section={SECTIONS[18]}>
          <div className="flex flex-wrap gap-2">
            {HOME_SECTIONS.map((s) => (
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

        <Frame section={SECTIONS[19]}>
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
