import { useCallback, useEffect, useState } from 'react';
import { CalendarClock, Loader2, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { buildKitchenCampaignHtml, buildKitchenCampaignSubject, KITCHEN_CAMPAIGN_DEFAULTS } from '@/lib/email/kitchenCampaignTemplate';
import { buildSolarCampaignHtml, buildSolarCampaignSubject, SOLAR_CAMPAIGN_DEFAULTS } from '@/lib/email/solarCampaignTemplate';
import { buildPatioArrivalsHtml, buildPatioArrivalsSubject, PATIO_ARRIVALS_DEFAULTS } from '@/lib/email/patioArrivalsTemplate';

/**
 * Daily 10:00 (New York) campaign schedule.
 * The `daily-campaign` function sends the next active campaign in this list
 * each day, so consecutive days always get a different email. Campaign
 * panels can also save their edited version here ("Add to daily schedule").
 */

type Row = { campaign_key: string; title: string; position: number; is_active: boolean; updated_at: string };
type Send = { send_date: string; campaign_key: string; title: string | null; successful: number; failed: number; status: string };

// Default rotation — the editorial campaigns, in order.
const DEFAULTS = [
  { campaign_key: 'kitchens', title: 'Outdoor Kitchens', subject: buildKitchenCampaignSubject(KITCHEN_CAMPAIGN_DEFAULTS), html: buildKitchenCampaignHtml(KITCHEN_CAMPAIGN_DEFAULTS) },
  { campaign_key: 'solar', title: 'Wonderlands Solar', subject: buildSolarCampaignSubject(SOLAR_CAMPAIGN_DEFAULTS), html: buildSolarCampaignHtml(SOLAR_CAMPAIGN_DEFAULTS) },
  { campaign_key: 'patio-arrivals', title: 'New Arrivals — Kitchens & Saunas', subject: buildPatioArrivalsSubject(PATIO_ARRIVALS_DEFAULTS), html: buildPatioArrivalsHtml(PATIO_ARRIVALS_DEFAULTS) },
];

export async function saveToDailySchedule(campaign_key: string, title: string, subject: string, html: string, position = 99) {
  const { error } = await supabase
    .from('daily_email_rotation')
    .upsert({ campaign_key, title, subject, html, position, updated_at: new Date().toISOString() }, { onConflict: 'campaign_key' });
  return error;
}

export default function DailyCampaignSchedule() {
  const [rows, setRows] = useState<Row[]>([]);
  const [sends, setSends] = useState<Send[]>([]);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const [{ data: r }, { data: s }] = await Promise.all([
      supabase.from('daily_email_rotation').select('campaign_key,title,position,is_active,updated_at').order('position').order('campaign_key'),
      supabase.from('daily_email_sends').select('send_date,campaign_key,title,successful,failed,status').order('send_date', { ascending: false }).limit(7),
    ]);
    setRows((r as Row[]) || []);
    setSends((s as Send[]) || []);
  }, []);
  useEffect(() => { load(); }, [load]);

  const addDefaults = async () => {
    setBusy(true);
    for (const [i, d] of DEFAULTS.entries()) {
      if (rows.some(r => r.campaign_key === d.campaign_key)) continue;
      const err = await saveToDailySchedule(d.campaign_key, d.title, d.subject, d.html, i);
      if (err) { toast('Could not update the schedule'); break; }
    }
    setBusy(false);
    load();
  };

  const toggle = async (key: string, is_active: boolean) => {
    await supabase.from('daily_email_rotation').update({ is_active }).eq('campaign_key', key);
    load();
  };
  const remove = async (key: string) => {
    await supabase.from('daily_email_rotation').delete().eq('campaign_key', key);
    load();
  };

  const active = rows.filter(r => r.is_active);
  const lastKey = sends[0]?.campaign_key;
  const nextIdx = active.length ? (active.findIndex(r => r.campaign_key === lastKey) + 1) % active.length : -1;

  return (
    <Card className="bg-slate-900/60 border-slate-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-cyan-300">
          Daily Email — every day at 10:00 AM (New York)
        </CardTitle>
        <CardDescription className="text-slate-400">
          Each day, a different campaign from this list goes to all clients, in order. Clients who unsubscribed are skipped automatically.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {rows.length === 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-400">The schedule is empty, so no daily emails are going out.</p>
            <Button onClick={addDefaults} disabled={busy}>
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Start daily schedule with the editorial campaigns
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {rows.map(r => (
              <div key={r.campaign_key} className="flex items-center gap-3 rounded border border-slate-800 px-3 py-2">
                <Switch checked={r.is_active} onCheckedChange={v => toggle(r.campaign_key, v)} />
                <span className="text-sm text-slate-200">{r.title}</span>
                {active[nextIdx]?.campaign_key === r.campaign_key && <Badge variant="secondary">Next</Badge>}
                <Button size="icon" variant="ghost" className="ml-auto" onClick={() => remove(r.campaign_key)} aria-label={`Remove ${r.title}`}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {DEFAULTS.some(d => !rows.some(r => r.campaign_key === d.campaign_key)) && (
              <Button variant="outline" size="sm" onClick={addDefaults} disabled={busy}>Add missing editorial campaigns</Button>
            )}
          </div>
        )}

        {sends.length > 0 && (
          <div>
            <p className="mb-2 text-xs uppercase tracking-wider text-slate-500">Recent daily sends</p>
            {sends.map(s => (
              <div key={s.send_date} className="flex justify-between text-sm text-slate-300">
                <span>{s.send_date} · {s.title}</span>
                <span className="text-slate-500">{s.status === 'sent' ? `${s.successful} sent, ${s.failed} failed` : s.status}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
