import * as React from "react";

interface EditorialSectionHeaderProps {
  /** Small uppercase kicker above the title */
  eyebrow?: string;
  title: string;
  /** Right-aligned standfirst copy */
  description?: string;
  className?: string;
}

/**
 * Shared magazine-style section header used across every collection on the
 * homepage. Serif display title on the left, hairline rule, standfirst on the
 * right — identical rhythm to the Wonderlands World Collection spread.
 */
const EditorialSectionHeader = ({ eyebrow, title, description, className = "" }: EditorialSectionHeaderProps) => (
  <div
    className={`mb-12 grid gap-6 border-b border-border/60 pb-10 text-left lg:mb-16 lg:grid-cols-[1fr_auto] lg:items-end ${className}`}
  >
    <div>
      {eyebrow && (
        <p className="mb-4 text-[9px] uppercase tracking-[0.5em] text-muted-foreground">{eyebrow}</p>
      )}
      <h2 className="font-serif text-4xl font-light leading-[1.02] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
        {title}
      </h2>
    </div>
    {description && (
      <p className="max-w-sm text-sm leading-relaxed text-muted-foreground lg:text-right">{description}</p>
    )}
  </div>
);

export default EditorialSectionHeader;
