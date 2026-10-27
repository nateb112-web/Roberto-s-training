-- Required before enabling approved EOD tip push delivery.
-- This ledger prevents repeated notifications when an approval request is retried.
create table if not exists public.eod_tip_notification_deliveries (
 business_date date not null,
 user_id uuid not null references auth.users(id) on delete cascade,
 created_at timestamptz not null default now(),
 primary key (business_date,user_id)
);
alter table public.eod_tip_notification_deliveries enable row level security;
-- Access exclusively via service-role API route; no anon/authenticated grants.
revoke all on public.eod_tip_notification_deliveries from anon,authenticated;
grant select,insert on public.eod_tip_notification_deliveries to service_role;
