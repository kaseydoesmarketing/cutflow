# CutFlow AI

Web-based AI music-video editor. Upload audio + clips → automatic beat detection → AI clip scoring → beat-synced render → MP4 export. Free tier + Pro $29/mo + Studio $79/mo.

---

## Current state — read before you touch anything

This repo is the **frontend marketing baseline**. The actual product (auth, payments, upload, AI pipeline, render, exports) does not exist yet. Everything that needs to be built is documented in [`PLAN.md`](./PLAN.md).

**What's in this repo right now:**
- React 19 + Vite + TypeScript marketing site (`src/`)
- `Home.tsx` (1273 lines) — the full marketing landing page
- `Editor.tsx`, `Intelligence.tsx`, `About.tsx` — 10-line "Coming soon" stubs
- Tailwind + shadcn/ui kit pre-installed
- No backend, no API client, no auth, no Stripe, no upload, no AI processing, no fetch() calls anywhere

**What's NOT in this repo yet (Phases 2-4 of `PLAN.md`):**
- `apps/api/` — FastAPI service (auth, projects, billing, webhooks, R2 presigning)
- `apps/worker/` — Python RQ worker (librosa beats, PySceneDetect + OpenCV clip scoring, FFmpeg render)
- `infra/` — Docker Compose stack + nginx config for VPS deployment
- Legal pages (Terms, Privacy, Refund, DMCA, AUP)

