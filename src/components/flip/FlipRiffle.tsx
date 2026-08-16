/**
 * Riffle transition — when a product book is opened the edition visibly rushes
 * through many pages before settling on the dossier, the way a hand thumbs a
 * catalogue to a marked model.
 *
 * The leaves are never blank: each one carries a real plate from the edition
 * (the category imagery and the models of that discipline) so the reader sees
 * that there is other content either side of where they land, and the leaf that
 * settles last shows the product they asked for.
 */
const LEAVES = 9;

const Plate: React.FC<{ src?: string; caption?: string; mirrored?: boolean }> = ({
  src,
  caption,
  mirrored,
}) => (
  <div
    className="absolute inset-0 overflow-hidden bg-background"
    style={{ backfaceVisibility: "hidden", transform: mirrored ? "rotateY(180deg)" : undefined }}
  >
    {src ? (
      <img
        src={src}
        alt=""
        loading="eager"
        decoding="async"
        className="h-full w-full object-cover"
        style={{ opacity: 0.96 }}
      />
    ) : (
      <div className="h-full w-full bg-gradient-to-l from-background via-background to-muted/70" />
    )}
    <div className="absolute inset-0 bg-gradient-to-l from-black/0 via-black/0 to-black/25" />
    {caption && (
      <div className="absolute bottom-4 left-0 right-0 px-5 text-center text-[8px] uppercase tracking-[0.35em] text-white/85 drop-shadow">
        {caption}
      </div>
    )}
  </div>
);

const FlipRiffle: React.FC<{
  width: number;
  height: number;
  label?: string;
  /** Real plates from the edition, in reading order. */
  images?: string[];
  /** Captions matched to `images`, used as the small page footers. */
  captions?: string[];
  /** The plate the riffle settles on — the product being opened. */
  destination?: string;
}> = ({ width, height, label, images = [], captions = [], destination }) => {
  const pool = images.filter(Boolean);
  const at = (i: number) => (pool.length ? pool[i % pool.length] : undefined);
  const cap = (i: number) => (captions.length ? captions[i % captions.length] : undefined);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center"
      style={{ perspective: "2600px" }}
    >
      <div className="relative" style={{ width, height, transformStyle: "preserve-3d" }}>
        {/* the destination page, revealed as the leaves peel away */}
        <div className="absolute inset-y-0 right-0 w-1/2 overflow-hidden bg-background shadow-[0_40px_90px_-40px_rgba(0,0,0,0.5)]">
          <Plate src={destination ?? at(0)} />
        </div>
        {/* the left half keeps showing the edition the reader came from */}
        <div className="absolute inset-y-0 left-0 w-1/2 overflow-hidden bg-background">
          <Plate src={at(1)} caption={cap(1)} />
        </div>
        {Array.from({ length: LEAVES }).map((_, i) => (
          <div
            key={i}
            className="absolute inset-y-0 right-0 w-1/2 animate-flip-riffle border-l border-border/40 shadow-[-20px_0_50px_-20px_rgba(0,0,0,0.45)]"
            style={{
              transformOrigin: "left center",
              transformStyle: "preserve-3d",
              animationDelay: `${i * 78}ms`,
            }}
          >
            <Plate src={at(LEAVES - i)} caption={cap(LEAVES - i)} />
            <Plate src={at(LEAVES - i + 1)} caption={cap(LEAVES - i + 1)} mirrored />
          </div>
        ))}
        {label && (
          <div className="absolute inset-x-0 bottom-6 text-center text-[9px] uppercase tracking-[0.4em] text-muted-foreground">
            {label}
          </div>
        )}
      </div>
    </div>
  );
};

export default FlipRiffle;
