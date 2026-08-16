/**
 * Riffle transition — when a product book is opened the edition visibly rushes
 * through many pages before settling on the dossier, the way a hand thumbs a
 * catalogue to a marked model.
 */
const LEAVES = 9;

const FlipRiffle: React.FC<{
  width: number;
  height: number;
  label?: string;
}> = ({ width, height, label }) => (
  <div
    aria-hidden
    className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center"
    style={{ perspective: "2600px" }}
  >
    <div className="relative" style={{ width, height, transformStyle: "preserve-3d" }}>
      {/* static right half the leaves peel away from */}
      <div className="absolute inset-y-0 right-0 w-1/2 bg-background shadow-[0_40px_90px_-40px_rgba(0,0,0,0.5)]" />
      {Array.from({ length: LEAVES }).map((_, i) => (
        <div
          key={i}
          className="absolute inset-y-0 right-0 w-1/2 animate-flip-riffle border-l border-border/40 bg-gradient-to-l from-background via-background to-muted/70 shadow-[-20px_0_50px_-20px_rgba(0,0,0,0.45)]"
          style={{
            transformOrigin: "left center",
            transformStyle: "preserve-3d",
            animationDelay: `${i * 78}ms`,
            backfaceVisibility: "hidden",
          }}
        />
      ))}
      {label && (
        <div className="absolute inset-x-0 bottom-6 text-center text-[9px] uppercase tracking-[0.4em] text-muted-foreground">
          {label}
        </div>
      )}
    </div>
  </div>
);

export default FlipRiffle;
