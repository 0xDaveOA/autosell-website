-- Tracks auto-posts to Facebook Page + Instagram when a rental vehicle goes live.
-- Run once in Supabase SQL Editor (after supabase-fresh-rental_partners.sql).

alter table public.rental_listings
  add column if not exists meta_social_posted_at timestamptz,
  add column if not exists meta_fb_post_id text,
  add column if not exists meta_ig_media_id text,
  add column if not exists meta_social_last_error text;

comment on column public.rental_listings.meta_social_posted_at is 'When rental was auto-posted to Meta (FB/IG)';
comment on column public.rental_listings.meta_fb_post_id is 'Facebook Graph post id';
comment on column public.rental_listings.meta_ig_media_id is 'Instagram published media id';
comment on column public.rental_listings.meta_social_last_error is 'Last Meta auto-post error (admin debug)';
