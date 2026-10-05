/**
 * TenantDomainSite — served when the app is opened on a company's own domain
 * (company_sites.custom_domain). Resolves the host to the site slug through the
 * site_slug_for_domain RPC (published sites only) and renders PublicCompanySite
 * with clean /page links. No Wonderlands navigation or assistant is mounted.
 */
import React, { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import PublicCompanySite from './PublicCompanySite';

const TenantDomainSite = () => {
  const [slug, setSlug] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    supabase.rpc('site_slug_for_domain' as any, { _host: window.location.hostname }).then(({ data }) => setSlug((data as string) || null));
  }, []);
  if (slug === undefined) return <div className="min-h-screen bg-background" />;
  if (!slug) return <main className="min-h-screen flex items-center justify-center p-8 text-center"><h1 className="font-serif text-4xl">This website is being set up</h1></main>;
  return <Routes>
    <Route path="/" element={<PublicCompanySite domainSlug={slug} />} />
    <Route path="/:pageSlug" element={<PublicCompanySite domainSlug={slug} />} />
  </Routes>;
};
export default TenantDomainSite;
