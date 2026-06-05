# Enable cross-device persistence (R2 images + D1 text)

The biology lab works on `localStorage` out of the box. To make the cohort memory bank
sync **across devices**, create one D1 database + one R2 bucket (both free tier), wire the
bindings, and deploy. ~2 minutes.

## 1. Create the resources
```powershell
cd C:\Users\johng\Desktop\johngresh-portfolio-website-server-backend

npx wrangler login                       # if not already logged in
npx wrangler d1 create lab-memory        # COPY the database_id it prints
npx wrangler d1 execute lab-memory --remote --file schema.sql
npx wrangler r2 bucket create lab-images
```

## 2. Wire the bindings
Open `wrangler.toml`, **uncomment** the `[[d1_databases]]` and `[[r2_buckets]]` blocks,
and paste the `database_id` from step 1.

## 3. Deploy
```powershell
npx wrangler deploy --name serverbackend
```
Use the worker name your live site actually calls — **`serverbackend`** (the site posts to
`serverbackend.johngresh-usa.workers.dev`). This same deploy also turns on the AI replies
(`/bio-chat`) if you haven't deployed since adding them.

## What this turns on
- `POST /bio-load` / `POST /bio-save` — the cohort memory (people, lab sessions, results) in **D1**.
- `POST /bio-image` + `GET /bio-image/<id>` — uploaded lab photos in **R2**.
- `biology-lab.html` loads the shared memory on sign-in and syncs every change; `localStorage`
  stays as an offline cache. **Until you deploy this, the page just uses localStorage** (no errors).

## Cost
~1000 downscaled images (~0.2 GB) + text sits well inside the free tiers (R2: 10 GB storage +
**free egress**; D1: 5 GB). Effectively **$0/month** — only the optional Workers Paid plan
($5/mo) if request volume ever outgrows 100k/day.

## Security (demo-grade — read before production)
- Writes are gated by the shared `BIO_ACCESS_CODE` (`ROSEBUD`), which is visible in client JS.
  Fine for a demo; **not real auth**. To rotate it, change `[vars] BIO_ACCESS_CODE` in
  `wrangler.toml` (and `ACCESS_CODE` in `biology-lab.html`) and redeploy.
- `GET /bio-image/<id>` is unauthenticated (ids are unguessable). For production, gate it.
- The memory is a single shared "cohort:default" document with last-write-wins. Fine for a
  small cohort/demo; a multi-writer production setup should use per-record rows.
