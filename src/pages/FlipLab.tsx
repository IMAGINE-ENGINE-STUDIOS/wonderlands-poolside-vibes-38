import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import FlipIndex from "@/components/FlipIndex";
import FlipMagazine from "@/components/flip/FlipMagazine";

type VersionId = "v1" | "v2";

const VERSIONS: { id: VersionId; label: string; title: string; blurb: string }[] = [
  {
    id: "v1",
    label: "V1",
    title: "The Index — Console",
    blurb:
      "Fourteen disciplines as one book. Opening a category slides a console over the spread: category rail, search, magazine product grid.",
  },
  {
    id: "v2",
    label: "V2",
    title: "Magazine Edition",
    blurb:
      "Each category becomes its own magazine. Cover, contents, a spread per model, and every option chapter printed as its own page.",
  },
];

const FlipLab = () => {
  const [active, setActive] = useState<VersionId>("v2");
  const current = VERSIONS.find((v) => v.id === active)!;

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border/60 px-6 py-6 md:px-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[9px] uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> Wonderlands World
        </Link>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-[9px] uppercase tracking-[0.4em] text-muted-foreground">Internal — Design Lab</p>
            <h1 className="mt-2 font-serif text-4xl font-light leading-none tracking-tight text-foreground sm:text-5xl">
              FLIP Versions
            </h1>
            <p className="mt-3 max-w-xl text-[12px] leading-relaxed text-muted-foreground">
              Every FLIP interface, side by side. Switch versions to test navigation, page rhythm, and how deep a single
              product can be read.
            </p>
          </div>
          <nav aria-label="FLIP versions" className="flex flex-wrap gap-2">
            {VERSIONS.map((v) => (
              <button
                key={v.id}
                onClick={() => setActive(v.id)}
                aria-pressed={active === v.id}
                className={`border px-4 py-2.5 text-left transition-colors ${
                  active === v.id
                    ? "border-foreground bg-foreground text-background"
                    : "border-border/60 text-foreground hover:border-foreground"
                }`}
              >
                <span className="block text-[9px] uppercase tracking-[0.35em] opacity-70">{v.label}</span>
                <span className="mt-1 block text-[11px] uppercase tracking-[0.2em]">{v.title}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      <section className="border-b border-border/50 px-6 py-4 md:px-10">
        <p className="max-w-3xl text-[11px] leading-relaxed text-muted-foreground">
          <span className="uppercase tracking-[0.3em] text-foreground">{current.label}</span> — {current.blurb}
        </p>
      </section>

      {active === "v1" ? <FlipIndex /> : <FlipMagazine />}
    </main>
  );
};

export default FlipLab;
