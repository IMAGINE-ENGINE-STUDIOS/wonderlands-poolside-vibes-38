import * as React from "react";
import useParallax from "@/hooks/useParallax";

interface ToolFrameProps {
  image: string;
  name: string;
  route: string;
  /** "browser" = macOS-style window chrome, "device" = borderless slab, "plate" = thin bezel */
  chrome?: "browser" | "device" | "plate";
  tone?: "light" | "dark";
  /** aspect ratio of the shot area */
  ratio?: string;
  className?: string;
  scanline?: boolean;
  parallax?: "none" | "soft" | "normal" | "deep";
  children?: React.ReactNode;
}

/**
 * Displays a real screenshot of a Wonderlands tool inside window chrome.
 * Purely presentational; scroll motion is handled in CSS via useParallax vars.
 */
const ToolFrame = ({
  image,
  name,
  route,
  chrome = "browser",
  tone = "light",
  ratio = "16/9",
  className = "",
  scanline = false,
  parallax = "normal",
  children,
}: ToolFrameProps) => {
  const parRef = useParallax<HTMLDivElement>(parallax === "none" ? 0 : parallax === "soft" ? 0.5 : parallax === "deep" ? 1.4 : 1);
  const dark = tone === "dark";

  const parClass =
    parallax === "none" ? "" : parallax === "soft" ? "tl-par-soft" : parallax === "deep" ? "tl-par-deep" : "tl-par";

  return (
    <div
      className={`group/frame relative ${
        dark ? "border-background/15 bg-background/5" : "border-foreground/12 bg-card"
      } ${chrome === "device" ? "border-0" : "border"} overflow-hidden shadow-[0_40px_90px_-50px_hsl(var(--foreground)/0.45)] transition-[transform,box-shadow] duration-700 ease-out hover:-translate-y-1 hover:shadow-[0_60px_120px_-50px_hsl(var(--foreground)/0.55)] ${className}`}
    >
      {chrome === "browser" && (
        <div
          className={`flex items-center gap-3 border-b px-3 py-2.5 sm:px-4 ${
            dark ? "border-background/15 bg-background/5" : "border-foreground/10 bg-muted/60"
          }`}
        >
          <div className="flex shrink-0 items-center gap-1.5">
            <span className={`h-2.5 w-2.5 rounded-full ${dark ? "bg-background/35" : "bg-foreground/25"}`} />
            <span className={`h-2.5 w-2.5 rounded-full ${dark ? "bg-background/25" : "bg-foreground/15"}`} />
            <span className={`h-2.5 w-2.5 rounded-full ${dark ? "bg-background/25" : "bg-foreground/15"}`} />
          </div>
          <div
            className={`min-w-0 flex-1 truncate border px-3 py-1 font-mono text-[9px] uppercase tracking-[0.2em] sm:text-[10px] ${
              dark ? "border-background/15 text-background/50" : "border-foreground/10 text-muted-foreground"
            }`}
          >
            wonderlandsworld.com{route}
          </div>
          <span
            className={`hidden shrink-0 items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.24em] sm:flex ${
              dark ? "text-background/50" : "text-muted-foreground"
            }`}
          >
            <span className="tl-blink h-1.5 w-1.5 rounded-full bg-primary" />
            live
          </span>
        </div>
      )}

      {chrome === "plate" && (
        <div
          className={`flex items-center justify-between px-4 py-2 font-mono text-[9px] uppercase tracking-[0.3em] ${
            dark ? "text-background/45" : "text-muted-foreground"
          }`}
        >
          <span className="truncate">{name}</span>
          <span className="tl-blink shrink-0">● rec</span>
        </div>
      )}

      <div className={`relative overflow-hidden ${dark ? "bg-background/10" : "bg-muted"} ${scanline ? "tl-scanline" : ""}`}>
        <div style={{ aspectRatio: ratio }} className="w-full">
          <div ref={parRef} className={`h-full w-full ${parClass}`}>
            <img
              src={image}
              alt={`${name} — actual Wonderlands interface`}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover object-top transition-transform duration-[1600ms] ease-out group-hover/frame:scale-[1.03]"
            />
          </div>
        </div>
        {children}
      </div>
    </div>
  );
};

export default ToolFrame;
