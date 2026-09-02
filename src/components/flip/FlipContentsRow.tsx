import * as React from "react";
import { ArrowUpRight, ChevronDown } from "lucide-react";

/**
 * A single line of a FLIP contents page.
 *
 * The row reads as printed type until the reader poses the mouse on it: the
 * leaf then slides open (grid-rows transition, no layout jump) and reveals the
 * product's plate and its description. Keyboard focus opens the same drawer so
 * the behaviour is not mouse-only. Used by every contents area — the edition
 * contents, the index spread and the product books — so the gesture is
 * identical across the whole magazine.
 */
export interface FlipContentsRowProps {
  index: number;
  name: string;
  priceLabel?: string;
  image?: string;
  /** Flat swatch used when an option has no photograph (gelcoat colours). */
  color?: string;
  description?: string;
  /** "light" prints on paper, "ink" prints over photography. */
  tone?: "light" | "ink";
  /** Optional — informational rows (option chapters) simply open their leaf. */
  onOpen?: () => void;
}

const FlipContentsRow: React.FC<FlipContentsRowProps> = ({
  index,
  name,
  priceLabel,
  image,
  color,
  description,
  tone = "light",
  onOpen,
}) => {
  const [open, setOpen] = React.useState(false);
  const ink = tone === "ink";

  return (
    <li
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      className={ink ? "border-b border-white/15" : "border-t border-border/50"}
    >
      <button
        type="button"
        onClick={() => (onOpen ? onOpen() : setOpen((o) => !o))}
        aria-label={onOpen ? `Open the ${name} page` : `Preview ${name}`}
        aria-expanded={onOpen ? undefined : open}
        className={`group flex w-full items-center gap-3 px-1 py-[7px] text-left transition-colors ${
          ink ? "hover:bg-white/12 focus-visible:bg-white/12" : "hover:bg-foreground/[0.04]"
        } focus-visible:outline-none`}
      >

        <span
          className={`w-6 shrink-0 font-serif text-[11px] tabular-nums ${
            ink ? "text-white/55 group-hover:text-white" : "text-muted-foreground"
          }`}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <span
          className={`min-w-0 flex-1 truncate text-[10.5px] uppercase tracking-[0.16em] ${
            ink ? "text-white" : "text-foreground"
          }`}
        >
          {name}
        </span>
        {priceLabel ? (
          <span className={`shrink-0 font-serif text-[11px] ${ink ? "text-white/80" : "text-muted-foreground"}`}>
            {priceLabel}
          </span>
        ) : null}
        {onOpen ? (
          <ArrowUpRight
            className={`h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-[2px] ${
              ink ? "text-white/45 group-hover:text-white" : "text-muted-foreground"
            }`}
          />
        ) : (
          <ChevronDown
            className={`h-3.5 w-3.5 shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""} ${
              ink ? "text-white/45 group-hover:text-white" : "text-muted-foreground"
            }`}
          />
        )}
      </button>

      {/* the slide-open leaf: image + description — the whole drawer is part of
          the control, so clicking the plate or the description opens the page
          exactly like clicking the title line. */}
      <div
        className="grid transition-[grid-template-rows,opacity] duration-500 ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr", opacity: open ? 1 : 0 }}
        aria-hidden={!open}
      >
        <div className="overflow-hidden">
          <div
            role={onOpen ? "button" : undefined}
            tabIndex={-1}
            onClick={() => (onOpen ? onOpen() : setOpen((o) => !o))}
            className={`flex gap-3 px-1 pb-2.5 pt-0.5 ${onOpen ? "cursor-pointer" : "cursor-default"} ${
              ink ? "hover:bg-white/12" : "hover:bg-foreground/[0.04]"
            }`}
          >

            {image ? (
              <img
                src={image}
                alt=""
                loading="lazy"
                decoding="async"
                className={`h-14 w-20 shrink-0 object-cover transition-transform duration-700 ${
                  open ? "scale-100" : "scale-105"
                } ${ink ? "ring-1 ring-white/20" : "ring-1 ring-border/50"}`}
              />
            ) : color ? (
              <span
                aria-hidden
                style={{ backgroundColor: color }}
                className={`h-14 w-20 shrink-0 ${ink ? "ring-1 ring-white/20" : "ring-1 ring-border/50"}`}
              />
            ) : null}

            <p
              className={`min-w-0 text-[10.5px] leading-relaxed ${
                ink ? "text-white/75" : "text-muted-foreground"
              }`}
            >
              {description || "Delivered and installed turnkey at your address."}
            </p>
          </div>
        </div>
      </div>
    </li>
  );
};

export default FlipContentsRow;
