/**
 * /website-builder — standalone page for the latest Website Builder (SiteBuilder V2).
 * Opens the builder on the signed-in user's company (from company_members).
 * The builder itself lives in src/components/siteBuilder/SiteBuilder.tsx so the
 * workspace, showroom and this page always run the same latest version.
 *
 * © Imagine Engine Studios Corp. All rights reserved.
 */
import * as React from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const SiteBuilder = React.lazy(() => import('@/components/siteBuilder/SiteBuilder'));

const Busy = () => (
  <div className="flex min-h-screen items-center justify-center gap-2 text-sm text-muted-foreground">
    <Loader2 className="h-4 w-4 animate-spin" /> Opening the Website Builder…
  </div>
);

const WebsiteBuilderPage: React.FC = () => {
  const { user } = useAuth();
  const [co, setCo] = React.useState<{ id: string; name: string } | null | undefined>(undefined);

  React.useEffect(() => {
    document.title = 'Website Builder · Wonderlands World';
    if (!user) { setCo(null); return; }
    let alive = true;
    (async () => {
      const { data } = await supabase.from('company_members')
        .select('company_id, companies(name)').eq('user_id', user.id).eq('is_active', true).limit(1).maybeSingle();
      if (alive) setCo(data ? { id: data.company_id, name: (data as any).companies?.name ?? 'My company' } : null);
    })();
    return () => { alive = false; };
  }, [user]);

  if (co === undefined) return <Busy />;
  if (!co) return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <h1 className="font-serif text-4xl tracking-tight">Website Builder</h1>
      <p className="max-w-md text-sm text-muted-foreground">Sign in with a company account to build and publish your website.</p>
      <Button asChild className="rounded-none px-7 text-[10px] uppercase tracking-[0.28em]"><Link to="/auth">Sign in</Link></Button>
    </div>
  );
  return (
    <main className="min-h-screen bg-background">
      <React.Suspense fallback={<Busy />}>
        <SiteBuilder key={co.id} companyId={co.id} companyName={co.name} />
      </React.Suspense>
    </main>
  );
};

export default WebsiteBuilderPage;
