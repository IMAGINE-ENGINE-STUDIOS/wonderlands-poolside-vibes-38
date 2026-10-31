/**
 * SiteTextEditor — the inline format bar for canvas text. Double-clicking any
 * text on the Website Builder canvas makes that text editable in place
 * (contenteditable, owned by SiteBuilder) and opens this compact floating bar
 * beside it: font, size, colour, bold/italic, alignment and reset for that
 * text's own look, stored in section.props.__text[path] and rendered by
 * SiteRenderer. No pop-up card, no separate textarea — the words are typed
 * directly on the page. Imagine Engine Studios Corp.
 */
import React, { useEffect, useState } from 'react';
import { Bold, Italic, AlignLeft, AlignCenter, AlignRight, RotateCcw, Check, Minus, Plus, ChevronDown } from 'lucide-react';
import { FONTS } from '@/lib/siteBuilder/model';
import { textStyle, type TextLook } from './SiteRenderer';

interface Props { rect: DOMRect; look: TextLook; onLook: (l: TextLook) => void; onClose: () => void }

/** Curated quick colours; the native picker beside them covers everything else. */
const SWATCHES = ['#111827', '#ffffff', '#0d9488', '#2563eb', '#7c3aed', '#db2777', '#dc2626', '#f59e0b', '#16a34a', '#64748b'];
const RAINBOW = 'conic-gradient(#f87171, #facc15, #4ade80, #38bdf8, #a78bfa, #f87171)';