The kimi.page preview deployment (https://4jiqfqqzco6qs.kimi.page) has fuller Editor/Intelligence/About pages built out, but **that source is not in this repo**. The plan is to export it from the kimi workspace as the Phase 1 starting point.

---

## ⚠️ Phase 0 — Legal & ethics scrub (BLOCKS DEPLOY)

Before any production deploy, the following must be fixed:

1. **Devin Huynh appropriation (live kimi.page only, NOT in this repo's current src/).** The deployed kimi.page bundle includes `src/components/about/FounderStory.tsx:63:17` with `alt="Devin Huynh — Founder & CEO of CutFlow AI"`. Huynh is the real-life founder of AutoEdit AI, the competitor. This is right-of-publicity / false-light / Lanham Act exposure. Must be removed before importing the kimi.page source.
2. **Fabricated stats** in `src/pages/Home.tsx`: "15,000+ editors" (lines 534, 807, 1208), "99.2% Beat accuracy" (line 624), "12 Dimension clip analysis", "8+ Pro formats supported", "14,000+ social signals", testimonials with fictional names (Marcus J., Priya S., Diego R.) at lines 758-771. These numbers were lifted from AutoEdit's marketing — FTC §5 / state UDAP exposure.
3. **Intelligence Hub competitor research** (kimi.page version) names Devin Huynh and Eleven Percent directly with percentage complaints attributed by name. Rewrite as category analysis without naming specific competitors, or delete.

See `PLAN.md` § Phase 0 for the full remediation checklist.

---

## Locked decisions

| Decision | Choice |
| --- | --- |
| **v1 scope** | Web-only MVP (no native plugins for Premiere/Resolve/FCP in v1) |
| **Frontend source** | Export from kimi.page workspace (not rebuild from zip) |
| **Hosting** | VPS 72.60.112.155 (shared Docker Compose stack alongside PodAir / TightSlice / SOD2DAY) |
| **Backend lang** | Python (FastAPI + RQ workers — librosa needs Python anyway, matches GMLX pattern) |
| **Auth** | Clerk (matches PodAir) |
| **Payments** | Stripe Checkout + Customer Portal + webhooks |
| **Storage** | Cloudflare R2 (presigned multipart) |
| **DB** | PostgreSQL 16 in Docker on VPS |
| **Queue/cache** | Redis 7 in Docker on VPS |
| **Email** | Resend (transactional + waitlist audience) |
| **Errors** | Sentry SaaS (frontend + API + worker) |
| **Edge** | Cloudflare DNS + Pages (SPA), VPS nginx (API at `api.cutflow.ai`) |

---

## Existing patterns to copy (do NOT re-invent)

These repos already solve sub-problems we have. Lift from them:

| Pattern needed | Source repo on this machine |
| --- | --- |
| Clerk JWT verification, sign-in flow | `/Users/kvimedia/podar-1/apps/api/src/lib/auth.ts` + `apps/web/lib/auth.ts` |
| Stripe Checkout + webhook handler | `/Users/kvimedia/podar-1/apps/api/src/routes/v1.ts` (Stripe section) |
| S3/R2 presigned multipart upload | `/Users/kvimedia/podar-1/apps/web/lib/chunkQueue.ts` + chunks endpoints |
| RQ worker bootstrap + Sentry RqIntegration | `/Users/kvimedia/audio/backend/worker.py` (GMLX) |
| FastAPI app + Alembic structure | `/Users/kvimedia/audio/backend/` |
| Resend transactional + audience capture | Ascend lead capture endpoint |
| Deploy script (rsync + docker rebuild + `nginx -s reload`) | `/Users/kvimedia/podar-1/scripts/deploy.sh` |
| Docker Compose multi-service on VPS | `/Users/kvimedia/podar-1/infra/compose/` |

**Critical lesson from GMLX 2026-04-10 incident:** any boto3/R2 client MUST be configured with `connect_timeout=5, read_timeout=30, tcp_keepalive=True`. Skipping this caused a 7-hour outage. See `~/.claude/projects/-Users-kvimedia/memory/MEMORY.md`.

---

## Run locally

```bash
npm install
npm run dev          # vite on :3000
```

**Known issues to fix immediately (Phase 1.2 of PLAN.md):**
- `npm run build` fails on 3 unused imports at `src/pages/Home.tsx:8` (`BarChart3`, `Layers`, `Wand2`)
- Navbar links at `src/components/Navbar.tsx:7-11` use `/#/editor` hash anchors but routes are real paths — clicking them anchor-scrolls instead of navigating
- Two `react-router` packages installed (`react-router` v7.6.1 + `react-router-dom` v7.15.1) with mixed imports — standardize on `react-router-dom`
- `public/hero-video.mp4` and `public/editor-demo.mp4` are byte-identical 4.8 MB files — dedupe
- No favicon, robots.txt, sitemap.xml, or JSON-LD

---

## Repo structure (current vs. target after PLAN.md execution)

**Today (this commit):**
```
cutflow/
├── src/                 React SPA (marketing only)
├── public/              Static assets
├── docs/                Research, original rebrand plan, scaffold notes
├── PLAN.md              The build plan (THIS IS THE SPEC)
└── README.md
```

**Target after PLAN.md execution:**
```
cutflow/
├── apps/
│   ├── web/             React SPA (this current code, scrubbed + extended)
│   ├── api/             FastAPI service
│   └── worker/          Python RQ worker (librosa, PySceneDetect, FFmpeg)
├── infra/
│   ├── compose/         Docker Compose stacks
│   └── nginx/           VPS nginx server block
├── packages/
│   └── shared-types/    Generated TS types from FastAPI OpenAPI
├── scripts/
│   ├── deploy.sh
│   ├── smoke-test.sh
│   └── migrate.sh
├── .github/workflows/
│   ├── ci.yml
│   └── deploy.yml
├── docs/
├── PLAN.md
└── README.md
```

---

## Definition of "operational v1" done

All of these must be true to ship:

- [ ] Phase 0 legal scrub complete (no Huynh anywhere, no fabricated stats, legal pages live)
- [ ] `cutflow.ai` resolves to the marketing site with working Clerk sign-in
- [ ] `api.cutflow.ai/v1/health` returns 200 with all subsystems ok
- [ ] User can sign up → upload audio + clips → render → download an MP4 with beat-synced cuts
- [ ] User can pay $29 → unlimited projects + 4K + no watermark unlocks immediately via Stripe webhook
- [ ] Free-tier limits enforced server-side (3 projects/month, 5-min audio, 720p, watermark)
- [ ] All 13 smoke tests green in CI
- [ ] Sentry receives events from frontend + API + worker
- [ ] Waitlist captures emails → Resend audience
- [ ] Mobile responsive (393px iPhone 14 Pro viewport)
- [ ] Deploy is one command (`./scripts/deploy.sh`) with smoke-test gate

See `PLAN.md` § "Definition of done" for the full list.

---

## For agents picking this up

1. Read `PLAN.md` first — it's the spec.
2. Phase 0 is non-negotiable and blocks every other phase.
3. Reuse the patterns listed above — do not re-invent auth, billing, deploys, R2 clients. The other repos on this machine have working examples.
4. Owner is Kasey (`kasey@titletesterpro.com`, GitHub `kaseydoesmarketing`). Same person owns PodAir, GMLX, Ascend, TightSlice — the patterns in those repos are the patterns we use here.
