# Facebook + Instagram auto-post setup

When you set a listing to a **live** status (default: `completed`, from `NEXT_PUBLIC_LISTING_STATUSES`), the site can automatically post once to your **Facebook Page** and **Instagram** (if linked).

Posts are **not** repeated if you edit the listing again — only the first time it goes live.

---

## 1. Supabase

Run once in **SQL Editor**:

`web/scripts/supabase-meta-social-columns.sql`

---

## 2. Meta prerequisites

- **Facebook Page** for AutoSell (you already have one).
- **Instagram Professional** account **linked** to that Page.
- **Meta app** (e.g. “AutoSell”) at [developers.facebook.com](https://developers.facebook.com).

### Permissions your Page token needs

- `pages_manage_posts`
- `pages_read_engagement`
- `instagram_basic`
- `instagram_content_publish`

(In **Development** mode, only app roles can authorize until App Review for wider use.)

---

## 3. Get IDs and Page access token

### Page ID

1. Open your Facebook Page → **About** → scroll to **Page transparency** / Page ID,  
   **or** use [Graph API Explorer](https://developers.facebook.com/tools/explorer/).
2. Query: `me/accounts` (with a user token) or use Page settings.
3. Save numeric **Page ID** → `META_PAGE_ID`.

### Instagram Business account ID

With a Page token, in Graph API Explorer:

```
GET /{page-id}?fields=instagram_business_account
```

Use `instagram_business_account.id` → `META_IG_USER_ID`.

### Long-lived Page access token

1. [developers.facebook.com](https://developers.facebook.com) → your app → **Tools** → **Graph API Explorer**.
2. Select your app, add permissions above, **Generate access token** (as Page admin).
3. Exchange for a **long-lived Page token** (Meta docs: “Get a Page access token”) — or use Business Suite token flows.
4. Token must be for the **Page**, not only a user token.

Save as `META_PAGE_ACCESS_TOKEN` (server only — Vercel + `.env.local`).

---

## 4. Environment variables

### Local (`web/.env.local`)

```env
META_AUTO_POST_ENABLED=true
META_PAGE_ACCESS_TOKEN=your_page_token
META_PAGE_ID=your_page_id
META_IG_USER_ID=your_ig_business_account_id
```

### Vercel (Production)

Same keys for **Production**, then **Redeploy**.

| Variable | Required |
|----------|----------|
| `META_AUTO_POST_ENABLED` | `true` to turn on |
| `META_PAGE_ACCESS_TOKEN` | Yes |
| `META_PAGE_ID` | Yes |
| `META_IG_USER_ID` | Yes for Instagram; Facebook still works without it |
| `META_GRAPH_API_VERSION` | Optional (`v21.0` default) |

Also ensure:

- `NEXT_PUBLIC_LISTING_STATUSES=completed` (or includes the status you use when publishing)
- `NEXT_PUBLIC_SITE_URL=https://autosellgh.com`
- Listing has at least **one public photo URL** for Instagram (Facebook can post link-only if no photo)

---

## 5. Test

1. In **admin**, set a listing with a photo to **`completed`** (or your live status).
2. Check **Facebook Page** and **Instagram** for the new post (may take 1–2 minutes).
3. In Supabase, row should have `meta_social_posted_at` set.
4. If it failed, check `meta_social_last_error` on that row.

---

## 6. Troubleshooting

| Issue | Fix |
|-------|-----|
| Nothing posts | `META_AUTO_POST_ENABLED=true`, token + Page ID on Vercel, redeploy |
| Facebook only | Set `META_IG_USER_ID`; ensure IG linked to Page; image URL must be public |
| `(#200) permissions` | Regenerate token with `pages_manage_posts` + IG publish scopes |
| Duplicate posts | By design only first go-live; `meta_social_posted_at` blocks repeats |
| Image errors on IG | Use HTTPS public image; Supabase `car-photos` URLs must be reachable by Meta |

---

## How it works in code

- Trigger: admin **PATCH** or **POST** when status newly matches `NEXT_PUBLIC_LISTING_STATUSES`.
- `web/src/lib/meta-social-auto-post.ts` — scheduling + idempotency.
- `web/src/lib/meta-social-post.ts` — Graph API calls.
