/** Command Center "Data Room": every investor NDA signature (main admins only via RLS). */
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

type Sig = { id: string; first_name: string; last_name: string; email: string; nda_version: string; signature: string; signed_at: string; user_agent: string | null };

export default function AdminDataRoom() {
  const [rows, setRows] = useState<Sig[] | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    supabase.from('investor_nda_signatures').select('*').order('signed_at', { ascending: false })
      .then(({ data }) => setRows((data as Sig[]) ?? []));
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <p className="text-[10px] uppercase tracking-[0.4em] text-neutral-500">Investors</p>
        <h2 className="mt-1 font-serif text-3xl font-light text-black">Data Room — NDA signatures</h2>
        <p className="text-sm text-neutral-600">{rows ? `${rows.length} signed` : 'Loading…'}</p>
      </div>
      <div className="overflow-x-auto border border-neutral-200 bg-white">
        <table className="w-full text-sm text-black">
          <thead className="border-b border-neutral-200 text-left text-[10px] uppercase tracking-[0.25em] text-neutral-500">
            <tr><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Signed</th><th className="p-3">NDA version</th><th className="p-3">Device</th><th className="p-3">Signature</th></tr>
          </thead>
          <tbody>
            {rows?.map((r) => (
              <tr key={r.id} className="border-b border-neutral-100 align-top">
                <td className="p-3">{r.first_name} {r.last_name}</td>
                <td className="p-3"><a className="hover:underline" href={`mailto:${r.email}`}>{r.email}</a></td>
                <td className="p-3 whitespace-nowrap">{new Date(r.signed_at).toLocaleString()}</td>
                <td className="p-3">{r.nda_version}</td>
                <td className="p-3 max-w-[220px] truncate text-xs text-neutral-500" title={r.user_agent ?? ''}>{r.user_agent ?? '—'}</td>
                <td className="p-3">
                  {r.signature?.startsWith('data:image')
                    ? <button type="button" onClick={() => setOpen(open === r.id ? null : r.id)}>
                        <img src={r.signature} alt={`Signature of ${r.first_name}`} loading="lazy" className={`${open === r.id ? 'h-32' : 'h-10'} border border-neutral-200 bg-white`} />
                      </button>
                    : <span className="font-serif italic">{r.signature}</span>}
                </td>
              </tr>
            ))}
            {rows?.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-neutral-500">No signatures yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
