# Fix: visitor details from website forms are not being saved

## What is wrong today
1. **Solar request form** (main page, "Request My Shade Study") — saves only inside the visitor's own browser. Nothing reaches you. Every solar lead so far has been lost.
2. **Pool / product quote tool** — tries to save, but the save is blocked for visitors who are not signed in (it asks to read the saved quote back, which visitors aren't allowed to do). They see "Save Failed" or nothing arrives.
3. **Customer list for quote search** — the lookup step before saving is blocked for visitors, so repeat customers are never matched.
4. **Landscaping, fencing, enclosures, consultation and other main-page sections** — have no form of their own; their "Request a Quote" buttons lead into the quote tool, so they inherit problem 2.
5. **Company websites built in the website builder** — already save correctly into that company's clients and CRM (tested earlier). No change needed.
6. **Nobody is emailed** when a main-page lead arrives.

## What will be built
- One secure "file a Wonderlands lead" step on the server. Every main-page form sends to it; it puts the visitor into **Clients** (status new), and into the Wonderlands **CRM**: account, contact, a "Lead in" deal titled by source (Solar, Pool quote, Landscaping…), and a follow-up task due today.
- **Solar form** sends name, email, chosen package and WhatsApp consent to it. Browser-only saving removed.
- **Quote tool** saves the full quote without needing to read it back, then files the lead with pool model and total.
- Customer list update moved to the server so repeat visitors are matched by email.
- Owner email on each new main-page lead, using the same email sender already set up for company websites (to wonderlandsworlds@gmail.com unless you choose another address).
- Honest messages: visitors only see "Thank you" after the save really worked; otherwise a calm "please call us" note (no red errors).

## How it will be checked
- Submit one test entry from the solar form and one from the quote tool as a signed-out visitor, confirm both appear in Clients, CRM pipeline and My Day, confirm the email was sent, then delete only those test entries.

## Your DNS / domain changes
To be added here before building.

## Technical details
- New SECURITY DEFINER RPC `submit_wonderlands_lead(_name,_email,_phone,_message,_source)` filing into `platform_company_id()` (clients, crm_accounts, crm_contacts, crm_deals, crm_activities); execute granted to anon + authenticated only.
- `SolarLeadForm.tsx`: replace localStorage with the RPC.
- `SurveyQuoteTool.tsx`: client-generated id, insert without `.select().single()`, then RPC with source `pool_quote`.
- `useCustomerCache.ts`: move upsert into the RPC (anon cannot select customer_cache).
- Extend `site-lead-notify` (or sibling function) for platform leads, recipient fixed server-side.