const SiteTextEditor: React.FC<Props> = ({ rect, look, onLook, onClose }) => {
  const [fonts, setFonts] = useState(false);
  const [colors, setColors] = useState(false);
  useEffect(() => {
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, [onClose]);

  const narrow = typeof window !== 'undefined' && window.innerWidth < 640;
  const below = rect.bottom + 8 + 56 < window.innerHeight;
  const style: React.CSSProperties = narrow
    ? { position: 'fixed', left: 12, right: 12, top: 64, zIndex: 90 }
    : { position: 'fixed', zIndex: 90, width: 'max-content', maxWidth: '94vw',
        top: below ? rect.bottom + 8 : Math.max(8, rect.top - 8 - 56),
        left: Math.max(8, Math.min(window.innerWidth - 540 - 8, rect.left)) };

  const set = (p: Partial<TextLook>) => onLook({ ...look, ...p });
  const step = (d: number) => set({ size: Math.max(8, Math.min(160, (look.size ?? 24) + d)) });
  const btn = 'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors';
  const tog = (on: boolean) => `${btn} ${on ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' : 'text-zinc-600 hover:bg-black/5 dark:text-zinc-300 dark:hover:bg-white/10'}`;
  const ghost = `${btn} text-zinc-600 hover:bg-black/5 dark:text-zinc-300 dark:hover:bg-white/10`;
  const divider = <span className="mx-0.5 h-5 w-px shrink-0 bg-black/10 dark:bg-white/15" />;
  const popCls = `sb-bar-in absolute left-0 z-10 rounded-2xl border border-black/5 bg-white/90 shadow-xl backdrop-blur-xl dark:bg-zinc-900/90 ${!narrow && !below ? 'bottom-full mb-2' : 'top-full mt-2'}`;
  const pickerValue = /^#[0-9a-f]{6}$/i.test(look.color || '') ? (look.color as string) : '#111827';

  return (
    <div id="sb-formatbar" style={style} className="select-none" onMouseDown={(e) => e.stopPropagation()}>
      <div className="sb-bar-in flex flex-wrap items-center gap-1 rounded-2xl border border-black/5 bg-white/85 px-2 py-1.5 shadow-xl backdrop-blur-xl dark:bg-zinc-900/85 sm:flex-nowrap sm:overflow-x-auto sm:rounded-full">
        <button type="button" aria-label="Font" onClick={() => { setFonts((v) => !v); setColors(false); }}
          className="flex h-8 max-w-[7.5rem] shrink-0 items-center gap-1 rounded-full px-2.5 text-[13px] text-zinc-700 transition-colors hover:bg-black/5 dark:text-zinc-200 dark:hover:bg-white/10">
          <span className="truncate" style={textStyle({ font: look.font })}>{look.font || 'Section font'}</span>
          <ChevronDown className="h-3 w-3 shrink-0 opacity-60" />
        </button>
        {divider}
        <button type="button" aria-label="Smaller" className={ghost} onClick={() => step(-2)}><Minus className="h-4 w-4" /></button>
        <span className="w-7 shrink-0 text-center text-[13px] tabular-nums text-zinc-700 dark:text-zinc-200">{look.size ?? '—'}</span>
        <button type="button" aria-label="Bigger" className={ghost} onClick={() => step(2)}><Plus className="h-4 w-4" /></button>
        {divider}
        <button type="button" aria-label="Colour" className={ghost} onClick={() => { setColors((v) => !v); setFonts(false); }}>
          <span className="h-5 w-5 rounded-full border border-black/15 dark:border-white/20" style={{ background: look.color || RAINBOW }} />
        </button>
        <button type="button" aria-label="Bold" className={tog(!!look.bold)} onClick={() => set({ bold: look.bold ? undefined : true })}><Bold className="h-4 w-4" /></button>
        <button type="button" aria-label="Italic" className={tog(!!look.italic)} onClick={() => set({ italic: look.italic ? undefined : true })}><Italic className="h-4 w-4" /></button>
        {([['left', AlignLeft], ['center', AlignCenter], ['right', AlignRight]] as const).map(([a, I]) => (
          <button key={a} type="button" aria-label={`Align ${a}`} className={tog(look.align === a)} onClick={() => set({ align: look.align === a ? undefined : a })}><I className="h-4 w-4" /></button>
        ))}
        {divider}
        <button type="button" aria-label="Reset look" className={ghost} onClick={() => { onLook({}); setFonts(false); setColors(false); }}><RotateCcw className="h-4 w-4" /></button>
        <button type="button" aria-label="Done" onClick={onClose}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-600 text-white shadow transition-colors hover:bg-teal-500"><Check className="h-4 w-4" /></button>
      </div>

      {fonts && (
        <div className={`${popCls} max-h-60 w-56 overflow-y-auto p-1.5`}>
          {['', ...FONTS].map((f) => (
            <button key={f || 'none'} type="button" onClick={() => { set({ font: f || undefined }); setFonts(false); }}
              className={`flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-base transition-colors hover:bg-black/5 dark:hover:bg-white/10 ${look.font === f || (!f && !look.font) ? 'bg-black/5 dark:bg-white/10' : ''}`}
              style={textStyle({ font: f || undefined })}>
              <span className="truncate">{f || 'Section font'}</span>
              {(look.font === f || (!f && !look.font)) && <Check className="h-3.5 w-3.5 shrink-0 opacity-60" />}
            </button>
          ))}
        </div>
      )}

      {colors && (
        <div className={`${popCls} w-[11.5rem] p-2`}>
          <div className="flex flex-wrap gap-1.5">
            {SWATCHES.map((c) => (
              <button key={c} type="button" aria-label={`Colour ${c}`} onClick={() => { set({ color: c }); setColors(false); }}
                className={`h-6 w-6 rounded-full border border-black/10 transition-transform hover:scale-110 dark:border-white/15 ${look.color?.toLowerCase() === c ? 'ring-2 ring-zinc-900 ring-offset-1 dark:ring-white' : ''}`}
                style={{ background: c }} />
            ))}
            <label aria-label="Custom colour" title="Custom colour" className="relative h-6 w-6 cursor-pointer overflow-hidden rounded-full border border-black/10 transition-transform hover:scale-110 dark:border-white/15" style={{ background: RAINBOW }}>
              <input type="color" value={pickerValue} onChange={(e) => set({ color: e.target.value })} className="absolute inset-0 cursor-pointer opacity-0" />
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
export default SiteTextEditor;
