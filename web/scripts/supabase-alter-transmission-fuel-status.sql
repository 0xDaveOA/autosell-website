-- Run in Supabase SQL Editor after `supabase-fresh-car_submissions.sql` (or anytime) to add
-- transmission / fuel columns for `/cars` filters and `/sell`. Status values rejected/archived
-- are enforced in app + admin UI only — no enum on `status`.

alter table public.car_submissions
  add column if not exists transmission text,
  add column if not exists fuel_type text;

create index if not exists idx_car_submissions_transmission on public.car_submissions (transmission);
create index if not exists idx_car_submissions_fuel_type on public.car_submissions (fuel_type);

comment on column public.car_submissions.transmission is 'e.g. Automatic, Manual, CVT';
comment on column public.car_submissions.fuel_type is 'e.g. Petrol, Diesel, Hybrid, Electric';
