/**
 * Corner lift hint — on arrival the bottom outer corner of the book peels up
 * as though a hand were lifting it, so the reader instantly understands the
 * pages turn. Clicking the corner turns the page; it retires after the first flip.
 */
const FlipCornerHint: React.FC<{ onFlip: () => void; visible: boolean }> = ({ onFlip, visible }) => (
  <div
    className="pointer-events-none absolute bottom-0 right-0 z-30 h-28 w-28 overflow-hidden transition-opacity duration-700"
    style={{ opacity: visible ? 1 : 0 }}
  >
    <button
      onClick={onFlip}
      aria-label="Turn the page"
      tabIndex={visible ? 0 : -1}
      className={`absolute inset-0 origin-bottom-right animate-flip-corner-lift ${
        visible ? "pointer-events-auto" : "pointer-events-none"
      }`}
      style={{ animationPlayState: visible ? "running" : "paused" }}
    >
      {/* the page underneath, revealed by the lift */}
      <span
        className="absolute bottom-0 right-0 h-28 w-28 bg-foreground/12"
        style={{ clipPath: "polygon(100% 0, 100% 100%, 0 100%)" }}
      />
      {/* the lifted paper itself */}
      <span
        className="absolute bottom-0 right-0 h-28 w-28 bg-gradient-to-tl from-background via-background to-foreground/15 shadow-[-14px_-14px_34px_-14px_rgba(0,0,0,0.55)]"
        style={{ clipPath: "polygon(100% 0, 100% 100%, 0 100%)" }}
      />
      <span
        className="absolute bottom-1.5 right-1.5 text-[7px] uppercase tracking-[0.3em] text-foreground/60"
        style={{ transform: "rotate(-45deg)" }}
      >
        Flip
      </span>
    </button>
  </div>
);

export default FlipCornerHint;
