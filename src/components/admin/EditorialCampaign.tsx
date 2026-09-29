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

/**
 * EditorialCampaign — shared admin panel for magazine-style email campaigns
 * (New Arrivals, Solar, …). Each campaign supplies its defaults, editable
 * text fields and HTML/subject builders; this panel handles editing, preview,
 * recipient choice (all clients / specific) and sending through the existing
 * `send-bulk-email` function, which fills {{first_name}} and rep signatures.
 */

interface ClientRow { id: string; first_name: string | null; last_name: string | null; email: string | null }
const fullName = (c: ClientRow) => [c.first_name, c.last_name].filter(Boolean).join(' ').trim();

export interface EditorialField<C> { key: keyof C & string; label: string; rows?: number }

interface Props<C> {
  title: string;
  description: string;
  defaults: C;
  fields: EditorialField<C>[];
  buildHtml: (cfg: C) => string;
  buildSubject: (cfg: C) => string;
}

export default function EditorialCampaign<C extends object>({
  title, description, defaults, fields, buildHtml, buildSubject,
}: Props<C>) {
  const [cfg, setCfg] = useState<C>(defaults);
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [mode, setMode] = useState<'all' | 'specific'>('all');
  const [isSending, setIsSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    supabase
      .from('clients')
      .select('id, first_name, last_name, email')
      .not('email', 'is', null)
      .order('first_name', { ascending: true })
      .then(({ data }) => setClients((data as ClientRow[]) || []));
  }, []);

  const html = useMemo(() => buildHtml(cfg), [cfg, buildHtml]);
  const subject = useMemo(() => buildSubject(cfg), [cfg, buildSubject]);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? clients.filter(c => fullName(c).toLowerCase().includes(q) || c.email?.toLowerCase().includes(q)) : clients;
  }, [clients, search]);

  const toggle = (id: string) =>
    setSelectedIds(p => (p.includes(id) ? p.filter(x => x !== id) : [...p, id]));

  const handleSend = async () => {
    if (mode === 'specific' && selectedIds.length === 0) return toast('Select at least one client');
    if (mode === 'all' && !window.confirm(`Send "${title}" to all ${clients.length} clients?`)) return;
    try {
      setIsSending(true);
      const body: Record<string, unknown> = { custom_subject: subject, custom_html: html };
      if (mode === 'all') body.send_to_all = true;
      else body.client_ids = selectedIds;
      const { data, error } = await supabase.functions.invoke('send-bulk-email', { body });
      if (error) throw error;
      toast.success(`${data?.successful ?? data?.sent ?? 0} sent, ${data?.failed ?? 0} failed`);
    } catch (err) {
      console.error(`${title} send failed`, err);
      toast('The campaign could not be sent — please try again');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="bg-slate-900/60 border-slate-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-cyan-300">
          <Mail className="h-5 w-5" /> {title}
        </CardTitle>
        <CardDescription className="text-slate-400">{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          {fields.map(f => (
            <div key={f.key} className={`space-y-2 ${f.rows ? 'md:col-span-2' : ''}`}>
              <Label className="text-slate-300">{f.label}</Label>
              {f.rows ? (
                <Textarea rows={f.rows} value={String((cfg[f.key] as unknown) ?? "")} />
              ) : (
                <Input value={String((cfg[f.key] as unknown) ?? "")} />
              )}
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <Label className="text-slate-300">Recipients</Label>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant={mode === 'all' ? 'default' : 'outline'} onClick={() => setMode('all')}>
              <Users className="mr-2 h-4 w-4" /> All clients ({clients.length})
            </Button>
            <Button type="button" variant={mode === 'specific' ? 'default' : 'outline'} onClick={() => setMode('specific')}>
              <User className="mr-2 h-4 w-4" /> Specific clients
            </Button>
            {mode === 'specific' && <Badge variant="secondary" className="self-center">{selectedIds.length} selected</Badge>}
          </div>
          {mode === 'specific' && (
            <div className="space-y-2">
              <Input placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)} />
              <ScrollArea className="h-56 rounded-md border border-slate-800 p-2">
                {filtered.map(c => (
                  <label key={c.id} className="flex cursor-pointer items-center gap-3 rounded px-2 py-2 hover:bg-slate-800/60">
                    <Checkbox checked={selectedIds.includes(c.id)} onCheckedChange={() => toggle(c.id)} />
                    <span className="text-sm text-slate-200">{fullName(c) || 'Unnamed'}</span>
                    <span className="ml-auto text-xs text-slate-500">{c.email}</span>
                  </label>
                ))}
                {filtered.length === 0 && <p className="p-4 text-sm text-slate-500">No matching clients.</p>}
              </ScrollArea>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => setShowPreview(true)}>
            <Eye className="mr-2 h-4 w-4" /> Preview email
          </Button>
          <Button onClick={handleSend} disabled={isSending}>
            {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            {mode === 'all' ? 'Send to all clients' : `Send to ${selectedIds.length}`}
          </Button>
        </div>
      </CardContent>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>{subject}</DialogTitle></DialogHeader>
          <iframe title={`${title} preview`} srcDoc={html} className="h-[70vh] w-full rounded border border-border bg-white" />
        </DialogContent>
      </Dialog>
    </Card>
  );
}
