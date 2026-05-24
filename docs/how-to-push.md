# How to push changes to GitHub (and Vercel)

Use this from the **repository root**: `c:\Users\kobby\Desktop\autosell-website`

## 1. Open terminal and go to the project

```bash
cd "c:\Users\kobby\Desktop\autosell-website"
```

## 2. See what changed

```bash
git status
```

## 3. Stage files

One file:

```bash
git add path/to/file.tsx
```

Everything that changed:

```bash
git add -A
```

## 4. Commit

```bash
git commit -m "Short description of what you changed"
```

Example:

```bash
git commit -m "feat(home): show latest listings above Why AutoSell section"
```

## 5. Push to GitHub

```bash
git push
```

## 6. Check the live site (Vercel)

1. Open [vercel.com](https://vercel.com) → your **autosell-website** project → **Deployments**.
2. Wait until the latest deployment shows **Ready** (often 1–3 minutes after `git push`).
3. Visit **https://autosellgh.com** — use a hard refresh or incognito if the old page is cached.

---

## If something goes wrong

**“Nothing to commit”** — changes may already be committed. Run `git push` only.

**Push rejected / “pull first”**:

```bash
git pull
git push
```

**Run the site locally before pushing** (optional):

```bash
npm run dev
```

Then open **http://localhost:3000**

---

## Notes

- Do **not** commit `.env.local` — it has secrets. It should stay in `.gitignore`.
- The Next.js app lives in the **`web/`** folder; Vercel **Root Directory** should be set to **`web`**.
