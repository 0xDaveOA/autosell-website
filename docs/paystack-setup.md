# Paystack setup (AutoSell Ghana)

Paystack is **already built into the Next.js app** (`web/`). It charges sellers who choose **Premium** or **Complete** on `/sell`. **Free** listings skip payment.

Flow: submit listing → redirect to Paystack → return to `/pay/callback` → webhook + verify mark the row as **paid**.

---

## 1. Supabase database

Run once in **Supabase → SQL Editor** (if you have not already):

`web/scripts/supabase-paystack-columns.sql`

Adds `paystack_reference` and `paystack_payment_status` on `car_submissions`.

---

## 2. Paystack dashboard

1. Sign in at [paystack.com](https://paystack.com) → **Settings → API Keys & Webhooks**.
2. Copy **Secret key** (`sk_test_...` for testing, `sk_live_...` for production).
3. **Webhooks** → Add URL:

   `https://autosellgh.com/api/paystack/webhook`

   Subscribe to **`charge.success`** (and keep the default secret — it must match `PAYSTACK_SECRET_KEY`).

4. For local webhook testing use a tunnel (e.g. ngrok) pointing to `http://localhost:3000/api/paystack/webhook`.

---

## 3. Environment variables

### Local (`web/.env.local`)

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000

NEXT_PUBLIC_PAYSTACK_ENABLED=true
PAYSTACK_SECRET_KEY=sk_test_your_key_here

PAYSTACK_PREMIUM_AMOUNT_GHS=50
PAYSTACK_COMPLETE_AMOUNT_GHS=200

# Optional: show same amounts in the sell form UI
NEXT_PUBLIC_PAYSTACK_PREMIUM_AMOUNT_GHS=50
NEXT_PUBLIC_PAYSTACK_COMPLETE_AMOUNT_GHS=200
```

### Production (Vercel → Settings → Environment Variables)

Same keys for **Production** (use **live** secret key when you go live).

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_PAYSTACK_ENABLED` | `true` turns on Paystack after submit for paid packages |
| `PAYSTACK_SECRET_KEY` | Server only — initialize + webhook + verify |
| `PAYSTACK_PREMIUM_AMOUNT_GHS` | Amount in GHS for Premium |
| `PAYSTACK_COMPLETE_AMOUNT_GHS` | Amount in GHS for Complete |
| `NEXT_PUBLIC_PAYSTACK_*_AMOUNT_GHS` | Optional display on `/sell` |
| `NEXT_PUBLIC_SITE_URL` | `https://autosellgh.com` — Paystack callback URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Required for payment updates on listings |

**Redeploy** Vercel after changing env vars.

---

## 4. Test payment (test mode)

1. `npm run dev` from repo root.
2. Open `/sell`, choose **Premium** or **Complete**, use a **real email** on step 3.
3. Submit → you should redirect to **Paystack checkout**.
4. Use Paystack **test card** from their docs (e.g. success card `4084084084084081`).
5. After payment, you land on `/pay/callback` with a reference.
6. In **admin**, the listing should show `paystack_payment_status` = **paid**.

---

## 5. Go live

1. Switch Paystack to **live** keys in Vercel.
2. Update webhook URL to production domain.
3. Run a small real charge (e.g. ₵1 in dashboard test) before marketing paid packages.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| No redirect to Paystack | `NEXT_PUBLIC_PAYSTACK_ENABLED=true` and redeploy |
| `NO_PAYSTACK` error | Add `PAYSTACK_SECRET_KEY` on Vercel |
| Payment succeeds but status not paid | Check webhook URL + `SUPABASE_SERVICE_ROLE_KEY`; open `/pay/callback?reference=...` once (verify runs there too) |
| Email required error | Seller must enter valid email before submit for paid packages |

---

## Code map

- `/api/paystack/initialize` — starts checkout
- `/api/paystack/webhook` — Paystack `charge.success`
- `/api/paystack/verify` — manual/check callback verification
- `/pay/callback` — thank-you page after Paystack
- `SellWizard.tsx` — redirects to Paystack when enabled
