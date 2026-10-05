/**
 * PublicCompanySite — /sites/:slug and /sites/:slug/:pageSlug.
 * The live website of a licensed company, built in Workspace → Website builder.
 * Reads ONLY the published snapshot through get_public_site (drafts never
 * leave the editor). Lead forms call submit_site_lead, which files the visitor
 * into that company's clients + CRM (account, contact, "Lead in" deal, task).
 */
import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import SiteRenderer, { type LeadInput } from '@/components/siteBuilder/SiteRenderer';
import { DEFAULT_THEME, type SiteDoc, type SiteTheme } from '@/lib/siteBuilder/model';
import { Phone, Mail, Menu, X } from 'lucide-react';

interface PublicSite {
  slug: string; title: string; theme: Partial<SiteTheme>; published: SiteDoc;
  company: { name: string; phone: string | null; email: string | null; city: string | null; state: string | null; license_number: string | null };
}

const PublicCompanySite = () => {
  const { slug = '', pageSlug = '' } = useParams();
  const [site, setSite] = useState<PublicSite | null | undefined>(undefined);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    let alive = true; setSite(undefined);
    supabase.rpc('get_public_site' as any, { _slug: slug }).then(({ data }) => {
      if (!alive) return;
      const s = data as unknown as PublicSite | null;
      setSite(s && s.published?.pages?.length ? s : null);
    });
    return () => { alive = false; };
  }, [slug]);

  const theme: SiteTheme = useMemo(() => ({ ...DEFAULT_THEME, brand: site?.company.name, ...(site?.theme ?? {}) }), [site]);
  const pages = site?.published.pages ?? [];
  const page = pages.find(p => (p.slug || '') === pageSlug) ?? (pageSlug ? null : pages[0]);
  const brand = theme.brand || site?.company.name || site?.title || '';
  const phone = theme.phone || site?.company.phone || '';
  const email = theme.email || site?.company.email || '';

  useEffect(() => {
    if (!site || !page) return;
    document.title = page === pages[0] ? brand : `${page.name} | ${brand}`;
    let m = document.querySelector('meta[name="description"]');
    if (!m) { m = document.createElement('meta'); m.setAttribute('name', 'description'); document.head.appendChild(m); }
    const hero = page.sections.find(s => s.type === 'hero');
    m.setAttribute('content', String(hero?.props.subtitle || `${brand}${site.company.city ? ` · ${site.company.city}` : ''}`).slice(0, 158));
    setMenu(false); window.scrollTo(0, 0);
  }, [site, page]); // eslint-disable-line react-hooks/exhaustive-deps

  const onLead = async (l: LeadInput) => {
    const { data, error } = await supabase.rpc('submit_site_lead' as any, { _slug: slug, _name: l.name, _email: l.email, _phone: l.phone, _message: l.message, _page: page?.name ?? null });
    const ok = !error && data === true;
    // Email the company (recipient resolved server-side). Fire-and-forget: never blocks the visitor's thank-you.
    if (ok) supabase.functions.invoke('site-lead-notify', { body: { slug, name: l.name, email: l.email, phone: l.phone, message: l.message, page: page?.name ?? null } }).catch(() => {});
    return ok;
  };

  if (site === undefined) return <div className="min-h-screen bg-background" />;
  if (!site || !page) return (
    <main className="min-h-screen flex items-center justify-center bg-background p-8 text-center">
      <div><h1 className="font-serif text-4xl text-foreground">{site ? 'Page not found' : 'This website is being updated'}</h1>
        <p className="mt-3 text-muted-foreground">{site ? <Link className="underline" to={`/sites/${slug}`}>Go to the home page</Link> : 'Please check back soon.'}</p></div>
    </main>
  );

  const href = (s: string) => s ? `/sites/${site.slug}/${s}` : `/sites/${site.slug}`;
  const H: React.CSSProperties = { fontFamily: `'${theme.headingFont}', serif` };
  const navLinks = pages.map(p => <Link key={p.id} to={href(p.slug)} style={{ fontWeight: p.id === page.id ? 700 : 500, opacity: p.id === page.id ? 1 : .75 }}>{p.name}</Link>);
  const hasForm = page.sections.some(s => s.type === 'form' && !s.style.hidden);
  const formAnchor = page.sections.find(s => s.type === 'form')?.props.anchor || 'contact';

  // Site colours are the company's own content, so inline styles are intentional.
  return (
    <div style={{ background: theme.background, color: theme.text, fontFamily: `'${theme.bodyFont}', sans-serif`, minHeight: '100vh' }}>
      <header style={{ position: 'sticky', top: 0, zIndex: 40, background: theme.background, borderBottom: '1px solid rgba(0,0,0,.08)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 24 }}>
          <Link to={href('')} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {theme.logo ? <img src={theme.logo} alt={brand} style={{ height: 40, width: 'auto' }} /> : <span style={{ ...H, fontSize: 24, fontWeight: 600 }}>{brand}</span>}
          </Link>
          {pages.length > 1 && <nav className="hidden md:flex" style={{ gap: 22, fontSize: 15 }}>{navLinks}</nav>}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 14 }}>
            {phone && <a href={`tel:${phone}`} className="hidden sm:inline-flex" style={{ alignItems: 'center', gap: 6, fontSize: 14 }}><Phone size={16} />{phone}</a>}
            {hasForm && <a href={`#${formAnchor}`} style={{ background: theme.primary, color: '#fff', borderRadius: theme.radius, padding: '10px 18px', fontWeight: 600, fontSize: 14 }}>Get a quote</a>}
            {pages.length > 1 && <button className="md:hidden" aria-label="Menu" onClick={() => setMenu(m => !m)}>{menu ? <X size={22} /> : <Menu size={22} />}</button>}
          </div>
        </div>
        {menu && <nav className="md:hidden" style={{ display: 'grid', gap: 14, padding: '8px 24px 20px', fontSize: 17 }}>{navLinks}{phone && <a href={`tel:${phone}`}>Call {phone}</a>}</nav>}
      </header>

      <SiteRenderer page={page} theme={theme} onLead={onLead} />

      <footer style={{ borderTop: '1px solid rgba(0,0,0,.08)', padding: '48px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 32, justifyContent: 'space-between', fontSize: 14 }}>
          <div><p style={{ ...H, fontSize: 22, fontWeight: 600 }}>{brand}</p>
            {(site.company.city || site.company.state) && <p style={{ opacity: .7, marginTop: 6 }}>{[site.company.city, site.company.state].filter(Boolean).join(', ')}</p>}
            {site.company.license_number && <p style={{ opacity: .7 }}>License {site.company.license_number}</p>}</div>
          <div style={{ display: 'grid', gap: 8 }}>
            {phone && <a href={`tel:${phone}`} style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Phone size={15} />{phone}</a>}
            {email && <a href={`mailto:${email}`} style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Mail size={15} />{email}</a>}
          </div>
          {pages.length > 1 && <nav style={{ display: 'grid', gap: 8 }}>{navLinks}</nav>}
        </div>
        <p style={{ maxWidth: 1280, margin: '32px auto 0', fontSize: 12, opacity: .55 }}>© {new Date().getFullYear()} {brand}</p>
      </footer>
    </div>
  );
};

export default PublicCompanySite;
