/**
 * SiteTextEditor — floating text editor opened by double-clicking any text on
 * the Website Builder canvas. Edits the words and that text's own look
 * (font from the gallery, size, colour, bold/italic, alignment), stored in
 * section.props.__text[path] and rendered by SiteRenderer. Imagine Engine Studios Corp.
 */
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Bold, Italic, AlignLeft, AlignCenter, AlignRight, RotateCcw } from 'lucide-react';
import { FONTS } from '@/lib/siteBuilder/model';
import { textStyle, type TextLook } from './SiteRenderer';

interface Props { rect: DOMRect; value: string; look: TextLook; onChange: (v: string) => void; onLook: (l: TextLook) => void; onClose: () => void }

const SiteTextEditor: React.FC<Props> = ({ rect, value, look, onChange, onLook, onClose }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [fonts, setFonts] = useState(false);
  useEffect(() => {
    const down = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    const t = setTimeout(() => document.addEventListener('mousedown', down), 0);
    document.addEventListener('keydown', key);
    return () => { clearTimeout(t); document.removeEventListener('mousedown', down); document.removeEventListener('keydown', key); };
  }, [onClose]);
  const W = 360; const left = Math.max(8, Math.min(window.innerWidth - W - 8, rect.left));
  const below = rect.bottom + 8 + 300 < window.innerHeight; const top = below ? rect.bottom + 8 : Math.max(8, rect.top - 308);
  const set = (p: Partial<TextLook>) => onLook({ ...look, ...p });
  const tog = (on: boolean) => `h-8 w-8 inline-flex items-center justify-center rounded-md border ${on ? 'border-teal bg-muted' : 'border-border'}`;

  return <div ref={ref} style={{ position: 'fixed', left, top, width: W, zIndex: 80 }} className="rounded-xl border border-border bg-background p-3 shadow-xl space-y-2 select-none" onClick={(e) => e.stopPropagation()}>
    <Textarea autoFocus rows={3} value={value} onChange={(e) => onChange(e.target.value)} className="text-sm" />
    <div className="flex items-center gap-1.5">
      <button type="button" onClick={() => setFonts((v) => !v)} className="h-8 flex-1 truncate rounded-md border border-border px-2 text-left text-sm" style={textStyle({ font: look.font })}>{look.font || 'Section font'}</button>
      <input aria-label="Size" type="number" min={8} max={160} value={look.size ?? ''} placeholder="Size" onChange={(e) => set({ size: e.target.value ? Number(e.target.value) : undefined })} className="h-8 w-16 rounded-md border border-border bg-background px-2 text-sm" />
      <input aria-label="Colour" type="color" value={look.color || '#0a0a0a'} onChange={(e) => set({ color: e.target.value })} className="h-8 w-9 rounded-md border border-border bg-background p-0.5" />
    </div>
    {fonts && <div className="max-h-44 overflow-y-auto rounded-md border border-border">{['', ...FONTS].map((f) => <button key={f || 'none'} type="button" onClick={() => { set({ font: f || undefined }); setFonts(false); }}
      className={`block w-full px-3 py-1.5 text-left text-base hover:bg-muted ${look.font === f ? 'bg-muted' : ''}`} style={textStyle({ font: f || undefined })}>{f || 'Section font'}</button>)}</div>}
    <div className="flex items-center gap-1.5">
      <button type="button" aria-label="Bold" className={tog(!!look.bold)} onClick={() => set({ bold: !look.bold })}><Bold className="h-4 w-4" /></button>
      <button type="button" aria-label="Italic" className={tog(!!look.italic)} onClick={() => set({ italic: !look.italic })}><Italic className="h-4 w-4" /></button>
      {([['left', AlignLeft], ['center', AlignCenter], ['right', AlignRight]] as const).map(([a, I]) => <button key={a} type="button" aria-label={`Align ${a}`} className={tog(look.align === a)} onClick={() => set({ align: look.align === a ? undefined : a })}><I className="h-4 w-4" /></button>)}
      <button type="button" aria-label="Reset look" className={tog(false)} onClick={() => onLook({})}><RotateCcw className="h-4 w-4" /></button>
      <Button size="sm" className="ml-auto" onClick={onClose}>Done</Button>
    </div>
  </div>;
};
export default SiteTextEditor;
