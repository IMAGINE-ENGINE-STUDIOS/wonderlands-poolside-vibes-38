/**
 * SubcontractorPaywall — the join panel shown in CompanyWorkspace when a
 * business has not joined the Subcontractor Network yet, or when its
 * membership is no longer active. Payment is $50 to set up the profile
 * plus $150 per month, through the subcontractor-billing edge function.
 */
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Panel } from '@/components/shell/EditorialShell';
import { useToast } from '@/hooks/use-toast';

export interface SubcontractorMembership {
  status: string;
  setup_paid?: boolean;
  current_period_end?: string | null;
}

export const isSubcontractorActive = (m: SubcontractorMembership | null | undefined) =>
  !!m && (m.status === 'active' || m.status === 'trialing');

const SubcontractorPaywall: React.FC<{ membership: SubcontractorMembership | null }> = ({ membership }) => {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const lapsed = !!membership && membership.status !== 'inactive';

  const join = async () => {
    setBusy(true);
    const { data, error } = await supabase.functions.invoke('subcontractor-billing', {
      body: { action: 'checkout', return_url: `${window.location.origin}/workspace` },
    });
    setBusy(false);
    if (error || !data?.url) {
      toast({ title: 'Could not start checkout', description: 'Please try again in a moment.' });
      return;
    }
    window.location.assign(data.url as string);
  };

  return (
    <Panel kicker="Projects" title="Join the Subcontractor Network">
      {lapsed && (
        <p className="text-sm text-muted-foreground mb-4">
          {membership.status === 'past_due'
            ? 'Your membership payment is past due, so bidding is paused until the membership is active again.'
            : 'Your membership has ended, so bidding is paused. You can rejoin below to keep getting jobs.'}
        </p>
      )}
      <p className="text-sm text-muted-foreground mb-4">
        Wonderlands posts pool and outdoor living jobs by trade in its procurement solution. Members bid on those jobs and take work directly through procurement, with the project slides, the bidding and the project chat in one place.
      </p>
      <p className="text-sm text-muted-foreground mb-4">
        Setting up your profile costs 50 dollars once. Membership is then 150 dollars per month to keep getting jobs. Your first payment is 200 dollars, and then 150 dollars per month.
      </p>
      <Button onClick={join} disabled={busy}>{busy ? 'Opening checkout…' : lapsed ? 'Rejoin the Subcontractor Network' : 'Set up my profile and pay'}</Button>
    </Panel>
  );
};

export default SubcontractorPaywall;
