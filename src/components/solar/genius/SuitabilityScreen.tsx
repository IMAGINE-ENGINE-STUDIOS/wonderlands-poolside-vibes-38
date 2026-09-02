import * as React from "react";
import { Check, X, TriangleAlert } from "lucide-react";
import { compassLabel, pitchAsRise, slopedAreaSqFt, type RoofFace } from "@/lib/solar/solarEngine";
import { VERDICT_STYLE, type FaceSuitability } from "@/lib/solar/suitability";
import { NREL_SUITABILITY, REFERENCE_SOURCES } from "@/data/nrelRooftopPotential";

/**
 * Movement I — Instrument.
 *
 * Every captured face is put through the four published NREL suitability tests
 * and the verdict is printed with its reasons, so a rejected face is explained
 * rather than silently dropped from the layout.
 */
const SuitabilityScreen: React.FC<{ faces: RoofFace[]; screens: FaceSuitability[] }> = ({ faces, screens }) => {
  const [open, setOpen] = React.useState<string | null>(screens[0]?.faceId ?? null);

  if (!faces.length)
    return (
      <div className="rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-8 text-center">
        <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
          Trace a roof above to run the national suitability screen
        </p>
      </div>
    );

  const counts = {
    suitable: screens.filter((s) => s.verdict === "suitable").length,
    marginal: screens.filter((s) => s.verdict === "marginal").length,
    rejected: screens.filter((s) => s.verdict === "rejected").length,
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        {(["suitable", "marginal", "rejected"] as const).map((v) => (
          <span
            key={v}
            className="inline-flex items-center gap-2 rounded-full border border-foreground/15 bg-background/70 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.24em] backdrop-blur"
          >
            <span className="h-2 w-2 rounded-full" style={{ background: VERDICT_STYLE[v].color }} />
            {counts[v]} {VERDICT_STYLE[v].label}
          </span>
        ))}
      </div>

      <div className="grid gap-3">
        {screens.map((s, idx) => {
          const face = faces.find((f) => f.id === s.faceId);
          if (!face) return null;
          const style = VERDICT_STYLE[s.verdict];
          const isOpen = open === s.faceId;
          return (
            <div
              key={s.faceId}
              className="overflow-hidden rounded-2xl border border-foreground/10 bg-background/60 backdrop-blur transition"
              style={{ borderLeft: `3px solid ${style.color}` }}
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : s.faceId)}
                className="flex w-full flex-wrap items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <div className="min-w-0">
                  <p className="text-[9px] uppercase tracking-[0.34em] text-muted-foreground">
                    Face {String(idx + 1).padStart(2, "0")} · {compassLabel(face.azimuthDeg)} · {pitchAsRise(face.pitchDeg)} ·{" "}
                    {Math.round(slopedAreaSqFt(face))} SF
                  </p>
                  <p className="mt-2 font-serif text-lg font-light leading-tight">{s.headline}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">Unshaded ratio</p>
                  <p className="font-serif text-2xl font-light" style={{ color: style.color }}>
                    {Math.round(s.shadedRatio * 100)}%
                  </p>
                </div>
              </button>

              {isOpen && (
                <div className="grid gap-2 border-t border-foreground/10 px-5 py-4 md:grid-cols-2">
                  {s.criteria.map((c) => (
                    <div key={c.id} className="rounded-xl border border-foreground/10 bg-foreground/[0.02] p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.24em]">{c.label}</p>
                        {c.pass ? (
                          <Check className="h-4 w-4" style={{ color: VERDICT_STYLE.suitable.color }} />
                        ) : c.id === "shading" ? (
                          <TriangleAlert className="h-4 w-4" style={{ color: VERDICT_STYLE.marginal.color }} />
                        ) : (
                          <X className="h-4 w-4" style={{ color: VERDICT_STYLE.rejected.color }} />
                        )}
                      </div>
                      <p className="mt-2 font-mono text-sm">{c.reading}</p>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        threshold {c.threshold}
                      </p>
                      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{c.note}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-[10px] leading-relaxed tracking-wide text-muted-foreground">
        Screen after {REFERENCE_SOURCES.nrel.organisation}, {REFERENCE_SOURCES.nrel.year}: shading at or above{" "}
        {Math.round(NREL_SUITABILITY.minShadedProductionRatio * 100)}% of an identical unshaded system, tilt no more than{" "}
        {NREL_SUITABILITY.maxTiltDeg}°, not north-facing, and at least {NREL_SUITABILITY.minContiguousAreaM2} m² of
        contiguous area.{" "}
        <a className="underline" href={REFERENCE_SOURCES.nrel.url} target="_blank" rel="noreferrer">
          Source
        </a>
      </p>
    </div>
  );
};

export default SuitabilityScreen;
