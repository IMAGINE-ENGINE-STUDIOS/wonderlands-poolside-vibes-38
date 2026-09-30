/**
 * SocialiteCloudSync
 * SOCIALITE keeps its state in localStorage under `pf_*` keys. This wrapper
 * makes that state follow the admin across computers:
 *  1. On mount it pulls every row from `socialite_state` into localStorage,
 *     then renders children (so their initial useState reads the cloud copy).
 *  2. Every 3s it diffs the `pf_*` keys and upserts changed ones.
 * Tokens (`*_token`) are never uploaded — credentials belong in server secrets.
 */
import { ReactNode, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const isSynced = (k: string) => k.startsWith("pf_") && !k.endsWith("_token");
const db = supabase as any; // table added after types were generated

export default function SocialiteCloudSync({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const last = useRef<Record<string, string>>({});

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await db.from("socialite_state").select("key,value");
        (data ?? []).forEach((r: { key: string; value: string }) => {
          if (isSynced(r.key)) { localStorage.setItem(r.key, r.value); last.current[r.key] = r.value; }
        });
      } catch { /* offline: fall back to local copy */ }
      if (alive) setReady(true);
    })();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const push = async () => {
      const rows: { key: string; value: string; updated_at: string }[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)!;
        if (!isSynced(k)) continue;
        const v = localStorage.getItem(k) ?? "";
        if (last.current[k] !== v) rows.push({ key: k, value: v, updated_at: new Date().toISOString() });
      }
      if (!rows.length) return;
      const { error } = await db.from("socialite_state").upsert(rows, { onConflict: "key" });
      if (!error) rows.forEach((r) => (last.current[r.key] = r.value));
    };
    const id = window.setInterval(push, 3000);
    window.addEventListener("beforeunload", push);
    return () => { window.clearInterval(id); window.removeEventListener("beforeunload", push); push(); };
  }, [ready]);

  if (!ready) return <div className="min-h-screen grid place-items-center bg-[#0a0a0b] text-zinc-500 text-sm">Loading SOCIALITE…</div>;
  return <>{children}</>;
}
