/**
 * ContractorMessagesTab — contractor's notification feed (notifications table,
 * recipient_type 'contractor'). Polls every 30s; RLS scopes rows to the owner.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

interface Note { id: string; title: string; message: string; is_read: boolean; created_at: string; }

const ContractorMessagesTab: React.FC<{ contractorId: string }> = ({ contractorId }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadOnly, setUnreadOnly] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('notifications')
      .select('id, title, message, is_read, created_at')
      .eq('recipient_type', 'contractor')
      .eq('recipient_id', contractorId)
      .order('created_at', { ascending: false })
      .limit(100);
    setNotes((data as Note[]) ?? []);
    setLoading(false);
  }, [contractorId]);

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [load]);

  const markRead = async (ids: string[]) => {
    if (!ids.length) return;
    await supabase.from('notifications').update({ is_read: true }).in('id', ids);
    setNotes((p) => p.map((n) => (ids.includes(n.id) ? { ...n, is_read: true } : n)));
  };

  const unread = notes.filter((n) => !n.is_read);
  const visible = unreadOnly ? unread : notes;

  if (loading) return <div className="h-40 rounded-xl bg-slate-200 animate-pulse" />;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
      <div className="rounded-xl border border-slate-200 bg-white min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4">
          <h3 className="font-semibold">Messages & updates {unread.length > 0 && <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">{unread.length} new</span>}</h3>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setUnreadOnly((v) => !v)}>{unreadOnly ? 'Show all' : 'Unread only'}</Button>
            <Button size="sm" variant="outline" disabled={!unread.length} onClick={() => markRead(unread.map((n) => n.id))}>Mark all read</Button>
          </div>
        </div>
        {visible.length === 0 ? (
          <p className="p-6 text-sm text-slate-600">No messages yet. Bid results and project updates appear here.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {visible.map((n) => (
              <li key={n.id} className={`p-4 ${n.is_read ? '' : 'bg-amber-50/50'}`}>
                <div className="flex flex-wrap justify-between gap-2">
                  <p className="font-medium">{n.title}</p>
                  <span className="text-xs text-slate-500">{new Date(n.created_at).toLocaleString()}</span>
                </div>
                <p className="mt-1 text-sm text-slate-700 break-words">{n.message}</p>
                {!n.is_read && <button className="mt-2 text-xs underline text-slate-700" onClick={() => markRead([n.id])}>Mark read</button>}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-5 h-fit">
        <h3 className="font-semibold mb-2">Need help?</h3>
        <p className="text-sm text-slate-700">Ricardo · Wonderlands operations</p>
        <a href="tel:+12392570637" className="block text-sm underline mt-1">+1 (239) 257-0637</a>
        <a href="mailto:wonderlandsworlds@gmail.com" className="block text-sm underline break-all">wonderlandsworlds@gmail.com</a>
      </div>
    </div>
  );
};

export default ContractorMessagesTab;
