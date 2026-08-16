import * as React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Compass, MoveRight } from "lucide-react";

export type FlipIndexItem = {
  id: string;
  label: string;
  tagline: string;
  description?: string;
  images: string[];
  notes: string[];
};

type Props = {
  items: FlipIndexItem[];
  onOpen: (id: string) => void;
};

/**
 * FLIP V6 — "The Expedition Index".
 * A cinematic, game-like main menu that lives on a single magazine leaf.
 * Full-bleed stage with parallax, a snap deck of plates at the base, a numeric
 * chapter rail, and keyboard / wheel / drag navigation.
 */
export default function FlipIndexV6({ items, onOpen }: Props) {
  const [active, setActive] = useState(0);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const deckRef = useRef<HTMLDivElement | null>(null);
  const wheelLock = useRef(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const count = items.length;
  const item = items[active];

  const go = useCallback(
    (dir: number) => setActive((a) => (a + dir + count) % Math.max(count, 1)),
    [count],
  );

  /* keep the active plate centered in the deck */
  useEffect(() => {
    const deck = deckRef.current;
    const el = deck?.querySelector<HTMLElement>(`[data-plate="${active}"]`);
    if (!deck || !el) return;
    deck.scrollTo({
      left: el.offsetLeft - deck.clientWidth / 2 + el.clientWidth / 2,
      behavior: "smooth",
    });
  }, [active]);

  /* keyboard gameplay */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = stageRef.current;
      if (!el || !el.isConnected) return;
      if (e.key === "ArrowRight" || e.key === "d") {
        e.stopPropagation();
        go(1);
      } else if (e.key === "ArrowLeft" || e.key === "a") {
        e.stopPropagation();
        go(-1);
      } else if (e.key === "Enter" && item) {
        onOpen(item.id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, item, onOpen]);

  const onWheel = (e: React.WheelEvent) => {
    const now = Date.now();
    if (now - wheelLock.current < 320) return;
    if (Math.abs(e.deltaY) < 12 && Math.abs(e.deltaX) < 12) return;
    wheelLock.current = now;
    go((e.deltaY || e.deltaX) > 0 ? 1 : -1);
  };

  const onMove = (e: React.PointerEvent) => {
    const r = stageRef.current?.getBoundingClientRect();
    if (!r) return;
    setTilt({
      x: ((e.clientX - r.left) / r.width - 0.5) * 2,
      y: ((e.clientY - r.top) / r.height - 0.5) * 2,
    });
  };

  const stop = (e: React.SyntheticEvent) => e.stopPropagation();

  const chapter = useMemo(() => String(active + 1).padStart(2, "0"), [active]);

  if (!item) return null;

  return (
    <div
      ref={stageRef}
      onWheel={onWheel}
      onPointerMove={onMove}
      onPointerLeave={() => setTilt({ x: 0, y: 0 })}
      onPointerDown={stop}
      onMouseDown={stop}
      onTouchStart={stop}
      className="relative h-full w-full select-none overflow-hidden bg-black"
    >
      {/* ---------------- stage imagery, cross-faded with parallax ---------------- */}
      {items.map((it, i) => (
        <img
          key={it.id}
          src={it.images[0]}
          alt={it.label}
          loading={i < 3 ? "eager" : "lazy"}
          decoding="async"
          aria-hidden={i !== active}
          className={`absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-[1100ms] ease-out ${
            i === active ? "opacity-100" : "opacity-0"
          }`}
          style={{
            transform:
              i === active
                ? `scale(1.12) translate3d(${tilt.x * -14}px, ${tilt.y * -10}px, 0)`
                : "scale(1.2)",
          }}
        />
      ))}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/35" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_18%_20%,transparent,rgba(0,0,0,0.75))]" />

      {/* ------------------------------ chapter rail ----------------------------- */}
      <div className="absolute left-0 top-0 z-20 flex h-full w-9 flex-col items-center justify-center gap-[3px] sm:w-12">
        {items.map((it, i) => {
          const d = Math.abs(i - active);
          return (
            <button
              key={it.id}
              onClick={() => setActive(i)}
              title={it.label}
              aria-label={it.label}
              className="group flex w-full items-center justify-center py-[2px]"
            >
              <span
                className={`h-px transition-all duration-500 ${
                  i === active
                    ? "w-6 bg-white sm:w-8"
                    : d < 3
                      ? "w-3 bg-white/50 group-hover:w-6 group-hover:bg-white/90 sm:w-4"
                      : "w-2 bg-white/25 group-hover:w-5 group-hover:bg-white/70"
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* -------------------------------- headline ------------------------------- */}
      <div className="relative z-10 flex h-full flex-col justify-between pl-10 pr-4 pt-5 sm:pl-14 sm:pr-8 sm:pt-7">
        <div className="flex items-start justify-between gap-4 text-white">
          <div>
            <p className="flex items-center gap-2 text-[8px] uppercase tracking-[0.45em] text-white/70 sm:text-[9px]">
              <Compass className="h-3 w-3" />
              Wonderlands World — The Expedition
            </p>
            <p className="mt-1 text-[8px] uppercase tracking-[0.3em] text-white/45 sm:text-[9px]">
              {count} disciplines · drawn, priced, installed turnkey
            </p>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <button
              onClick={() => go(-1)}
              aria-label="Previous discipline"
              className="rounded-full border border-white/25 bg-white/10 p-1.5 text-white backdrop-blur-md transition-all hover:scale-110 hover:bg-white/20"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => go(1)}
              aria-label="Next discipline"
              className="rounded-full border border-white/25 bg-white/10 p-1.5 text-white backdrop-blur-md transition-all hover:scale-110 hover:bg-white/20"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* active discipline */}
        <div key={item.id} className="max-w-[26rem] animate-fade-in text-white">
          <p className="font-serif text-[11px] tabular-nums tracking-[0.3em] text-white/60">
            {chapter} / {String(count).padStart(2, "0")}
          </p>
          <h3 className="mt-1 font-serif text-4xl font-light leading-[0.88] drop-shadow-[0_12px_40px_rgba(0,0,0,0.7)] sm:text-6xl">
            {item.label}
          </h3>
          <p className="mt-2 text-[9px] uppercase tracking-[0.4em] text-white/70 sm:text-[10px]">
            {item.tagline}
          </p>
          <ul className="mt-3 hidden flex-wrap gap-1.5 sm:flex">
            {item.notes.slice(0, 3).map((n) => (
              <li
                key={n}
                className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[8px] uppercase tracking-[0.22em] text-white/85 backdrop-blur-md"
              >
                {n}
              </li>
            ))}
          </ul>
          <button
            onClick={() => onOpen(item.id)}
            className="group mt-4 inline-flex items-center gap-3 rounded-full border border-white/30 bg-white/12 py-2 pl-5 pr-2 text-[9px] uppercase tracking-[0.35em] text-white backdrop-blur-xl transition-all duration-300 hover:border-white/70 hover:bg-white/25 sm:text-[10px]"
          >
            Enter {item.label}
            <span className="grid h-7 w-7 place-items-center rounded-full bg-white text-black transition-transform duration-300 group-hover:translate-x-1">
              <MoveRight className="h-3.5 w-3.5" />
            </span>
          </button>
        </div>

        {/* ------------------------------- plate deck ------------------------------ */}
        <div className="pb-4 sm:pb-6">
          <div
            ref={deckRef}
            className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-2 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {items.map((it, i) => (
              <button
                key={it.id}
                data-plate={i}
                onClick={() => (i === active ? onOpen(it.id) : setActive(i))}
                onMouseEnter={() => setActive(i)}
                title={i === active ? `Open ${it.label}` : it.label}
                className={`group relative shrink-0 snap-center overflow-hidden rounded-md ring-1 transition-all duration-500 ease-out ${
                  i === active
                    ? "h-20 w-32 -translate-y-1 ring-white/80 shadow-[0_18px_45px_-16px_rgba(0,0,0,0.9)] sm:h-24 sm:w-40"
                    : "h-14 w-20 opacity-60 ring-white/20 hover:opacity-100 sm:h-16 sm:w-28"
                }`}
              >
                <img
                  src={it.images[0]}
                  alt={it.label}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-110"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />
                <span className="absolute inset-x-1.5 bottom-1 block truncate text-left font-serif text-[10px] font-light leading-tight text-white sm:text-xs">
                  {it.label}
                </span>
                <span className="absolute right-1.5 top-1 font-serif text-[8px] tabular-nums text-white/60">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </button>
            ))}
          </div>
          <p className="mt-1 text-[8px] uppercase tracking-[0.3em] text-white/45 sm:text-[9px]">
            Drag the deck · arrows or scroll to travel · click a plate twice to enter
          </p>
        </div>
      </div>
    </div>
  );
}
