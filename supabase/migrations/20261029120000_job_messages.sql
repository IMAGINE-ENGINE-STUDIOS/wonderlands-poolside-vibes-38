-- Wonderlands Procurement — direct messaging between a job's buyer and each
-- bidder (one private thread per job + supplier). Backs ProcurementMessages
-- on /procurement. Statuses and award notifications work without this table;
-- this migration only switches on the message threads.
-- Run in the Supabase SQL editor (project bwngxlbnavnhbtahyzbf).

create table if not exists public.job_messages (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.job_postings(id) on delete cascade,
  supplier_id uuid not null,
  sender_id uuid not null,
  body text not null check (char_length(body) between 1 and 4000),
  created_at timestamptz not null default now()
);

create index if not exists job_messages_thread_idx
  on public.job_messages (job_id, supplier_id, created_at);

alter table public.job_messages enable row level security;

-- A thread is visible to: the job's buyer, the thread's supplier, and admins.
drop policy if exists "job_messages participants read" on public.job_messages;
create policy "job_messages participants read" on public.job_messages
  for select to authenticated
  using (
    sender_id = auth.uid()
    or supplier_id = auth.uid()
    or exists (
      select 1 from public.job_postings j
      where j.id = job_messages.job_id and j.business_id = auth.uid()
    )
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'main_admin'
    )
  );

-- Sending: you must be the sender, and you must be a thread participant —
-- either the thread's supplier with a live proposal on the job, or the buyer.
drop policy if exists "job_messages participants send" on public.job_messages;
create policy "job_messages participants send" on public.job_messages
  for insert to authenticated
  with check (
    sender_id = auth.uid()
    and (
      (
        supplier_id = auth.uid()
        and exists (
          select 1 from public.job_proposals pr
          where pr.job_id = job_messages.job_id and pr.supplier_id = auth.uid()
        )
      )
      or exists (
        select 1 from public.job_postings j
        where j.id = job_messages.job_id and j.business_id = auth.uid()
      )
      or exists (
        select 1 from public.profiles p
        where p.id = auth.uid() and p.role = 'main_admin'
      )
    )
  );

-- Realtime so threads can go live without polling in a later pass.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'job_messages'
  ) then
    alter publication supabase_realtime add table public.job_messages;
  end if;
end $$;
