# SOCIALITE Shield — platform-safe sending rules

Goal: stop any user (app or API) from doing anything that could get our Meta, X, TikTok, YouTube, Threads, Twilio or Resend accounts blocked. Users are warned in plain words, risky actions are blocked, and repeat offenders are flagged for the admin to decide.

## What users will see
- Before posting, scheduling or sending, Shield checks the content and volume.
- **Warning** (yellow card): e.g. "Too many hashtags for Instagram (max 30)", "This looks like the same post you sent 10 minutes ago", "Links-only message". The user can fix it or continue.
- **Blocked** (clear card, no red error): e.g. "Daily Instagram limit reached (25 posts)", "Banned phrase: 'guaranteed income'", "SMS missing STOP opt-out", "Contact list over the batch limit". The action does not go out.
- A short "Why" line and "How to fix" line for every rule.
- A new **Shield** tab in Settings lists all rules and the user's own warnings in the last 30 days.

## Rules (built in, same for app, scheduler and API)
- Per-platform daily/hourly caps (Instagram 25/day, Facebook 25/day, X 50/day, Threads 50/day, TikTok 15/day, YouTube 6/day).
- Minimum gap between posts per platform (e.g. 10 min).
- Duplicate detection: same/near-identical text to same platform within 24h is blocked.
- Hashtag and mention limits (IG 30 / X 5 / TikTok 10 hashtags; max 10 mentions).
- Banned spam phrases and categories (get-rich, crypto giveaways, adult, weapons, fake followers, misleading health claims) plus link-shortener-only posts.
- Email: must include unsubscribe link (auto-added), no all-caps subjects, recipient batch caps, hourly cap.
- SMS/WhatsApp: STOP opt-out required (auto-appended), quiet hours 9pm–8am recipient time, batch caps, no URL shorteners, only contacts with consent.
- Bounce/fail spike: if >20% of a send fails, further sends pause for 1 hour.
- Admin-adjustable limits (admin can change numbers, turn rules on/off).

## Flags and admin decisions
- Every block is recorded. 3 blocks in 24h, or any severe rule (spam phrase, mass duplicate), creates a **flag** on the user.
- New admin **Shield** screen in Socialite Admin: list of flagged users, what they tried, counts, date.
- Admin actions per user: Dismiss, Warn (sends an in-app notice), Restrict (lower limits), Suspend sending, Restore.
- Suspended/restricted users see a calm banner explaining the status; the API returns a clear 403 message.
- Admin gets a notification bell alert for each new flag.

## Genius
- Shield rules are added automatically to Genius knowledge so drafts already respect them.

## Technical details
- New tables (with grants + RLS): `socialite_shield_rules` (admin-managed config, read by all signed-in), `socialite_shield_events` (owner reads own, admin reads all; insert via service role), `socialite_shield_flags` (admin only), `socialite_shield_status` (per-user: normal/restricted/suspended; user reads own).
- Shared engine `supabase/functions/_shared/socialiteShield.ts`: `check(owner, kind, payload) -> {ok, warnings[], blocks[]}`; counts from `socialite_usage` / `socialite_api_requests` / `socialite_scheduled`; logs events, raises flags.
- Wire into `socialite-publish`, `socialite-send`, `socialite-scheduler` (re-check at send time), `socialite-api` (/posts, /messages return 422 with rule list), and `socialite-ai` (rules injected into system prompt).
- New edge function `socialite-shield`: `preview` (client pre-check for warnings) and admin actions (dismiss/warn/restrict/suspend/restore) with main_admin check.
- UI: `SocialiteShieldNotice.tsx` (warning/block cards in Composer, Messaging, Calendar), Settings Shield tab, `SocialiteShieldAdmin.tsx` in Socialite Admin.
- API docs + SDK: document 422 shield response and `/v1/shield` GET (own events).
- Update `src/components/socialite/AGENTS.md` with the Shield rule.
