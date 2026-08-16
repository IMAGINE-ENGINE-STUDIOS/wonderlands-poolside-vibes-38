import React from "react";
import { getProjectPipeline, type PipelineStep } from "@/data/projectPipeline";
import { TURNKEY_SCOPE } from "@/data/turnkeyScope";

interface Props {
  categoryId: string;
  /** "scope" = left leaf (what is standard), "steps" = facing leaf (the pipeline). */
  part: "scope" | "steps";
  /** Which half of the step list to print on this leaf. */
  half?: 0 | 1;
}

const Eyebrow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-[9px] uppercase tracking-[0.32em] text-muted-foreground">{children}</p>
);

const StepRow: React.FC<{ s: PipelineStep }> = ({ s }) => (
  <li className="flex gap-3 border-t border-border/50 py-2">
    <span className="w-6 shrink-0 font-serif text-xs text-muted-foreground">
      {String(s.step).padStart(2, "0")}
    </span>
    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-[0.2em]">{s.title}</p>
      <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">{s.detail}</p>
      <p className="mt-1 font-serif text-[10px] text-muted-foreground">
        {s.duration} · {s.owner}
      </p>
    </div>
  </li>
);

/** Turn-key scope and the managed project pipeline, printed as a FLIP spread. */
const FlipProjectPipeline: React.FC<Props> = ({ categoryId, part, half = 0 }) => {
  const pipeline = getProjectPipeline(categoryId);
  if (!pipeline) return null;

  if (part === "scope") {
    return (
      <div className="flex h-full w-full flex-col overflow-hidden p-7 sm:p-9">
        <Eyebrow>Included as standard</Eyebrow>
        <h3 className="mt-2 font-serif text-2xl font-light leading-tight">Turn-key scope</h3>
        <p className="mt-3 max-w-[22rem] text-[10px] leading-relaxed text-muted-foreground">
          These lines are carried by Wonderlands World on every project. Shape, depth profile,
          waterline, interior finish, coping and every added feature are your selections and are
          priced as configured.
        </p>
        <ul className="mt-4 min-h-0 flex-1 overflow-hidden">
          {TURNKEY_SCOPE.map((i) => (
            <li key={i.label} className="border-t border-border/50 py-1.5">
              <p className="text-[10px] uppercase tracking-[0.2em]">{i.label}</p>
              <p className="text-[10px] leading-relaxed text-muted-foreground">{i.note}</p>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const mid = Math.ceil(pipeline.steps.length / 2);
  const slice = half === 0 ? pipeline.steps.slice(0, mid) : pipeline.steps.slice(mid);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden p-7 sm:p-9">
      <Eyebrow>{half === 0 ? "Project pipeline" : "Project pipeline — continued"}</Eyebrow>
      {half === 0 && (
        <>
          <h3 className="mt-2 font-serif text-2xl font-light leading-tight">{pipeline.title}</h3>
          <p className="mt-3 max-w-[22rem] text-[10px] leading-relaxed text-muted-foreground">
            {pipeline.note}
          </p>
        </>
      )}
      <ul className="mt-4 min-h-0 flex-1 overflow-hidden">
        {slice.map((s) => (
          <StepRow key={s.step} s={s} />
        ))}
      </ul>
    </div>
  );
};

export default FlipProjectPipeline;
