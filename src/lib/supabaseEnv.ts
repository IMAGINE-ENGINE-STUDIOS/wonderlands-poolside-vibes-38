import { supabase } from "@/integrations/supabase/client";

/**
 * Edge-function addressing for raw fetch calls.
 *
 * The production build does NOT inline VITE_SUPABASE_URL /
 * VITE_SUPABASE_PUBLISHABLE_KEY: in the live bundle they compiled to the
 * literal string "undefined", so every raw fetch built on them went to
 * "undefined/functions/v1/..." and failed before leaving the site — the
 * main Genius chat (ai-assistant), the narrator voice, the SouthBar and
 * the project summary all died this way while supabase-js calls, which
 * use the hardcoded client config, kept working (root cause of the
 * founder's "Genius not working" report, found 2026-11-18 in the live
 * bundle). The supabase client carries the one true URL and key —
 * derive both from it, never from import.meta.env.
 */
const clientInternals = supabase as unknown as { supabaseUrl: string; supabaseKey: string };

export const SUPABASE_URL: string = clientInternals.supabaseUrl;
export const SUPABASE_ANON_KEY: string = clientInternals.supabaseKey;
export const FUNCTIONS_BASE = `${SUPABASE_URL}/functions/v1`;
