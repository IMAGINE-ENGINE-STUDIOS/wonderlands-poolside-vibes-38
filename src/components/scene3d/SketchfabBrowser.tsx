/**
 * Sketchfab library browser (Pool Asset Manager → Objects).
 *
 * Search is public (no key needed). Downloading a model requires the
 * user's own Sketchfab API token, which is kept only in this browser
 * (localStorage `wl_sketchfab_token`) and sent straight to Sketchfab.
 * Downloads use the GLB variant so the existing 3D loader can place it.
 */
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Download, KeyRound, Loader2 } from 'lucide-react';

const TOKEN_KEY = 'wl_sketchfab_token';
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
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '');
  const [tokenDraft, setTokenDraft] = useState('');
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

  const saveToken = () => {
    const v = tokenDraft.trim();
    if (!v) return;
    localStorage.setItem(TOKEN_KEY, v);
    setToken(v);
    setTokenDraft('');
  };

  const download = async (m: SFModel) => {
    if (!token) { setNote('Add your Sketchfab key first.'); return; }
    setBusyUid(m.uid);
    setNote(null);
    try {
      const res = await fetch(`${API}/models/${m.uid}/download`, {
        headers: { Authorization: `Token ${token}` },
      });
      if (res.status === 401 || res.status === 403) { setNote('Sketchfab rejected the key. Check it and try again.'); return; }
      const json = await res.json();
      const url: string | undefined = json?.glb?.url;
      if (!url) { setNote('This model has no single-file version. Try another one.'); return; }
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
      {!token ? (
        <div className="space-y-1.5 rounded-lg border bg-muted/30 p-2">
          <p className="flex items-center gap-1 text-[11px] font-medium"><KeyRound className="h-3 w-3" /> Sketchfab key</p>
          <div className="flex gap-1">
            <Input type="password" value={tokenDraft} onChange={(e) => setTokenDraft(e.target.value)} placeholder="Paste API token" className="h-7 text-xs" />
            <Button size="sm" className="h-7 text-xs" onClick={saveToken}>Save</Button>
          </div>
          <p className="text-[10px] text-muted-foreground">Browse freely; the key is only needed to drop a model in.</p>
        </div>
      ) : (
        <button type="button" className="text-[10px] text-muted-foreground underline" onClick={() => { localStorage.removeItem(TOKEN_KEY); setToken(''); }}>
          Change Sketchfab key
        </button>
      )}

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
