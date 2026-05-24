-- Tracks auto-posts to Facebook Page + Instagram when a listing goes live.
-- Run once in Supabase SQL Editor.

alter table public.car_submissions
  add column if not exists meta_social_posted_at timestamptz,
  add column if not exists meta_fb_post_id text,
  add column if not exists meta_ig_media_id text,
  add column if not exists meta_social_last_error text;

comment on column public.car_submissions.meta_social_posted_at is 'When listing was auto-posted to Meta (FB/IG)';
comment on column public.car_submissions.meta_fb_post_id is 'Facebook Graph post id';
comment on column public.car_submissions.meta_ig_media_id is 'Instagram published media id';
comment on column public.car_submissions.meta_social_last_error is 'Last Meta auto-post error (admin debug)';
