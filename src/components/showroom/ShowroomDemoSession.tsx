/**
 * Showroom demo session — when a guest is signed out, SOCIALITE in the
 * showroom signs them into the isolated investor homeowner demo account
 * (no company data, own empty contacts) so the console opens instantly.
 * A signed-in user keeps their own account untouched.
 */
import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const DEMO_EMAIL = 'investor.homeowner@wonderlandsworld.com';
const DEMO_PASS = 'Investor!2026';

export const ShowroomDemoSession: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const tried = React.useRef(false);
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    if (loading || user || tried.current) return;
    tried.current = true;
    supabase.auth.signInWithPassword({ email: DEMO_EMAIL, password: DEMO_PASS }).then(({ error }) => {
      if (error) setFailed(true);
    });
  }, [loading, user]);

  if (user) return <>{children}</>;
  if (failed) {
    return <p className="py-12 text-center text-sm text-muted-foreground">The demo account is resting right now. Sign in with your own account to try SOCIALITE.</p>;
  }
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" /> Opening the SOCIALITE demo account…
    </div>
  );
};

export default ShowroomDemoSession;
