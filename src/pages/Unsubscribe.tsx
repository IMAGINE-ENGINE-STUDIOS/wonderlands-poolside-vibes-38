import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

/** Public page linked from every marketing email footer. */
export default function Unsubscribe() {
  const [params] = useSearchParams();
  const token = params.get('t') ?? '';
  const [state, setState] = useState<'idle' | 'working' | 'done' | 'error'>('idle');

  const confirm = async () => {
    setState('working');
    const { data, error } = await supabase.functions.invoke('unsubscribe', { body: { token } });
    setState(!error && data?.success ? 'done' : 'error');
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-md text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Wonderlands World</p>
        {state === 'done' ? (
          <>
            <h1 className="mt-4 font-serif text-3xl text-foreground">You're unsubscribed</h1>
            <p className="mt-3 text-muted-foreground">You won't receive our marketing emails anymore.</p>
          </>
        ) : (
          <>
            <h1 className="mt-4 font-serif text-3xl text-foreground">Unsubscribe from our emails?</h1>
            <p className="mt-3 text-muted-foreground">
              You'll stop receiving our daily editions and offers.
            </p>
            {state === 'error' && (
              <p className="mt-3 text-sm text-muted-foreground">This link isn't valid anymore. Please contact us and we'll remove you.</p>
            )}
            <Button className="mt-6" onClick={confirm} disabled={!token || state === 'working'}>
              {state === 'working' ? 'Unsubscribing…' : 'Unsubscribe'}
            </Button>
          </>
        )}
        <div className="mt-8"><Link to="/" className="text-sm text-muted-foreground underline">Back to the website</Link></div>
      </div>
    </main>
  );
}
