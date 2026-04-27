import {
  Waves,
  Flame,
  Droplet,
  Sun,
  Shield,
  Fence,
  Home as HomeIcon,
  Grid3x3,
  Sprout,
  Umbrella,
  DoorOpen,
  Palette,
  Layers,
} from "lucide-react";

const CATEGORIES = [
  { id: "pools", label: "Pools", icon: Waves },
  { id: "saunas", label: "Saunas", icon: Flame },
  { id: "spas", label: "Spas", icon: Droplet },
  { id: "tanning-ledges", label: "Tanning Ledges", icon: Sun },
  { id: "screen-enclosures", label: "Screen Enclosures", icon: Shield },
  { id: "patio-fencing", label: "Patio Fencing", icon: Fence },
  { id: "lanai", label: "Lanai", icon: HomeIcon },
  { id: "pavers", label: "Pavers", icon: Grid3x3 },
  { id: "artificial-grass", label: "Artificial Grass", icon: Sprout },
  { id: "covers", label: "Covers", icon: Umbrella },
  { id: "driveway-gates", label: "Driveway Gates", icon: DoorOpen },
  { id: "finishes", label: "Finishes", icon: Palette },
  { id: "liners", label: "Liners", icon: Layers },
];

const HomeCategoriesGrid = () => {
  const handleClick = (id: string) => {
    if (window.location.hash !== `#${id}`) {
      window.location.hash = id;
    } else {
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    }
    requestAnimationFrame(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <section
      aria-label="Browse Product Categories"
      className="py-16 px-4 bg-background"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-primary via-coral to-orange">
            Browse Our Collections
          </h2>
          <p className="text-foreground/70 max-w-2xl mx-auto">
            Explore every product category we offer — tap any tile to jump in.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-4">
          {CATEGORIES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => handleClick(id)}
              className="group relative aspect-square flex flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-card hover:bg-primary/5 hover:border-primary/40 hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/15 to-coral/15 flex items-center justify-center group-hover:from-primary/25 group-hover:to-coral/25 transition-colors">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-foreground text-center px-2 leading-tight">
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeCategoriesGrid;
