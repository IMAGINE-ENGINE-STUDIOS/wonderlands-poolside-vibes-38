/**
 * dnsCheck — self-service custom domain check for the Website Builder.
 * Reads the public A records of the bare domain and www through Google's
 * DNS-over-HTTPS service (no server needed) and compares them with the
 * Wonderlands address. Once both point here and the site is published,
 * visitors on that domain see the company site automatically
 * (TenantDomainSite + site_slug_for_domain). Imagine Engine Studios Corp.
 */
export const WONDERLANDS_IP = '185.158.133.1';

export type DnsState = 'ok' | 'missing' | 'wrong';
export interface DnsRow { host: string; label: '@' | 'www'; found: string[]; state: DnsState }
export interface DnsReport { rows: DnsRow[]; allOk: boolean; checkedAt: number }

/** Bare domain from anything the user types ("https://www.Shop.com/x" → "shop.com"). */
export const apexOf = (d: string) => d.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, '');

async function aRecords(host: string): Promise<string[]> {
  const r = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(host)}&type=A`, { headers: { accept: 'application/dns-json' } });
  if (!r.ok) throw new Error('DNS lookup unavailable');
  const j = await r.json();
  return (j.Answer || []).filter((a: any) => a.type === 1).map((a: any) => String(a.data));
}

export async function checkDomain(domain: string): Promise<DnsReport> {
  const apex = apexOf(domain);
  const rows = await Promise.all((['@', 'www'] as const).map(async (label) => {
    const host = label === '@' ? apex : `www.${apex}`;
    const found = await aRecords(host).catch(() => []);
    const state: DnsState = !found.length ? 'missing' : found.length === 1 && found[0] === WONDERLANDS_IP ? 'ok' : 'wrong';
    return { host, label, found, state };
  }));
  return { rows, allOk: rows.every((r) => r.state === 'ok'), checkedAt: Date.now() };
}

/** Where to add records at the most common domain companies. */
export const REGISTRAR_TIPS: { name: string; where: string }[] = [
  { name: 'GoDaddy', where: 'My Products → your domain → DNS → Add new record' },
  { name: 'Namecheap', where: 'Domain List → Manage → Advanced DNS → Add new record' },
  { name: 'Cloudflare', where: 'Your site → DNS → Records → Add record (turn the orange cloud off)' },
  { name: 'Squarespace / Google', where: 'Domains → your domain → DNS → Custom records' },
  { name: 'Wix / IONOS / Hostinger', where: 'Domains → Manage DNS → A records' },
];
