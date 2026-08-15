import * as React from "react";

/**
 * FLIP — full-bleed spreads.
 * One photograph is split across two facing pages (left half / right half) so the
 * image reads continuously over the gutter, with an editorial data panel sitting
 * on the left page. Used for statement openers, indexes and portfolio plates.
 */

export type SpreadStat = { value: string; label: string };

export type SpreadOptions = {
  /** Unique key prefix for the two generated pages. */
  key: string;
  /** The photograph carried across both pages. */
  image: string;
  eyebrow?: string;
  title: string;
  /** Second title line, set in italic like a magazine sub-head. */
  titleItalic?: string;
  body?: string;
  stats?: SpreadStat[];
  /** Small lockup printed bottom-left of the spread. */
  lockup?: string;
  /** Caption printed on the right page. */
  caption?: string;
  /** Extra content rendered on the right page (index lists, links). */
  right?: () => React.ReactNode;
  /** Panel side — defaults to the left page. */
  invert?: boolean;
};

type PageLike = { key: string; tone?: string; render: () => React.ReactNode };

/**
 * Half of the photograph. The image is laid out at twice the page width and
 * cropped with object-cover, so the two pages form one continuous photograph
 * without ever stretching or squashing the original proportions.
 */
const Half: React.FC<{ image: string; side: "left" | "right"; children?: React.ReactNode }> = ({
  image,
  side,
  children,
}) => (
  <div className="relative h-full w-full overflow-hidden bg-black">
    <div className={`absolute inset-y-0 w-[200%] ${side === "left" ? "left-0" : "-left-full"}`}>
      <img
        src={image}
        alt=""
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover animate-ken-burns"
      />
    </div>
    {/* gutter shading so the fold reads like paper */}
    <div
      className={`pointer-events-none absolute inset-y-0 w-16 ${
        side === "left" ? "right-0 bg-gradient-to-l" : "left-0 bg-gradient-to-r"
      } from-black/35 to-transparent`}
    />
    <div className="relative h-full w-full text-white">{children}</div>
  </div>
);


const Panel: React.FC<{ o: SpreadOptions }> = ({ o }) => (
  <div
    className="flex h-full w-[86%] flex-col justify-center bg-[hsl(0_0%_8%/0.86)] p-7 backdrop-blur-[2px] sm:p-9"
    style={{ clipPath: "polygon(0 0, 100% 3.5%, 100% 96.5%, 0 100%)" }}
  >
    {o.eyebrow && <p className="text-[8px] uppercase tracking-[0.4em] text-white/65">{o.eyebrow}</p>}
    <h3 className="mt-2 font-serif text-2xl font-light uppercase leading-none tracking-[0.06em] sm:text-3xl">
      {o.title}
    </h3>
    {o.titleItalic && (
      <p className="mt-1 font-serif text-2xl font-light italic leading-none sm:text-3xl">{o.titleItalic}</p>
    )}
    <div className="mt-4 h-px w-12 origin-left bg-white/60 animate-rule-draw" />
    {o.body && <p className="mt-4 max-w-[34ch] text-[10.5px] leading-relaxed text-white/80">{o.body}</p>}
    {!!o.stats?.length && (
      <div className="mt-6 space-y-4">
        {o.stats.map((s) => (
          <div key={s.label}>
            <p className="font-serif text-2xl font-light leading-none sm:text-3xl">{s.value}</p>
            <p className="mt-1 text-[8px] uppercase tracking-[0.3em] text-white/65">{s.label}</p>
          </div>
        ))}
      </div>
    )}
  </div>
);

/**
 * Push a two-page spread onto a page list. Pads with a full-bleed plate when the
 * list length is odd so the spread always lands on a left/right pair.
 * In portrait (single-page) mode the spread collapses to one page.
 */
export function pushSpread<T extends PageLike>(
  list: T[],
  o: SpreadOptions,
  portrait?: boolean,
  padImage?: string,
): void {
  const make = (page: PageLike) => list.push(page as T);

  if (portrait) {
    make({
      key: `${o.key}-spread`,
      tone: "cover",
      render: () => (
        <div className="relative h-full w-full overflow-hidden bg-black">
          <img
            src={o.image}
            alt={o.title}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover animate-ken-burns"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/45" />
          <div className="relative flex h-full items-end p-4 text-white">
            <div className="w-full">
              <Panel o={o} />
            </div>
          </div>
        </div>
      ),
    });
    return;
  }

  if (list.length % 2 === 1) {
    const filler = padImage ?? o.image;
    make({
      key: `${o.key}-plate`,
      tone: "cover",
      render: () => (
        <div className="relative h-full w-full overflow-hidden bg-black">
          <img
            src={filler}
            alt={o.title}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover animate-ken-burns"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <p className="absolute inset-x-7 bottom-7 text-[9px] uppercase tracking-[0.4em] text-white/85">
            {o.eyebrow ?? "Plate"}
          </p>
        </div>
      ),
    });
  }

  const panelLeft = !o.invert;

  make({
    key: `${o.key}-left`,
    tone: "cover",
    render: () => (
      <Half image={o.image} side="left">
        <div className={`flex h-full items-stretch ${panelLeft ? "" : "justify-end"}`}>
          {panelLeft ? <Panel o={o} /> : null}
          {!panelLeft && o.lockup ? (
            <p className="self-end p-7 text-[8px] uppercase tracking-[0.4em] text-white/75">{o.lockup}</p>
          ) : null}
        </div>
      </Half>
    ),
  });

  make({
    key: `${o.key}-right`,
    tone: "cover",
    render: () => (
      <Half image={o.image} side="right">
        <div className="flex h-full flex-col justify-between p-7 sm:p-9">
          <div className="flex justify-end">
            {o.caption && (
              <p className="max-w-[26ch] text-right text-[9px] uppercase leading-relaxed tracking-[0.32em] text-white/80">
                {o.caption}
              </p>
            )}
          </div>
          {o.right ? <div className="min-h-0 flex-1 py-4">{o.right()}</div> : null}
          <div className="flex items-end justify-between gap-4">
            {panelLeft && o.lockup ? (
              <p className="text-[8px] uppercase tracking-[0.4em] text-white/75">{o.lockup}</p>
            ) : (
              <span />
            )}
            {!panelLeft ? <Panel o={o} /> : null}
          </div>
        </div>
      </Half>
    ),
  });
}

export default pushSpread;
