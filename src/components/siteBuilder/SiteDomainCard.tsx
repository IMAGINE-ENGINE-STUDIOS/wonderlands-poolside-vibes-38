/**
 * SiteDomainCard — self-service web address for a company site (top of the
 * Site tab). Shows the free /sites/<slug> address, saves the company's own
 * domain, checks its DNS live (lib/siteBuilder/dnsCheck) and shows exactly
 * which records to add with one-click copy. No email to Wonderlands needed:
 * once the records point here and the site is published, the domain serves
 * the site automatically. Imagine Engine Studios Corp.
 */
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, ExternalLink, RefreshCw } from 'lucide-react';
import { WONDERLANDS_IP, REGISTRAR_TIPS, apexOf, checkDomain, type DnsReport } from '@/lib/siteBuilder/dnsCheck';

interface Props {
  slug?: string; published: boolean; saved?: string | null; domain: string; readOnly?: boolean;
  setDomain: (v: string) => void; onSave: () => Promise<void> | void; onSlug: (v: string) => void;
}

const copy = (t: string) => navigator.clipboard?.writeText(t).catch(() => {});

const SiteDomainCard: React.FC<Props> = ({ slug, published, saved, domain, readOnly, setDomain, onSave, onSlug }) => {
  const [rep, setRep] = useState<DnsReport | null>(null);
  const [busy, setBusy] = useState(false);
  const [tips, setTips] = useState(false);
  const run = async (d = saved) => { if (!d) return; setBusy(true); try { setRep(await checkDomain(d)); } catch { setRep(null); } setBusy(false); };
  useEffect(() => { setRep(null); if (saved) run(saved); }, [saved]); // eslint-disable-line react-hooks/exhaustive-deps
  // Re-check every 60 s while records are still propagating.
  useEffect(() => { if (!saved || !rep || rep.allOk) return; const t = setInterval(() => run(saved), 60000); return () => clearInterval(t); }, [saved, rep]); // eslint-disable-line react-hooks/exhaustive-deps

  const free = slug ? `${window.location.origin}/sites/${slug}` : '';
  const status = !saved ? null : busy && !rep ? { t: 'Checking…', c: 'bg-muted text-foreground' }
    : rep?.allOk ? (published ? { t: 'Live — your domain is connected', c: 'bg-teal/15 text-foreground' } : { t: 'Connected — press Publish to go live', c: 'bg-teal/15 text-foreground' })
    : rep?.rows.some((r) => r.state === 'wrong') ? { t: 'Action needed — a record points elsewhere', c: 'bg-coral/15 text-foreground' }
    : { t: 'Waiting for your records (can take up to 24 h)', c: 'bg-muted text-foreground' };

  return <div className="space-y-3">
    <div className="space-y-1">
      <span className="text-xs font-medium text-muted-foreground">Free address</span>
      {slug ? <div className="flex items-center gap-1.5">
        <span className="shrink-0 text-xs text-muted-foreground">/sites/</span>
        <Input disabled={readOnly} defaultValue={slug} key={slug} onBlur={(e) => onSlug(e.target.value)} className="h-8 text-sm" />
        <button aria-label="Copy address" onClick={() => copy(free)} className="h-8 w-8 shrink-0 inline-flex items-center justify-center rounded-md border border-border"><Copy className="h-3.5 w-3.5" /></button>
        <a aria-label="Open" href={free} target="_blank" rel="noreferrer" className="h-8 w-8 shrink-0 inline-flex items-center justify-center rounded-md border border-border"><ExternalLink className="h-3.5 w-3.5" /></a>
      </div> : <p className="text-xs text-muted-foreground">Press Save draft once to get your address.</p>}
    </div>

    <div className="space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">Your own domain</span>
      <div className="flex gap-2"><Input disabled={readOnly} placeholder="mybusiness.com" value={domain} onChange={(e) => setDomain(e.target.value)} className="h-9" />
        <Button size="sm" disabled={readOnly} onClick={() => onSave()}>Save</Button></div>
      {status && <div className={`flex items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium ${status.c}`}>
        <span>{status.t}</span><button aria-label="Check again" disabled={busy} onClick={() => run()} className="inline-flex items-center gap-1 opacity-80 hover:opacity-100"><RefreshCw className={`h-3.5 w-3.5 ${busy ? 'animate-spin' : ''}`} />Check</button></div>}
    </div>

    {saved && <div className="space-y-2">
      <p className="text-xs text-muted-foreground">At your domain company, add these two records (remove any other A records for @ and www). Security (https) is switched on automatically.</p>
      <div className="rounded-md border border-border divide-y divide-border text-xs">
        <div className="grid grid-cols-[34px_44px_1fr_28px] gap-1 px-2 py-1.5 font-semibold text-muted-foreground"><span>Type</span><span>Name</span><span>Value</span><span /></div>
        {(['@', 'www'] as const).map((l) => { const r = rep?.rows.find((x) => x.label === l); return <div key={l} className="grid grid-cols-[34px_44px_1fr_28px] items-center gap-1 px-2 py-1.5">
          <span className="font-mono">A</span><span className="font-mono">{l}</span>
          <span className="min-w-0"><span className="font-mono">{WONDERLANDS_IP}</span>
            {r && <span className="block truncate text-[10px] text-muted-foreground">{r.state === 'ok' ? 'Found ✓' : r.state === 'missing' ? 'Not found yet' : `Now points to ${r.found.join(', ')}`}</span>}</span>
          <button aria-label={`Copy ${l} value`} onClick={() => copy(WONDERLANDS_IP)} className="h-6 w-6 inline-flex items-center justify-center rounded border border-border"><Copy className="h-3 w-3" /></button>
        </div>; })}
      </div>
      <button onClick={() => setTips((v) => !v)} className="text-xs font-medium underline underline-offset-2">{tips ? 'Hide' : 'Where do I add these?'}</button>
      {tips && <ul className="space-y-1 text-xs text-muted-foreground">{REGISTRAR_TIPS.map((t) => <li key={t.name}><span className="font-medium text-foreground">{t.name}:</span> {t.where}</li>)}</ul>}
      <p className="text-[11px] text-muted-foreground">Both {apexOf(saved)} and www.{apexOf(saved)} will open your published site.</p>
    </div>}
  </div>;
};
export default SiteDomainCard;
