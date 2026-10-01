/**
 * Pro-style chromatic circle for the Flip Builder palette controller.
 * Hue = angle, saturation = distance from centre, plus a lightness slider and
 * a hex field. Pure CSS (conic + radial gradients) — no canvas, no deps.
 */
import * as React from "react";

const hexToHsl = (hex: string): [number, number, number] => {
  const m = hex.replace("#", "").match(/^([0-9a-f]{6})$/i);
  if (!m) return [0, 0, 50];
  const n = parseInt(m[1], 16);
  const r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l * 100];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s * 100, l * 100];
};

const hslToHex = (h: number, s: number, l: number) => {
  s /= 100; l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))));
  return `#${[f(0), f(8), f(4)].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
};

const SIZE = 196;

const FlipColorWheel: React.FC<{ value: string; onChange: (hex: string) => void }> = ({ value, onChange }) => {
  const [h, s, l] = hexToHsl(value);
  const [hex, setHex] = React.useState(value);
  React.useEffect(() => setHex(value), [value]);
  const ref = React.useRef<HTMLDivElement>(null);

  const pick = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
    const hue = ((Math.atan2(x, -y) * 180) / Math.PI + 360) % 360;
    const sat = Math.min(100, (Math.hypot(x, y) / (r.width / 2)) * 100);
    onChange(hslToHex(hue, sat, l));
  };

  const rad = ((h - 90) * Math.PI) / 180;
  const dist = (s / 100) * (SIZE / 2);

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        ref={ref}
        role="slider"
        aria-label="Colour wheel"
        aria-valuenow={Math.round(h)}
        onPointerDown={(e) => { (e.target as HTMLElement).setPointerCapture(e.pointerId); pick(e); }}
        onPointerMove={(e) => e.buttons === 1 && pick(e)}
        className="relative cursor-crosshair rounded-full touch-none"
        style={{
          width: SIZE, height: SIZE,
          background: `radial-gradient(circle, hsl(0 0% ${l}%) 0%, transparent 70%), conic-gradient(from 0deg, hsl(0 100% ${l}%), hsl(60 100% ${l}%), hsl(120 100% ${l}%), hsl(180 100% ${l}%), hsl(240 100% ${l}%), hsl(300 100% ${l}%), hsl(360 100% ${l}%))`,
          boxShadow: "inset 0 0 0 1px rgba(0,0,0,.15)",
        }}
      >
        <span
          className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
          style={{ left: SIZE / 2 + Math.cos(rad) * dist, top: SIZE / 2 + Math.sin(rad) * dist, background: value, borderColor: l > 60 ? "#000" : "#fff" }}
        />
      </div>
      <input
        type="range" min={0} max={100} value={Math.round(l)} aria-label="Lightness"
        onChange={(e) => onChange(hslToHex(h, s, Number(e.target.value)))}
        className="w-full"
        style={{ accentColor: value }}
      />
      <div className="flex w-full items-center gap-2">
        <span className="h-8 w-8 shrink-0 border border-border/60" style={{ background: value }} />
        <input
          value={hex}
          onChange={(e) => { setHex(e.target.value); if (/^#[0-9a-f]{6}$/i.test(e.target.value)) onChange(e.target.value.toLowerCase()); }}
          className="w-full border border-border/60 bg-background px-2 py-1.5 font-mono text-[12px] text-foreground"
          aria-label="Hex colour"
        />
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} aria-label="System picker" className="h-8 w-8 shrink-0 cursor-pointer border-0 bg-transparent p-0" />
      </div>
    </div>
  );
};

export default FlipColorWheel;
