import * as React from "react";
import {
  NATIONAL_FINDINGS,
  POTENTIAL_CAVEAT,
  SMALL_BUILDING_FINDINGS,
  REFERENCE_SOURCES,
} from "@/data/nrelRooftopPotential";
import type { RoofBenchmark } from "@/lib/solar/suitability";

/**
 * Movement II — Benchmark.
 *
 * Places one measured roof against the national rooftop-potential data: how much
 * of its area is developable, how densely it can be packed, and how hard its
 * kilowatts work compared with the national average implied by NREL's own
 * published small-building totals.
 */

const Bar: React.FC<{ label: string; mine: number; theirs: number; format: (n: number) => string; caption: string }> = ({
  label,
  mine,
  theirs,
  format,
  caption,
}) => {
  const max = Math.max(mine, theirs) * 1.15 || 1;
  return (
    <div className="rounded-2xl border border-foreground/10 bg-background/60 p-5 backdrop-blur">
      <p className="text-[9px] uppercase tracking-[0.34em] text-muted-foreground">{label}</p>
      <p className="mt-3 font-serif text-3xl font-light leading-none">{format(mine)}</p>
      <div className="mt-4 space-y-2">
        <div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-foreground/10">
            <div className="h-full rounded-full bg-[#f97316]" style={{ width: `${(mine / max) * 100}%` }} />
          </div>
          <p className="mt-1 text-[9px] uppercase tracking-[0.22em] text-muted-foreground">This roof</p>
        </div>
        <div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-foreground/10">
            <div className="h-full rounded-full bg-foreground/40" style={{ width: `${(theirs / max) * 100}%` }} />
          </div>
          <p className="mt-1 text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
            National reference · {format(theirs)}
          </p>
        </div>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{caption}</p>
    </div>
  );
};

const NationalBenchmark: React.FC<{ benchmark: RoofBenchmark | null }> = ({ benchmark }) => (
  <div className="space-y-8">
    {benchmark ? (
      <>
        <div className="flex flex-wrap items-end justify-between gap-6 rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-6">
          <div>
            <p className="text-[9px] uppercase tracking-[0.34em] text-muted-foreground">Classified as</p>
            <p className="mt-2 font-serif text-2xl font-light">{benchmark.buildingClass.label}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {benchmark.footprintSqFt.toLocaleString()} SF footprint captured · {benchmark.buildingClass.blurb}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[9px] uppercase tracking-[0.34em] text-muted-foreground">Yield standing</p>
            <p
              className="mt-2 font-serif text-3xl font-light"
              style={{ color: benchmark.standing === "below" ? "#dc2626" : "#f97316" }}
            >
              {benchmark.deltaPercent > 0 ? "+" : ""}
              {benchmark.deltaPercent}%
            </p>
            <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
              {benchmark.standing} the national average
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Bar
            label="Developable roof area"
            mine={benchmark.developableShare * 100}
            theirs={benchmark.nationalShare * 100}
            format={(n) => `${Math.round(n)}%`}
            caption="Share of the traced roof surface that survives the shading, tilt, azimuth and area screen."
          />
          <Bar
            label="Capacity density"
            mine={benchmark.capacityDensity}
            theirs={benchmark.nationalCapacityDensity}
            format={(n) => `${Math.round(n)} W/m²`}
            caption="Installed watts per square metre of rackable area — modern modules beat the 2016 study."
          />
          <Bar
            label="Specific yield"
            mine={benchmark.specificYield}
            theirs={benchmark.nationalSpecificYield}
            format={(n) => `${Math.round(n).toLocaleString()} kWh/kW`}
            caption="Annual energy per installed kilowatt. Florida sun sits well above the national mix."
          />
        </div>
      </>
    ) : (
      <div className="rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-8 text-center">
        <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
          Capture a roof to benchmark it against the national data
        </p>
      </div>
    )}

    <div className="grid gap-4 md:grid-cols-2">
      {[
        { title: "Small buildings — the lidar findings", rows: SMALL_BUILDING_FINDINGS },
        { title: "The national picture", rows: NATIONAL_FINDINGS },
      ].map((group) => (
        <div key={group.title} className="rounded-2xl border border-foreground/10 bg-background/60 p-6 backdrop-blur">
          <p className="text-[9px] uppercase tracking-[0.34em] text-muted-foreground">{group.title}</p>
          <dl className="mt-4 space-y-4">
            {group.rows.map((f) => (
              <div key={f.id} className="border-t border-foreground/10 pt-4 first:border-0 first:pt-0">
                <dt className="flex flex-wrap items-baseline gap-3">
                  <span className="font-serif text-2xl font-light">{f.value}</span>
                  <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{f.label}</span>
                </dt>
                <dd className="mt-2 text-xs leading-relaxed text-muted-foreground">{f.detail}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>

    <p className="rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-5 text-xs leading-relaxed text-muted-foreground">
      {POTENTIAL_CAVEAT}{" "}
      <a className="underline" href={REFERENCE_SOURCES.doe.url} target="_blank" rel="noreferrer">
        {REFERENCE_SOURCES.doe.organisation}
      </a>{" "}
      ·{" "}
      <a className="underline" href={REFERENCE_SOURCES.nrelData.url} target="_blank" rel="noreferrer">
        NREL data submission 121
      </a>{" "}
      ·{" "}
      <a className="underline" href={REFERENCE_SOURCES.erl.url} target="_blank" rel="noreferrer">
        Environ. Res. Lett. 13 024027
      </a>
    </p>
  </div>
);

export default NationalBenchmark;
