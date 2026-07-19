# Meta Auto-Post — End-to-End Verification Checklist

Use this after setup (see [meta-auto-post-setup.md](meta-auto-post-setup.md)) to confirm
auto-posting works for **cars and rentals**, and that the admin dashboard shows post status.

## 1. Database migrations (Supabase SQL Editor)

- [ ] Cars (if not already run): paste and run `web/scripts/supabase-meta-social-columns.sql`
- [ ] Rentals (new): paste and run `web/scripts/supabase-rental-meta-columns.sql`
- [ ] Verify both succeed:

```sql
select meta_social_posted_at, meta_fb_post_id, meta_ig_media_id, meta_social_last_error
from car_submissions limit 1;

select meta_social_posted_at, meta_fb_post_id, meta_ig_media_id, meta_social_last_error
from rental_listings limit 1;
```

Both queries should return without a column error.

## 2. Environment variables (Vercel → Settings → Environment Variables → Production)

- [ ] `META_AUTO_POST_ENABLED=true`
- [ ] `META_PAGE_ACCESS_TOKEN` — long-lived **Page** token (not a user token)
- [ ] `META_PAGE_ID` — numeric Facebook Page ID
- [ ] `META_IG_USER_ID` — optional; without it only Facebook posts
- [ ] `META_GRAPH_API_VERSION` — optional, defaults to v21.0
- [ ] `NEXT_PUBLIC_SITE_URL=https://autosellgh.com`
- [ ] `NEXT_PUBLIC_LISTING_STATUSES` includes `completed` (or is unset)
- [ ] `NEXT_PUBLIC_RENTAL_LISTING_STATUSES` includes `active` (or is unset)

> **Any env change requires a redeploy.** The admin "Social" column only appears when
> the feature is configured — if you don't see it after deploy, the env vars aren't set.

## 3. Car listing end-to-end

1. In `/admin`, pick a listing with at least one photo and set its status to **Completed**.
2. Within ~2 minutes:
   - [ ] A post appears on your Facebook Page (photo + caption + link to `/cars/{id}`)
   - [ ] If IG configured: the same post appears on Instagram
   - [ ] The listing's row in `/admin` shows a green **✓ Posted** badge — clicking it opens the FB post
   - [ ] In Supabase: `meta_social_posted_at` is set on the row

## 4. Rental end-to-end (test both orders)

**Order 1 — partner approved first:**
1. Approve a partner in `/admin/rentals` → Partners tab.
2. Set one of their vehicles (with a photo) to **Active** on the Listings tab.
3. - [ ] FB/IG post appears with the rental caption (rate per day/month, `/rentals/{id}` link)
   - [ ] Green **✓ Posted** badge on the Listings tab

**Order 2 — vehicles activated first (approval trigger):**
1. With a **pending** partner, set 2–3 of their vehicles to Active.
   - [ ] Badge shows amber **Not posted** (hover: "Skipped: partner not approved yet.")
2. Approve the partner.
   - [ ] Up to 3 of those vehicles auto-post (oldest first)
   - [ ] A 4th active vehicle stays unposted — post it manually with its **Post** button

## 5. Failure path + retry

1. In Vercel, temporarily corrupt `META_PAGE_ACCESS_TOKEN` (append an `X`), redeploy.
2. Flip a test listing to Completed.
   - [ ] Red **✗ Post failed** badge appears; hover shows the Graph API error
3. Restore the token, redeploy, click **Retry** on that row.
   - [ ] Badge turns green; post appears on Facebook

## 6. Feature-off check

1. Set `META_AUTO_POST_ENABLED=false`, redeploy.
   - [ ] "Social" column disappears from both admin dashboards
   - [ ] Publishing a listing does not post anywhere
