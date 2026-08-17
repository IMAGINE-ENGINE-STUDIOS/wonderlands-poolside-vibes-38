import * as React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Compass,
  FileText,
  LayoutGrid,
  Ruler,
  Sparkles,
  Waves,
} from 'lucide-react';

import wonderlandsLogo from '@/assets/brand/wonderlands-logo.webp';
import heroPool from '@/assets/hero/hero-pool-optimized.webp';

import lathamGilmerBanner from '@/assets/banners/latham-gilmer-banner.webp';
import saunaBanner from '@/assets/banners/sauna-banner.webp';
import spaBanner from '@/assets/banners/spa-banner.webp';
import screenEnclosureBanner from '@/assets/banners/screen-enclosure-banner.webp';
import paversBanner from '@/assets/banners/pavers-banner.webp';
import coversBanner from '@/assets/banners/covers-banner.webp';
import drivewayGateBanner from '@/assets/banners/driveway-gate-banner.webp';
import tanningLedgeBanner from '@/assets/banners/tanning-ledge-banner.webp';
import patioFencingBanner from '@/assets/banners/patio-fencing-banner.webp';
import lanaiBanner from '@/assets/banners/lanai-banner.webp';
import landscapingBanner from '@/assets/banners/landscaping-banner.webp';
import grassBanner from '@/assets/turf/grass-natural-green.avif';
import finishImg from '@/assets/finishes/sapphire-blue-g3.webp';
import linerImg from '@/assets/finishes/ocean-blue-g3.webp';

interface CategoryDef {
  id: string;
  label: string;
  tagline: string;
  image: string;
}

interface GroupDef {
  index: string;
  title: string;
  blurb: string;
  items: CategoryDef[];
}

const GROUPS: GroupDef[] = [
  {
    index: '01',
    title: 'Water & Wellness',
    blurb: 'The centerpieces — engineered water, heat and rest.',
    items: [
      { id: 'pools', label: 'Pools', tagline: 'Signature Waters', image: lathamGilmerBanner },
      { id: 'spas', label: 'Spas', tagline: 'Private Repose', image: spaBanner },
      { id: 'saunas', label: 'Saunas', tagline: 'Quiet Heat', image: saunaBanner },
      { id: 'tanning-ledges', label: 'Tanning Ledges', tagline: 'Sun Shelves', image: tanningLedgeBanner },
    ],
  },
  {
    index: '02',
    title: 'Structures & Shelter',
    blurb: 'Enclosure, shade and boundary — permit-ready and Florida-code aware.',
    items: [
      { id: 'screen-enclosures', label: 'Screen Enclosures', tagline: 'Open Air, Refined', image: screenEnclosureBanner },
      { id: 'lanai', label: 'Lanai', tagline: 'Covered Living', image: lanaiBanner },
      { id: 'patio-fencing', label: 'Patio Fencing', tagline: 'Defined Edges', image: patioFencingBanner },
      { id: 'covers', label: 'Covers', tagline: 'Quiet Protection', image: coversBanner },
      { id: 'driveway-gates', label: 'Driveway Gates', tagline: 'Arrival Statement', image: drivewayGateBanner },
    ],
  },
  {
    index: '03',
    title: 'Surfaces & Verdure',
    blurb: 'Everything underfoot and every inner hue.',
    items: [
      { id: 'pavers', label: 'Pavers', tagline: 'Underfoot Detail', image: paversBanner },
      { id: 'artificial-grass', label: 'Artificial Grass', tagline: 'Effortless Green', image: grassBanner },
      { id: 'landscaping', label: 'Landscaping', tagline: 'Botanical Compositions', image: landscapingBanner },
      { id: 'finishes', label: 'Finishes', tagline: 'Surface & Light', image: finishImg },
      { id: 'liners', label: 'Liners', tagline: 'Inner Hue', image: linerImg },
    ],
  },
];

const TOOLS = [
  {
    to: '/wonderlands-studio',
    icon: LayoutGrid,
    title: 'Configure a Product',
    text: 'Pick a model, add features and watch the price update live.',
  },
  {
    to: '/design-studio',
    icon: Compass,
    title: '2D & 3D Designer',
    text: 'Draw the pool, deck and terrain on a true 1 ft grid.',
  },
  {
    to: '/blueprint-builder',
    icon: Ruler,
    title: 'Blueprint Builder',
    text: 'Permit plan sets adapted to your Florida city or county.',
  },
  {
    to: '/quote',
    icon: FileText,
    title: 'Instant Quote',
    text: 'Itemized, printable proposal built from your cart.',
  },
  {
    to: '/studio-showroom',
    icon: Sparkles,
    title: 'Widget Showroom',
    text: 'Every studio tool, live, in one reference page.',
  },
  {
    to: '/pool-calculator',
    icon: Waves,
    title: 'Pool Calculator',
    text: 'Volume, heating and chemistry in seconds.',
  },
];

const STATS = [
  { value: '14', label: 'Collections' },
  { value: 'Live', label: 'Pricing' },
  { value: '2D / 3D', label: 'Design Tools' },
  { value: 'FL', label: 'Code Ready' },
];

