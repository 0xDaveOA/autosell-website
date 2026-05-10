-- Optional: run in Supabase SQL editor when you want fast year filters on large catalogs.
-- Then set env CAR_SUBMISSIONS_YEAR_COLUMN=year_numeric (e.g. on Vercel).

alter table public.car_submissions
  add column if not exists year_numeric integer;

-- Backfill from existing `year` values (best-effort for common formats).
update public.car_submissions
set year_numeric = (
  case
    when year is null then null
    else left(regexp_replace(year::text, '\D', '', 'g'), 4)::integer
  end
)
where year_numeric is null
  and coalesce(nullif(regexp_replace(year::text, '\D', '', 'g'), ''), '') <> ''
  and left(regexp_replace(year::text, '\D', '', 'g'), 4)::integer between 1950 and 2100;

create index if not exists idx_car_submissions_year_numeric on public.car_submissions (year_numeric);
