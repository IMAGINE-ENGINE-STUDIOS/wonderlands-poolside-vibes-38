/**
 * Sketchfab library browser (Pool Asset Manager → Objects).
 *
 * Search is public. Downloads go through the `sketchfab-download` edge
 * function, which holds the platform Sketchfab key server-side, and use
 * the GLB variant so the existing 3D loader can place it.
 */
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Download, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const API = 'https://api.sketchfab.com/v3';
const QUICK = ['patio furniture', 'outdoor lounge chair', 'palm tree', 'umbrella', 'pergola', 'fire pit', 'planter', 'grill'];

interface SFModel {
  uid: string;
  name: string;
  user?: { displayName?: string };
  faceCount?: number;
  thumbnails?: { images?: { url: string; width: number }[] };
}

export interface SketchfabPick {
  name: string;
  url: string;
  uid: string;
}

export function SketchfabBrowser({ onAdd }: { onAdd: (pick: SketchfabPick) => void }) {
  const [query, setQuery] = useState('patio furniture');
  const [results, setResults] = useState<SFModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyUid, setBusyUid] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    const q = query.trim();
    if (!q) return;
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${API}/search?type=models&downloadable=true&count=24&q=${encodeURIComponent(q)}`,
          { signal: ctrl.signal },
        );
        const json = await res.json();
        setResults(json.results || []);
      } catch {
        /* aborted or offline */
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [query]);

  const download = async (m: SFModel) => {
    setBusyUid(m.uid);
    setNote(null);
    try {
      const { data, error } = await supabase.functions.invoke('sketchfab-download', { body: { uid: m.uid } });
      const url: string | undefined = data?.glb;
      if (error || !url) { setNote('This model can’t be placed. Try another one.'); return; }
      onAdd({ name: m.name, url, uid: m.uid });
      setNote(`Added “${m.name}” to the scene.`);
    } catch {
      setNote('Download failed. Try again.');
    } finally {
      setBusyUid(null);
    }
  };

  const thumb = (m: SFModel) => {
    const imgs = m.thumbnails?.images || [];
    return [...imgs].sort((a, b) => a.width - b.width).find((i) => i.width >= 200)?.url || imgs[0]?.url;
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search Sketchfab…" className="h-8 pl-7 text-xs" />
      </div>
      <div className="flex flex-wrap gap-1">
        {QUICK.map((q) => (
          <button key={q} type="button" onClick={() => setQuery(q)}
            className={`rounded-full border px-2 py-0.5 text-[10px] ${query === q ? 'border-primary bg-primary/10' : 'hover:border-primary/50'}`}>
            {q}
          </button>
        ))}
      </div>

      {note && <p className="text-[11px] text-muted-foreground">{note}</p>}

      {loading ? (
        <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {results.map((m) => (
            <div key={m.uid} className="overflow-hidden rounded-lg border">
              {thumb(m) && <img src={thumb(m)} alt={m.name} loading="lazy" className="aspect-video w-full object-cover" />}
              <div className="space-y-1 p-1.5">
                <p className="truncate text-[11px] font-medium" title={m.name}>{m.name}</p>
                <p className="truncate text-[10px] text-muted-foreground">
                  {m.user?.displayName}{m.faceCount ? ` · ${Math.round(m.faceCount / 1000)}k faces` : ''}
                </p>
                <Button size="sm" variant="outline" className="h-6 w-full text-[10px]" disabled={busyUid === m.uid} onClick={() => download(m)}>
                  {busyUid === m.uid ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Download className="mr-1 h-3 w-3" />Drop in scene</>}
                </Button>
              </div>
            </div>
          ))}
          {!results.length && <p className="col-span-2 py-4 text-center text-[11px] text-muted-foreground">No downloadable models found.</p>}
        </div>
      )}
    </div>
  );
}