const CategoryTile = ({ cat, num, total }: { cat: CategoryDef; num: number; total: number }) => (
  <Link
    to={`/wonderlands-studio?category=${cat.id}`}
    aria-label={`Open ${cat.label} in the studio`}
    className="group glass-card-hover relative block overflow-hidden rounded-2xl border border-border/50"
  >
    <div className="relative aspect-[4/5]">
      <img
        src={cat.image}
        alt={`${cat.label} — ${cat.tagline}`}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
      />
      <span className="absolute top-3 right-3 rounded-full glass-panel-soft px-2.5 py-1 text-[10px] tracking-[0.2em] text-on-media">
        {String(num).padStart(2, '0')} / {total}
      </span>
      <div className="glass-caption absolute inset-x-0 bottom-0 p-4">
        <p className="text-[9px] uppercase tracking-[0.32em] text-on-media-muted">{cat.tagline}</p>
        <div className="mt-2 flex items-center justify-between gap-2">
          <h3 className="text-base md:text-lg font-light leading-tight text-on-media">{cat.label}</h3>
          <ArrowRight className="h-4 w-4 shrink-0 text-on-media-muted transition-transform duration-500 group-hover:translate-x-1" />
        </div>
      </div>
    </div>
  </Link>
);

const StudioLanding = () => {
  const total = GROUPS.reduce((n, g) => n + g.items.length, 0);
  let counter = 0;

  return (
    <div className="min-h-screen studio-aurora text-foreground">
      {/* ─────────── Hero ─────────── */}
      <section className="relative overflow-hidden">
        <img
          src={heroPool}
          alt="Wonderlands pool at dusk"
          loading="eager"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/60 to-background" />

        <div className="relative mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">
          <div className="glass-panel mx-auto max-w-4xl rounded-3xl p-8 md:p-14 text-center">
            <img
              src={wonderlandsLogo}
              alt="Wonderlands World"
              loading="eager"
              decoding="async"
              className="mx-auto h-14 w-auto md:h-16"
            />
            <Badge variant="outline" className="mt-8 rounded-full text-[10px] uppercase tracking-[0.3em]">
              Wonderlands Studio
            </Badge>
            <h1 className="mt-6 text-4xl md:text-6xl font-light leading-[1.05] tracking-tight">
              Design your entire outdoor world in one place
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-sm md:text-base leading-relaxed text-muted-foreground">
              Fourteen collections, live pricing, drawing boards and permit-ready documents —
              composed into a single studio built for Florida projects.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="rounded-full px-8">
                <Link to="/wonderlands-studio">
                  Enter the Studio <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full px-8">
                <a href="#collections">Browse Collections</a>
              </Button>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {STATS.map((s) => (
                <div key={s.label} className="glass-tile rounded-xl px-3 py-4">
                  <p className="text-lg md:text-xl font-light">{s.value}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.24em] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────── Collections ─────────── */}
      <section id="collections" className="scroll-mt-16 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <div className="max-w-2xl">
            <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">Collections — Index</p>
            <h2 className="mt-5 text-3xl md:text-5xl font-light leading-tight tracking-tight">
              Grouped so you always know where to start
            </h2>
            <p className="mt-5 text-sm md:text-base leading-relaxed text-muted-foreground">
              Every tile opens that collection directly inside the studio, with its own options,
              features and live pricing.
            </p>
          </div>

          <div className="mt-14 space-y-14">
            {GROUPS.map((group) => (
              <div key={group.title} className="glass-panel-soft rounded-3xl p-5 md:p-8">
                <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="font-mono text-[11px] tracking-[0.3em] text-muted-foreground">{group.index}</p>
                    <h3 className="mt-2 text-xl md:text-2xl font-light tracking-tight">{group.title}</h3>
                    <p className="mt-2 max-w-xl text-sm text-muted-foreground">{group.blurb}</p>
                  </div>
                  <Badge variant="secondary" className="rounded-full text-[10px] uppercase tracking-[0.2em]">
                    {group.items.length} categories
                  </Badge>
                </div>

                <div className={`grid grid-cols-2 gap-4 sm:grid-cols-3 ${group.items.length === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-5'}`}>
                  {group.items.map((cat) => {
                    counter += 1;
                    return <CategoryTile key={cat.id} cat={cat} num={counter} total={total} />;
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── Tools ─────────── */}
      <section className="pb-16 md:pb-24">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <div className="max-w-2xl">
            <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">The Toolkit</p>
            <h2 className="mt-5 text-3xl md:text-5xl font-light leading-tight tracking-tight">
              From first sketch to signed permit set
            </h2>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TOOLS.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.to}
                  to={tool.to}
                  className="group glass-panel glass-card-hover rounded-2xl p-6"
                >
                  <div className="flex items-center justify-between">
                    <span className="glass-tile inline-flex h-11 w-11 items-center justify-center rounded-xl">
                      <Icon className="h-5 w-5 text-primary" />
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform duration-500 group-hover:translate-x-1" />
                  </div>
                  <h3 className="mt-5 text-lg font-light tracking-tight">{tool.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{tool.text}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────── Closing CTA ─────────── */}
      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <div className="glass-panel rounded-3xl p-8 md:p-14 text-center">
            <h2 className="text-2xl md:text-4xl font-light tracking-tight">
              Build it, price it, then send it to us
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-sm md:text-base leading-relaxed text-muted-foreground">
              Configure freely — your work saves as you go. When you are ready, generate an
              itemized quote or book a call with our team.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="rounded-full px-8">
                <Link to="/wonderlands-studio">Start Configuring</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full px-8">
                <a href="https://calendly.com/wonderlandsworlds/30min" target="_blank" rel="noreferrer">
                  Schedule a Consultation
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default StudioLanding;
