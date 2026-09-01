import React, { useEffect, useMemo, useState } from 'react';
import { Mail, Send, Eye, Users, User, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  MILAN_DEFAULTS,
  buildMilanOfferHtml,
  buildMilanOfferSubject,
  type MilanOfferConfig,
} from '@/lib/email/milanOfferTemplate';

/**
 * MilanOfferCampaign — admin surface for the Milan Collection premium email.
 *
 * Reuses the existing `send-bulk-email` edge function (custom_subject +
 * custom_html path), so personalisation tokens ({{first_name}},
 * {{sales_rep_name}}, …) and per-client sales-rep signatures keep working.
 * No new backend is required.
 */

interface ClientRow {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
}

const fullName = (c: ClientRow) =>
  [c.first_name, c.last_name].filter(Boolean).join(' ').trim();

export default function MilanOfferCampaign() {
  const [cfg, setCfg] = useState<MilanOfferConfig>(MILAN_DEFAULTS);
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [mode, setMode] = useState<'all' | 'specific'>('all');
  const [isSending, setIsSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('clients')
        .select('id, first_name, last_name, email')
        .not('email', 'is', null)
        .order('first_name', { ascending: true });
      setClients((data as ClientRow[]) || []);
    })();
  }, []);

  const html = useMemo(() => buildMilanOfferHtml(cfg), [cfg]);
  const subject = useMemo(() => buildMilanOfferSubject(cfg), [cfg]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter(
      c => c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q),
    );
  }, [clients, search]);

  const toggleClient = (id: string) =>
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));

  const handleSend = async () => {
    if (mode === 'specific' && selectedIds.length === 0) {
      toast.error('Select at least one client');
      return;
    }
    try {
      setIsSending(true);
      const body: Record<string, unknown> = {
        custom_subject: subject,
        custom_html: html,
      };
      if (mode === 'all') body.send_to_all = true;
      else body.client_ids = selectedIds;

      const { data, error } = await supabase.functions.invoke('send-bulk-email', { body });
      if (error) throw error;
      toast.success(`${data?.successful ?? data?.sent ?? 0} sent, ${data?.failed ?? 0} failed`);
    } catch (err) {
      console.error('Milan campaign send failed', err);
      toast.error('Failed to send the campaign');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="bg-slate-900/60 border-slate-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-cyan-300">
          <Mail className="h-5 w-5" /> Milan Collection Campaign
        </CardTitle>
        <CardDescription className="text-slate-400">
          Premium turnkey offer email with What&apos;s New sections (Outdoor Kitchens, Solar).
          Personalisation and rep signatures are applied per recipient.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Offer copy */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-slate-300">Headline</Label>
            <Input
              value={cfg.headline}
              onChange={e => setCfg({ ...cfg, headline: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-300">Price</Label>
            <Input value={cfg.price} onChange={e => setCfg({ ...cfg, price: e.target.value })} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label className="text-slate-300">Subheadline</Label>
            <Input
              value={cfg.subheadline}
              onChange={e => setCfg({ ...cfg, subheadline: e.target.value })}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label className="text-slate-300">Body copy</Label>
            <Textarea
              rows={4}
              value={cfg.bodyCopy}
              onChange={e => setCfg({ ...cfg, bodyCopy: e.target.value })}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label className="text-slate-300">What&apos;s included (one per line)</Label>
            <Textarea
              rows={6}
              value={cfg.includes.join('\n')}
              onChange={e => setCfg({ ...cfg, includes: e.target.value.split('\n') })}
            />
          </div>
        </div>

        {/* Recipients */}
        <div className="space-y-3">
          <Label className="text-slate-300">Recipients</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={mode === 'all' ? 'default' : 'outline'}
              onClick={() => setMode('all')}
            >
              <Users className="mr-2 h-4 w-4" /> All customers
            </Button>
            <Button
              type="button"
              variant={mode === 'specific' ? 'default' : 'outline'}
              onClick={() => setMode('specific')}
            >
              <User className="mr-2 h-4 w-4" /> Specific customers
            </Button>
            {mode === 'specific' && (
              <Badge variant="secondary" className="self-center">
                {selectedIds.length} selected
              </Badge>
            )}
          </div>

          {mode === 'specific' && (
            <div className="space-y-2">
              <Input
                placeholder="Search by name or email…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <ScrollArea className="h-56 rounded-md border border-slate-800 p-2">
                {filtered.map(c => (
                  <label
                    key={c.id}
                    className="flex cursor-pointer items-center gap-3 rounded px-2 py-2 hover:bg-slate-800/60"
                  >
                    <Checkbox
                      checked={selectedIds.includes(c.id)}
                      onCheckedChange={() => toggleClient(c.id)}
                    />
                    <span className="text-sm text-slate-200">{fullName(c) || 'Unnamed'}</span>
                    <span className="ml-auto text-xs text-slate-500">{c.email}</span>
                  </label>
                ))}
                {filtered.length === 0 && (
                  <p className="p-4 text-sm text-slate-500">No matching customers.</p>
                )}
              </ScrollArea>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => setShowPreview(true)}>
            <Eye className="mr-2 h-4 w-4" /> Preview email
          </Button>
          <Button onClick={handleSend} disabled={isSending}>
            {isSending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            {mode === 'all' ? 'Send to all customers' : `Send to ${selectedIds.length}`}
          </Button>
        </div>
      </CardContent>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{subject}</DialogTitle>
          </DialogHeader>
          <iframe
            title="Milan email preview"
            srcDoc={html}
            className="h-[70vh] w-full rounded border border-border bg-white"
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
}
