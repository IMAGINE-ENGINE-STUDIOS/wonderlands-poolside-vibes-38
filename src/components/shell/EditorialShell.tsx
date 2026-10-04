/**
 * EditorialShell — shared layout for the three dashboards (Command Center,
 * Company workspace, Customer account). Home-page / FLIP look: cover band,
 * numbered "table of contents" rail, glass panels. Theme tokens only.
 * `tone="ink"` renders the dark Command Center variant; default is light.
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export interface Chapter { key: string; label: string; group?: string }

interface Props {
  tone?: 'light' | 'ink';
  eyebrow: string;
  title: string;
  subtitle?: string;
  chapters: Chapter[];
  active: string;
  onSelect: (key: string) => void;
  actions?: React.ReactNode;
  banner?: React.ReactNode;
  children: React.ReactNode;
}

const EditorialShell: React.FC<Props> = ({ tone = 'light', eyebrow, title, subtitle, chapters, active, onSelect, actions, banner, children }) => {
  const [open, setOpen] = useState(false);
  const groups: { name: string; items: (Chapter & { n: number })[] }[] = [];
  chapters.forEach((c, i) => {
    const name = c.group ?? '';
    let g = groups.find(x => x.name === name);
    if (!g) { g = { name, items: [] }; groups.push(g); }
    g.items.push({ ...c, n: i + 1 });
  });

  const rail = (
    <nav className="flex flex-col gap-6" aria-label="Chapters">
      {groups.map(g => (
        <div key={g.name}>
          {g.name && <p className="px-3 mb-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-semibold font-[Sora]">{g.name}</p>}
          <ul className="space-y-0.5">
            {g.items.map(c => {
              const on = c.key === active;
              return (
                <li key={c.key}>
                  <button
                    onClick={() => { onSelect(c.key); setOpen(false); }}
                    className={`w-full flex items-baseline gap-3 rounded-lg px-3 py-2 text-left transition-colors ${on ? 'bg-teal/10 text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'}`}
                  >
                    <span className={`text-[11px] tabular-nums font-[Sora] ${on ? 'text-coral' : ''}`}>{String(c.n).padStart(2, '0')}</span>
                    <span className="text-sm font-medium truncate">{c.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <div className={`${tone === 'ink' ? 'dark' : ''} min-h-screen bg-background text-foreground font-[Manrope]`}>
      {/* Cover band */}
      <header className="relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute -top-32 -left-24 h-80 w-80 rounded-full bg-teal/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 right-0 h-80 w-96 rounded-full bg-coral/15 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-8 py-8 sm:py-12">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <Link to="/" className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground font-[Sora]">Wonderlands</Link>
              <p className="mt-4 text-[11px] uppercase tracking-[0.25em] text-coral font-semibold font-[Sora]">{eyebrow}</p>
              <h1 className="mt-2 text-3xl sm:text-5xl font-semibold tracking-tight font-[Sora] break-words">{title}</h1>
              {subtitle && <p className="mt-3 max-w-2xl text-sm sm:text-base text-muted-foreground">{subtitle}</p>}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {actions}
              <button className="lg:hidden rounded-lg border border-border p-2" onClick={() => setOpen(true)} aria-label="Open chapters"><Menu className="h-5 w-5" /></button>
            </div>
          </div>
        </div>
      </header>
      {banner}

      <div className="mx-auto max-w-7xl px-4 sm:px-8 py-8 flex gap-8">
        <aside className="hidden lg:block w-60 shrink-0">
          <div className="sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto pr-2">{rail}</div>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>

      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex items-end bg-background/70 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="max-h-[80vh] w-full overflow-y-auto rounded-t-2xl border-t border-border bg-card p-5" onClick={e => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground font-[Sora]">Contents</p>
              <button onClick={() => setOpen(false)} aria-label="Close"><X className="h-5 w-5" /></button>
            </div>
            {rail}
          </div>
        </div>
      )}
    </div>
  );
};

export const Panel: React.FC<{ title?: string; kicker?: string; children: React.ReactNode; className?: string }> = ({ title, kicker, children, className = '' }) => (
  <section className={`rounded-2xl border border-border bg-card/80 backdrop-blur-xl p-5 sm:p-6 ${className}`}>
    {kicker && <p className="text-[10px] uppercase tracking-[0.25em] text-coral font-semibold font-[Sora]">{kicker}</p>}
    {title && <h2 className="mt-1 mb-4 text-xl font-semibold tracking-tight font-[Sora]">{title}</h2>}
    {children}
  </section>
);

export const StatTile: React.FC<{ label: string; value: React.ReactNode; hint?: string; onClick?: () => void }> = ({ label, value, hint, onClick }) => (
  <button onClick={onClick} disabled={!onClick} className="text-left rounded-2xl border border-border bg-card/80 p-5 transition-colors enabled:hover:border-teal disabled:cursor-default">
    <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground font-[Sora]">{label}</p>
    <p className="mt-2 text-3xl font-light tabular-nums font-[Sora]">{value}</p>
    {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
  </button>
);

export const EmptyState: React.FC<{ title: string; body?: string; action?: React.ReactNode }> = ({ title, body, action }) => (
  <div className="rounded-2xl border border-dashed border-border p-8 text-center">
    <p className="font-semibold font-[Sora]">{title}</p>
    {body && <p className="mt-1 text-sm text-muted-foreground">{body}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export const Skeleton: React.FC<{ h?: string }> = ({ h = 'h-24' }) => <div className={`${h} rounded-2xl bg-muted animate-pulse`} />;

export const money = (n: number | null | undefined) =>
  (n ?? 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export default EditorialShell;
