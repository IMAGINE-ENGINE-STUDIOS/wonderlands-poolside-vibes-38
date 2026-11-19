import type { PaverDisplayInfo } from "@/lib/paverDisplay";

/**
 * Shared display enrichment for paver cards and sections (Paver Port
 * Wiring Job 5). Renders only what lib/paverDisplay resolved from the
 * ported Belgard data: printed sizes, laying pattern names, and the
 * product color's own per-unit faces. Display only; no prices here.
 */

const hasContent = (info: PaverDisplayInfo | null | undefined) =>
  Boolean(info && (info.sizes.length > 0 || info.patternNames.length > 0));

/** Compact centered lines for carousel and grid cards. */
export const PaverDisplayLines = ({
  info,
  className = "",
}: {
  info: PaverDisplayInfo | null | undefined;
  className?: string;
}) => {
  if (!hasContent(info)) return null;
  return (
    <div className={`space-y-0.5 ${className}`}>
      {info!.sizes.length > 0 && (
        <p className="text-[10px] leading-snug text-muted-foreground line-clamp-2">
          Printed sizes (in): {info!.sizes.join(", ")}
        </p>
      )}
      {info!.patternNames.length > 0 && (
        <p className="text-[10px] leading-snug text-muted-foreground line-clamp-2">
          Laying patterns: {info!.patternNames.join(", ")}
        </p>
      )}
    </div>
  );
};

/** Left aligned preview strip for the currently selected paver. */
export const PaverSelectedPreview = ({
  info,
  name,
  className = "",
}: {
  info: PaverDisplayInfo | null | undefined;
  name?: string;
  className?: string;
}) => {
  if (!info || (!hasContent(info) && info.faceImages.length === 0)) return null;
  return (
    <div className={`flex items-start gap-3 border border-border bg-muted/30 p-3 ${className}`}>
      {info.faceImages.length > 0 && (
        <div className="flex shrink-0 gap-1.5">
          {info.faceImages.slice(0, 3).map((src, i) => (
            <img
              key={src}
              loading="lazy"
              decoding="async"
              src={src}
              alt={name ? `${name} actual unit face ${i + 1}` : "Actual unit face"}
              className="h-12 w-12 object-cover border border-border/60"
            />
          ))}
        </div>
      )}
      <div className="min-w-0 space-y-1">
        {name && <p className="text-xs font-medium text-foreground">{name}</p>}
        {info.sizes.length > 0 && (
          <p className="text-[11px] leading-snug text-muted-foreground">
            Printed sizes (in): {info.sizes.join(", ")}
          </p>
        )}
        {info.patternNames.length > 0 && (
          <p className="text-[11px] leading-snug text-muted-foreground">
            Laying patterns: {info.patternNames.join(", ")}
          </p>
        )}
        {info.faceImages.length > 0 && (
          <p className="text-[11px] leading-snug text-muted-foreground">
            Shown with the actual unit faces of this color, cut from the catalog swatch.
          </p>
        )}
      </div>
    </div>
  );
};
