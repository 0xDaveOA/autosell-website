-- Optional: tracks Paystack card payments for paid packages (premium / complete).
-- Run once in SQL Editor after car_submissions exists.

alter table public.car_submissions
  add column if not exists paystack_reference text,
  add column if not exists paystack_payment_status text;

comment on column public.car_submissions.paystack_reference is 'Paystack transaction reference from initialize';
comment on column public.car_submissions.paystack_payment_status is 'pending | paid | failed | refunded (managed by webhook)';
