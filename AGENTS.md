
- SOCIALITE state (`pf_*` localStorage keys, except `*_token`) syncs to `socialite_state` via SocialiteCloudSync — why: posts/bot settings must follow the admin across computers.
- Timed SOCIALITE sends (posts/email/SMS/WhatsApp) go in `socialite_scheduled` and are sent by the `socialite-scheduler` edge function (pg_cron every 5 min); all platform posting lives in `supabase/functions/_shared/socialitePublish.ts` — why: sends must fire with the browser closed, and one publisher avoids drift.
- `/socialite` uses its own sign-in (SocialiteGate) on the shared Wonderlands auth; company sections are main_admin only — why: one account across both sites without exposing company data.
