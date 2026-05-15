# CutFlow AI — Operational v1 Build Plan

## Context

Today CutFlow is a marketing demo. The kimi.page deployment has 4 pages of UI (Home, Editor, Intelligence, About) but **zero backend, zero AI, zero upload, zero payments, zero auth, zero email capture**. The GitHub repo (`https://github.com/kaseydoesmarketing/cutflow.git`) is empty. The About page also has a serious legal problem: it presents AutoEdit's real-life founder Devin Huynh as "Founder & CEO of CutFlow AI" (verified in live JS bundle, file path `src/components/about/FounderStory.tsx:63:17`). Marketing copy across Home + Intelligence cites fabricated stats lifted from AutoEdit ("15,000+ editors", "99.2% accuracy", "4.67/5 Trustpilot", "14,000+ social signals").

The goal of this plan: turn CutFlow into a real, operational, web-only MVP that uploads video + audio, detects beats, scores clips, assembles a beat-synced cut, renders MP4 output, and charges money for it. Auth, payments, storage, queue, workers — all real. Native plugins (Premiere/Resolve/FCP) are explicitly **deferred to v2+**.

**Locked decisions** (from clarification round):
- v1 scope: **Web-only MVP** (Upload → beat detection → AI cut selection → render → MP4 export)
- Frontend source: **Export from kimi.page workspace** (we scrub the legal issues, don't rebuild from zip)
- Hosting: **VPS 72.60.112.155** (shared with PodAir/TightSlice/SOD2DAY pattern)

**Stack** (chosen to match Kasey's existing patterns):
- Frontend: React 19 + Vite + TypeScript (already built, needs hardening + scrub)
- API: FastAPI + SQLAlchemy + Alembic (matches GMLX pattern; librosa needs Python anyway)
- Worker: Python RQ + librosa + PySceneDetect + OpenCV + FFmpeg (matches GMLX worker pattern)
- DB: PostgreSQL 16 in Docker on VPS (matches PodAir self-hosted pattern)
- Cache/Queue: Redis 7 in Docker on VPS
- Storage: Cloudflare R2 (presigned multipart upload + presigned downloads)
- Auth: Clerk (matches PodAir — Kasey already runs Clerk in production)
- Payments: Stripe Checkout + Customer Portal + webhooks (matches PodAir/GMLX)
- Email: Resend (matches Ascend; transactional + waitlist audience)
- Errors: Sentry SaaS (free tier) on frontend + API + worker
- Edge: Cloudflare DNS + Pages for SPA; nginx on VPS for API
- Domain split: `cutflow.ai` → Cloudflare Pages (marketing + SPA); `api.cutflow.ai` → VPS

---

## Phase 0 — Legal & Ethics Scrub (BLOCKS EVERYTHING)

Cannot start the build until this is done. The current site is a sue-on-sight target.

### 0.1 Remove Devin Huynh appropriation
- Delete or rewrite `src/components/about/FounderStory.tsx` — strip name, photo alt text, and any "founded CutFlow AI" narrative attached to Huynh
- Delete `public/founder-portrait.jpg` (assuming it's Huynh's likeness — replace with Kasey's photo, a placeholder silhouette, or remove the section entirely for v1)
- Audit and rewrite any About-page copy that puts words in Huynh's mouth or implies he founded CutFlow

### 0.2 Strip fabricated stats from `src/pages/Home.tsx`
Replace these specific strings (confirmed by file:line):
- Line ~534: "15,000+ editors bought into AI-powered editing… analyzed 14,000+ social signals"
- Line ~624: `stats` array with `99.2% Beat accuracy`, `12 Dimension clip analysis`, `8+ Pro formats supported`, `0 Plugins needed`
- Line ~758-771: testimonials block (`Marcus J.`, `Priya S.`, `Diego R.` — fictional)
- Line ~807: "Trusted by 15,000+ Editors Worldwide"
- Line ~1208: "Join 15,000+ editors already creating with AI"

Replacement strategy: either remove these sections for the v1 launch, or rewrite with **honest "early access" framing** ("Built by editors who got tired of waiting on AutoEdit." "Pre-launch beta — join the waitlist."). Stats can return after we have real numbers from real users.

### 0.3 Rewrite Intelligence Hub
The current Intelligence page is effectively a public hit piece naming Devin Huynh, his company (Eleven Percent), and quoting specific complaint percentages attributed to him by name. Lanham Act §43(a) exposure if published.

Two acceptable approaches:
- **Option A (recommended):** Rewrite as a *category* analysis — "AI Video Editing in 2026 — Where the Field Is" — without naming AutoEdit or Huynh. Reference "the leading Premiere plugin" generically. Compare feature *categories*, not specific competitors.
- **Option B:** Delete the Intelligence page entirely for v1. Bring it back later as a private investor/internal doc.

### 0.4 Stub legal pages
Create real (template + customized) Terms of Service, Privacy Policy, Refund Policy, DMCA Notice page, Acceptable Use Policy. Required for Stripe live mode and for basic SaaS legitimacy. Use Termly or a competent template — do not freelance these.

**Critical files modified in Phase 0:**
- `apps/web/src/pages/Home.tsx`
- `apps/web/src/components/about/FounderStory.tsx` (delete or rewrite)
- `apps/web/src/pages/Intelligence.tsx` (rewrite or delete)
- `apps/web/src/pages/About.tsx`
- `apps/web/src/pages/legal/*` (new — Terms, Privacy, Refund, DMCA, AUP)
- `apps/web/public/founder-portrait.jpg` (delete or replace)

---

## Phase 1 — Repo Scaffold & Monorepo Setup

### 1.1 Initialize repo structure
Push to the (currently empty) `https://github.com/kaseydoesmarketing/cutflow.git`:

```
cutflow/
├── apps/
│   ├── web/                 (React SPA — from kimi.page export, scrubbed)
│   ├── api/                 (FastAPI service)
│   └── worker/              (Python RQ worker — AI + render)
├── infra/
│   ├── compose/
│   │   ├── docker-compose.yml
│   │   ├── docker-compose.prod.yml
│   │   └── .env.example
│   └── nginx/
│       └── cutflow.conf
├── packages/
│   └── shared-types/        (TS types — generated from FastAPI OpenAPI schema)
├── scripts/
│   ├── deploy.sh            (matches PodAir's rsync + docker rebuild pattern)
│   ├── migrate.sh
│   └── smoke-test.sh
└── .github/workflows/
    ├── ci.yml               (lint + typecheck + test on PR)
    └── deploy.yml           (rsync + docker rebuild on push to main)
```

### 1.2 Web frontend ingestion
- Export source from kimi.page workspace (Kasey provides)
- Move into `apps/web/`
- Fix the broken build: `apps/web/src/pages/Home.tsx:8` — remove unused imports `BarChart3`, `Layers`, `Wand2`
- Fix navbar routing in `apps/web/src/components/Navbar.tsx:7-11` — change `'/#/editor'` etc. to `'/editor'` (real React Router paths, not hash anchors)
- Resolve `react-router` vs `react-router-dom` duplicate import — standardize on `react-router-dom@7`
- Dedupe `apps/web/public/hero-video.mp4` and `apps/web/public/editor-demo.mp4` (identical md5 — keep one, reference twice)
- Code-split per route: lazy-load Editor/Intelligence/About via `React.lazy()` (current 522 KB → expect ~300 KB initial)
- Add `prefers-reduced-motion` guards on framer-motion + gsap animations
- Add favicon.ico, robots.txt, sitemap.xml, manifest.json, JSON-LD (`SoftwareApplication` schema)
- Add `<meta name="theme-color">`, OG tags, Twitter card tags

### 1.3 Docker Compose — VPS service definition
Add a new compose stack to VPS `/opt/cutflow/`:
```yaml
services:
  cutflow_web:        # Cloudflare Pages — NOT in compose (separate deploy)
  cutflow_api:        # FastAPI, port 8001 (PodAir uses 8000)
  cutflow_worker:     # Python RQ worker (no exposed port)
  cutflow_postgres:   # Postgres 16, volume /var/lib/postgresql/data
  cutflow_redis:      # Redis 7, volume /data
```
- Use `-p cutflow` project flag for `docker compose` to namespace from PodAir
- nginx server block at `/opt/cutflow/nginx/cutflow.conf`, served by host nginx (matches PodAir)
- nginx routes `api.cutflow.ai/*` → `cutflow_api:8001`

**Critical files created in Phase 1:**
- `infra/compose/docker-compose.yml`, `docker-compose.prod.yml`, `.env.example`
- `infra/nginx/cutflow.conf`
- `scripts/deploy.sh` (model after PodAir's `scripts/deploy.sh`)
- `apps/web/src/pages/legal/*`
- `apps/web/public/{favicon.ico,robots.txt,sitemap.xml,manifest.json}`

---

## Phase 2 — Backend Foundation (Auth + DB + Payments + Storage)

### 2.1 FastAPI service (`apps/api/`)

Mirror GMLX structure:
```
apps/api/
├── app/
│   ├── main.py              (FastAPI app, CORS, Sentry init)
│   ├── core/                (config, db session, security)
│   ├── routers/             (waitlist, projects, billing, webhooks, me)
│   ├── models/              (SQLAlchemy)
│   ├── schemas/             (Pydantic)
│   ├── services/            (R2 client, Clerk client, Stripe client, Resend client, queue dispatcher)
│   └── alembic/             (migrations)
├── tests/
├── pyproject.toml
├── Dockerfile
└── alembic.ini
```

### 2.2 Database schema (v1, Alembic migration `0001_init`)

```sql
users             (clerk_user_id PK, email UNIQUE, stripe_customer_id, plan_tier, created_at, deleted_at)
subscriptions     (id PK, user_id FK, stripe_subscription_id UNIQUE, tier, status, current_period_end, cancel_at_period_end)
projects          (id PK, user_id FK, title, status, edit_style, created_at, updated_at, deleted_at)
audio_tracks     (id PK, project_id FK, r2_key UNIQUE, original_filename, duration_s, bpm, key, beat_grid jsonb, status, error)
video_clips      (id PK, project_id FK, r2_key UNIQUE, original_filename, duration_s, fps, codec, dims, motion_score real, scene_changes jsonb, status, error)
render_jobs      (id PK, project_id FK, edit_style, status, cut_list jsonb, output_r2_key, output_duration_s, started_at, finished_at, error)
jobs              (id PK, type, ref_id, status, retries, started_at, finished_at, error)  -- queue audit trail
waitlist          (id PK, email UNIQUE, source, ip_country, created_at)
usage_events     (id PK, user_id FK, event_type, metadata jsonb, ts)
```

Indexes:
- `users(stripe_customer_id)`, `subscriptions(user_id, status)`, `projects(user_id, status, created_at desc)`, `audio_tracks(project_id)`, `video_clips(project_id)`, `render_jobs(project_id, status)`, `waitlist(email)`

### 2.3 Auth via Clerk
- Add Clerk frontend SDK in `apps/web` (`@clerk/clerk-react`)
- Sign-in / sign-up routes: `/sign-in`, `/sign-up`, `/sso-callback`
- API verifies Clerk JWT on every authenticated route (`apps/api/app/core/security.py`)
- Webhook endpoint `POST /v1/auth/webhook` syncs user.created / user.updated / user.deleted into `users` table
- Reuse PodAir's Clerk integration as reference (`apps/api/src/lib/auth.ts` in PodAir codebase)

### 2.4 Payments via Stripe
- 2 live prices created in Stripe: Pro $29/mo, Studio $79/mo (both monthly recurring)
- `GET /v1/billing/checkout-session?tier=pro` → creates Checkout session, returns URL
- `GET /v1/billing/portal-session` → Stripe Customer Portal
- `POST /v1/billing/webhook` → handles `customer.subscription.created/updated/deleted` and `invoice.payment_failed`
- Plan tier on `users` row updated from webhook (single source of truth — never trust frontend)
- Free tier is the default; no Stripe object until they upgrade

Tier gating (centralized in `apps/api/app/services/plan.py`):
```python
TIERS = {
  "free":    { max_projects_per_month: 3, max_audio_minutes: 5,  max_export_height: 720,  watermark: True,  max_storage_gb: 5 },
  "pro":     { max_projects_per_month: -1, max_audio_minutes: -1, max_export_height: 2160, watermark: False, max_storage_gb: 50 },
  "studio":  { max_projects_per_month: -1, max_audio_minutes: -1, max_export_height: 2160, watermark: False, max_storage_gb: 200, prores_export: True, api_access: True }
}
```

### 2.5 Storage via Cloudflare R2
- 2 buckets: `cutflow-staging`, `cutflow-prod`
- Key prefix scheme: `users/{user_id}/projects/{project_id}/{audio|clips|render}/{uuid}.{ext}`
- `POST /v1/projects/:id/audio/upload-url` → returns `{ uploadId, partUrls[] }` — multipart presigned (10 MB per part)
- `POST /v1/projects/:id/audio/upload-complete` → finalizes upload, validates size+mime, dispatches probe + beat-detect jobs
- Same pattern for `/clips/`
- `GET /v1/projects/:id/output` → presigned 24h download URL when render is done
- Upload bypasses the API container entirely — direct browser → R2 — VPS stays light

### 2.6 Waitlist + Email
- `POST /v1/waitlist` — public, body `{ email, source? }`, Cloudflare Turnstile token required, dedupes on email
- On insert, push to Resend audience via `audiences.contacts.create`
- Send "you're in" confirmation email via Resend template
- Wire `apps/web/src/pages/Home.tsx:1213` form to this endpoint (currently `onSubmit={(e) => e.preventDefault()}`)

### 2.7 Observability
- Sentry frontend SDK in `apps/web/src/main.tsx`
- Sentry FastAPI integration in `apps/api/app/main.py`
- Sentry RQ integration in `apps/worker/main.py` (matches GMLX worker pattern from Round 4 lesson)
- Structured JSON logs via `structlog` from API + worker
- `GET /v1/health` — returns `{ ok: true, db: ok, redis: ok, r2: ok, build_sha: $GIT_SHA }`

**Critical files created in Phase 2:**
- `apps/api/app/main.py`, `app/core/{config,db,security}.py`
- `apps/api/app/routers/{auth,billing,projects,waitlist,me,health,webhooks}.py`
- `apps/api/app/services/{clerk,stripe,r2,resend,plan,queue}.py`
- `apps/api/app/models/*.py`, `app/schemas/*.py`
- `apps/api/alembic/versions/0001_init.py`
- `apps/web/src/lib/api.ts` (typed fetch client)
- `apps/web/src/lib/clerk.ts`

---

## Phase 3 — AI Editing Pipeline (the actual product)

### 3.1 Worker scaffold (`apps/worker/`)
Python RQ worker, one container, one queue (`cutflow:default`) for v1. Future: split into `cutflow:probe`, `cutflow:beats`, `cutflow:score`, `cutflow:render` so heavy render jobs don't starve quick probes.

```
apps/worker/
├── main.py                  (RQ worker bootstrap, Sentry init)
├── jobs/
│   ├── probe.py             (ffprobe → metadata)
│   ├── beats.py             (librosa BPM + beat timestamps)
│   ├── score_clips.py       (PySceneDetect + OpenCV motion)
│   └── render.py            (cut list assembly + FFmpeg concat)
├── lib/
│   ├── ffmpeg.py            (subprocess wrappers)
│   ├── r2.py                (download/upload helpers, streaming)
│   └── algorithms/
│       ├── staircase.py
│       ├── random_snap.py
│       └── cut_list.py      (shared cut → FFmpeg concat-demuxer EDL)
├── pyproject.toml
└── Dockerfile               (multi-stage with ffmpeg apt installed)
```

### 3.2 The 4 worker jobs

**Job 1: `probe_media(media_id, kind)`** — fast (<5s)
- Download from R2 to /tmp
- `ffprobe -v quiet -print_format json -show_streams -show_format`
- Extract: duration_s, codec, fps, dims, audio_sample_rate, audio_channels
- Update `audio_tracks` or `video_clips` row with metadata + status='probed'
- Validate: max audio 5 min on Free tier; reject if violated

**Job 2: `detect_beats(audio_track_id)`** — librosa, ~10-30s for 3-min track
- Download audio from R2
- `librosa.beat.beat_track(y, sr)` → BPM + frame indices
- `librosa.frames_to_time(beats, sr)` → seconds
- Optionally: `librosa.feature.tempo()` for confidence check, fallback to onset detection if BPM confidence < threshold
- Store `bpm` (float), `beat_grid` (jsonb array of timestamps), `key` (via `librosa.feature.chroma_cqt` argmax) on `audio_tracks`
- Update status='beat_detected'

**Job 3: `score_clips(project_id)`** — PySceneDetect + OpenCV, ~5-15s per clip
- For each video clip:
  - Download from R2 (or stream, for clips >500 MB)
  - PySceneDetect `ContentDetector(threshold=27.0)` → list of scene boundaries
  - For each scene segment: sample frames every 0.5s, compute Farneback optical flow magnitude → average → motion_score
  - Detect shake: variance of optical flow direction > threshold = shaky → mark unusable
  - Store `motion_score`, `scene_changes` (jsonb of `[{start_s, end_s, score, shaky}]`) on `video_clips`
- Update each clip status='scored'

**Job 4: `render_project(project_id, edit_style)`** — FFmpeg, ~30s-3min depending on output length
- Algorithm (see `apps/worker/lib/algorithms/`):
  - **Staircase:** cuts on every beat. Pick highest-scored clip segment for beat 1. Pick next-highest unused for beat 2. Wrap on exhaustion. Snap segment in/out to beat boundaries.
  - **Random:** beat-snapped random clip segment selection, weighted by motion_score. Avoid using the same clip on adjacent beats.
  - **Manual:** *deferred to v1.5* (requires UI for user to specify beat subdivision pattern)
- Output a cut list (jsonb on `render_jobs.cut_list`): `[{clip_id, in_s, out_s, beat_index}]`
- Generate FFmpeg concat demuxer file
- Run: `ffmpeg -f concat -safe 0 -i list.txt -i audio.wav -map 0:v -map 1:a -c:v libx264 -preset fast -crf 22 -c:a aac -b:a 192k -shortest output.mp4`
- Tier-specific: scale to 720p + apply watermark overlay on Free; 4K/ProRes on Pro+
- Upload to R2: `users/{user_id}/projects/{project_id}/render/{render_job_id}.mp4`
- Update `render_jobs.output_r2_key`, status='complete', finished_at
- Send email via Resend: "Your CutFlow render is ready"

### 3.3 Frontend Editor page (the dashboard)

Rebuild from kimi.page export. Key states:
- **Empty:** "Create your first project" CTA
- **Upload:** drag-drop area, audio + clips upload progress bars (multipart, resumable via tus-js-client or custom)
- **Processing:** stepper UI showing probe → beats → score progress (poll `GET /v1/projects/:id` every 2s)
- **Ready:** edit style picker (Staircase / Random / Manual disabled), "Render" button
- **Rendering:** progress bar (worker emits progress every 10%)
- **Done:** preview MP4 + download button + share link

### 3.4 Free-tier watermark
- FFmpeg overlay: `-vf "drawtext=text='cutflow.ai':x=w-tw-20:y=h-th-20:fontsize=24:fontcolor=white@0.5"`
- Or: PNG overlay of CutFlow logo, scaled to 8% of width

**Critical files created in Phase 3:**
- `apps/worker/main.py`, `apps/worker/jobs/{probe,beats,score_clips,render}.py`
- `apps/worker/lib/{ffmpeg,r2}.py`, `lib/algorithms/{staircase,random_snap,cut_list}.py`
- `apps/web/src/pages/Editor.tsx` (full rewrite from kimi export — clean Editor dashboard)
- `apps/web/src/components/editor/{UploadZone,ProcessingStepper,StylePicker,RenderProgress,Preview}.tsx`

---

## Phase 4 — Deploy & Production Verification

### 4.1 DNS
- Cloudflare: `cutflow.ai` (apex + www) → Pages
- Cloudflare: `api.cutflow.ai` → DNS A record → 72.60.112.155 (proxied through CF for SSL + DDoS)
- Cloudflare: `staging.cutflow.ai`, `api.staging.cutflow.ai` (optional, for pre-prod)

### 4.2 Marketing + SPA via Cloudflare Pages
- Connect Pages to GitHub repo, build command `pnpm -F web build`, output `apps/web/dist`
- Branch deploys: `main` → production, all other branches → preview URLs
- Free, instant, zero infra to manage
- Env vars in Pages: `VITE_CLERK_PUBLISHABLE_KEY`, `VITE_API_BASE`, `VITE_SENTRY_DSN`, `VITE_STRIPE_PUBLISHABLE_KEY`, `VITE_TURNSTILE_SITE_KEY`

### 4.3 API + worker on VPS
- Folder: `/opt/cutflow/` (matches `/opt/podair/` pattern)
- `.env` file at `/opt/cutflow/.env` — owner root, mode 600 (per `feedback_ascend_no_paren_stripping_linter.md`-level discipline)
- Compose project name `-p cutflow` to namespace from PodAir/TightSlice
- `scripts/deploy.sh` — rsync `apps/api` and `apps/worker` to VPS, `docker compose -p cutflow build --no-cache api worker`, `up -d --force-recreate api worker`, run Alembic migrations, `nginx -s reload` after API recreate (per `session-2026-04-10-round3-boto3-s3-SHIPPED.md` lesson — nginx upstream cache holds old IP otherwise)

### 4.4 Secrets to populate before launch
| Secret | Source |
| --- | --- |
| `DATABASE_URL` | postgres in compose, generated 48-char password |
| `REDIS_URL` | redis://cutflow_redis:6379/0 |
| `CLERK_SECRET_KEY` | Clerk production instance |
| `CLERK_WEBHOOK_SECRET` | Clerk dashboard → Webhooks |
| `STRIPE_SECRET_KEY` | Stripe live mode |
| `STRIPE_WEBHOOK_SECRET` | Stripe dashboard → Webhooks |
| `STRIPE_PRICE_PRO`, `STRIPE_PRICE_STUDIO` | Stripe price IDs |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` | Cloudflare R2 |
| `R2_BUCKET` | `cutflow-prod` |
| `RESEND_API_KEY` | Resend dashboard |
| `RESEND_AUDIENCE_ID` | Resend audience for waitlist |
| `SENTRY_DSN_API`, `SENTRY_DSN_WORKER` | Sentry project |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile |

### 4.5 Smoke test (`scripts/smoke-test.sh`)
Mirrors PodAir's 13-point smoke pattern. Must all pass before announcing GA:
1. `curl -fsS https://cutflow.ai` → 200, HTML contains "CutFlow"
2. `curl -fsS https://api.cutflow.ai/v1/health` → `{ ok: true, db: ok, redis: ok, r2: ok }`
3. Clerk sign-up flow → user row inserted via webhook
4. Stripe Checkout → fake card 4242 → subscription created → user.plan_tier = 'pro'
5. `POST /v1/waitlist` with new email → row inserted, Resend audience updated
6. Project create → audio upload (small test mp3) → probe + beats fire, beat_grid populated
7. Clip upload (3 small mp4s) → score_clips fires, motion_score populated
8. Render with edit_style=staircase → render_jobs row created, output mp4 in R2
9. Download presigned URL → 200, plays in browser
10. Free tier hit at project #4 → 402 with upgrade message
11. Audio > 5 min on Free → 400 with tier message
12. Sentry event from forced error → appears in Sentry dashboard
13. Worker autoheal — kill `cutflow_worker` container, verify Docker restarts it within 30s

### 4.6 CI/CD
- `.github/workflows/ci.yml` — lint (ruff + eslint), typecheck (mypy + tsc), tests (pytest + vitest) on PR
- `.github/workflows/deploy.yml` — on push to `main`: build, test, then SSH+rsync to VPS, run `scripts/deploy.sh`, run smoke-test, post to Slack (or just log)
- Use `appleboy/ssh-action` (PodAir pattern). Store `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY` as repo secrets

**Critical files created in Phase 4:**
- `scripts/deploy.sh`, `scripts/smoke-test.sh`, `scripts/migrate.sh`
- `.github/workflows/ci.yml`, `.github/workflows/deploy.yml`
- `infra/compose/docker-compose.prod.yml`
- `infra/nginx/cutflow.conf`

---

## Phase 5 — Out of scope for v1 (deliberately not building)

| Feature | Why deferred | Phase |
| --- | --- | --- |
| Adobe Premiere Pro plugin | Separate CEP/UXP project + Adobe Developer signing | v2 |
| DaVinci Resolve plugin | Lua/DCTL scripting + Blackmagic SDK | v3 |
| Final Cut Pro plugin | FxPlug + Apple Developer cert | v3 |
| BRAW ingest | Blackmagic SDK license (real legal/commercial project) | v2.5 |
| MXF / ProRes ingest | FFmpeg supports both but needs hardware-accel testing + storage cost modeling | v1.5 |
| Context-aware Vision API analysis | $$ at scale; v1 uses motion-score heuristic | v2 |
| Team collaboration / multi-seat | Studio tier sells now, feature lands later | v1.5 |
| API access for Studio tier | OAuth scopes + rate limits + docs | v2 |
| Real-time browser timeline preview | WebCodecs feasible but slow build | v2 |
| Mobile apps | Web is responsive — native is post-PMF | v3+ |

---

## Reused patterns from your existing codebases

These save weeks vs. building from scratch:

- **Clerk auth flow + JWT verification** → copy from PodAir `apps/api/src/lib/auth.ts` + `apps/web/lib/auth.ts`
- **Stripe Checkout + webhook handler** → copy from PodAir `apps/api/src/routes/v1.ts` Stripe section
- **Deploy script (rsync + docker rebuild + nginx reload)** → copy from PodAir `scripts/deploy.sh` (already has the `nginx -s reload after api recreate` lesson baked in)
- **R2 / S3 presigned multipart upload** → adapt from PodAir's chunked-upload pattern in `apps/web/lib/chunkQueue.ts` + `/v1/sessions/:id/chunks/*`
- **RQ worker bootstrap + Sentry integration** → copy from GMLX `backend/worker.py` (and apply the Round 4 lesson: workers MUST `sentry_sdk.init(integrations=[RqIntegration()])`)
- **FastAPI structure** → copy GMLX `backend/` skeleton
- **Resend transactional email** → copy from Ascend lead-capture endpoint
- **Nginx server block + Let's Encrypt termination** → copy from PodAir nginx config
- **Cloudflare Turnstile on public POST** → copy from Ascend lead capture
- **Boto3 timeouts (`connect_timeout=5, read_timeout=30, tcp_keepalive=True`)** — REQUIRED on R2 client. Skip this and we recreate the 7-hour GMLX outage from 2026-04-10.

---

## Cost model

**Pre-revenue monthly fixed costs:**
| Line item | Cost |
| --- | --- |
| .ai domain | ~$5 |
| VPS 72.60.112.155 | $0 marginal (shared) |
| Cloudflare R2 (pre-launch storage) | $0-5 |
| Cloudflare Pages, DNS, Turnstile | $0 |
| Postgres + Redis (in Docker on VPS) | $0 |
| Clerk (up to 10K MAU) | $0 |
| Stripe | $0 fixed, 2.9% + 30¢ per txn |
| Resend (up to 100/day) | $0 |
| Sentry (up to 5K errors/mo) | $0 |
| **Total fixed pre-revenue** | **~$5/month** |

**Variable when users start using it:**
- R2 storage: $0.015/GB/mo; if avg user has 5 GB and we have 1,000 users = $75/mo
- R2 ops: negligible
- Compute: free (CPU on existing VPS) until you outgrow it (~500+ concurrent renders)
- Email: $20/mo once Resend free tier exhausted
- Sentry paid tier: $26/mo if errors > 5K/mo

**First real cost spike comes from GPU workloads.** v1 uses CPU-only (librosa, PySceneDetect, OpenCV optical flow, FFmpeg). When v2 adds Vision-API context analysis, expect $50-300/mo in OpenAI/Anthropic costs. When/if we self-host a CLIP model for clip context, we need GPU compute on RunPod (~$0.40-0.80/hr per worker).

---

## Realistic timeline (single dev, focused, 5-week sprint)

| Week | Focus | Exit criteria |
| --- | --- | --- |
| **1** | Phase 0 legal scrub + Phase 1 repo scaffold + Phase 2.1-2.3 (FastAPI skeleton + Clerk auth + DB migrations) | Sign up via Clerk → user row exists → `GET /v1/me` returns it |
| **2** | Phase 2.4-2.7 (Stripe + R2 + waitlist + Sentry + observability) | Pay $29 with test card → plan_tier flips to 'pro' → upload a small audio file to R2 successfully |
| **3** | Phase 3.1-3.2 (worker scaffold + probe + beats + score_clips jobs) | Upload audio → beats detected and stored. Upload 3 clips → motion scores stored. |
| **4** | Phase 3.2 cont. + 3.3 (render job + Editor dashboard UI) | End-to-end: upload audio + clips → click Render Staircase → MP4 downloads, audio is beat-synced to cuts |
| **5** | Phase 4 (deploy + DNS + smoke test + CI/CD) + Phase 0/1 polish | All 13 smoke tests pass on production. cutflow.ai live. Stripe live mode. |

Buffer 1 week for the inevitable surprises (Stripe webhook signature issues, R2 CORS, Clerk webhook ordering, FFmpeg quirks on the specific Docker image).

---

## Verification (how we'll know it works)

End-to-end test script (`scripts/smoke-test.sh`):
1. **Auth round-trip:** create test user via Clerk API → call `GET /v1/me` with JWT → row returned with `plan_tier=free`
2. **Payments round-trip:** create checkout session → simulate webhook with `customer.subscription.created` payload → user `plan_tier=pro`
3. **Upload round-trip:** request presigned URLs → upload test audio (`samples/test-track.mp3`) + 3 test clips → call `/upload-complete` → probe job dispatched → assert rows in DB
4. **AI pipeline round-trip:** poll `GET /v1/projects/:id` → beat_grid populated within 60s → motion_score populated within 60s
5. **Render round-trip:** POST `/v1/projects/:id/render?style=staircase` → poll until `render_jobs.status=complete` → fetch presigned output URL → `ffprobe` confirms duration matches audio + has video stream
6. **Tier gating:** create 4th project on Free → expect 402 response
7. **Watermark check on Free:** download output → frame extract → assert watermark text exists (via OCR or pixel sample)
8. **Sentry plumbing:** force an error → assert event reaches Sentry dashboard (via Sentry API)

Manual UAT checklist (Kasey):
- Marketing site renders, no fabricated stats remain, no Devin Huynh references anywhere
- Waitlist form actually captures emails (check Resend audience)
- Sign up → sign in → upload → render → download MP4
- Pay → upgrade → unlimited projects unlocked
- Cancel subscription → downgrade at period end (verify via Stripe portal)
- Mobile responsive on iPhone 14 Pro viewport (393px)
- All legal pages reachable from footer
- Lighthouse score ≥ 90 on marketing pages

---

## Risks & open items

1. **Founder portrait file** — need to confirm whose face is actually on `/founder-portrait.jpg`. If it's Devin Huynh's, it must come out today regardless of build phase. If it's a stock photo or Kasey, no action needed.
2. **`.ai` domain** — does Kasey already own `cutflow.ai`? If not, check availability + budget.
3. **Stripe live mode requires** — verified business, public Terms/Privacy/Refund URLs, support email, physical address (can be P.O. box). All in Phase 0.4.
4. **Clerk webhook + Stripe webhook ordering race** — what if Clerk webhook lands AFTER first Stripe webhook? Use idempotent upserts on `users(clerk_user_id)`.
5. **FFmpeg in worker container** — Debian-slim base + `apt install ffmpeg` adds ~200 MB to image. Consider `linuxserver/ffmpeg` base instead for smaller image.
6. **Edit-style algorithms need tuning** — Staircase + Random will produce passable but not great cuts on first pass. Plan a week post-MVP for algorithm iteration based on test footage.
7. **kimi.page source export** — if Kasey can't actually export the source from his kimi workspace, fallback is to rebuild Editor/Intelligence/About from scratch using the marketing spec (adds ~3 days to Week 1).
8. **Watermark UX** — Free users will hate the watermark but that's the conversion lever. Test pricing page conversion before vs. after committing to watermark approach.

---

## Critical files / paths (one-glance reference)

**To modify:**
- `apps/web/src/pages/Home.tsx` (legal scrub + form wire-up)
- `apps/web/src/pages/Editor.tsx`, `Intelligence.tsx`, `About.tsx` (rebuild or scrub)
- `apps/web/src/components/Navbar.tsx` (fix routing)
- `apps/web/src/components/about/FounderStory.tsx` (delete or rewrite)
- `apps/web/public/founder-portrait.jpg` (delete or replace)

**To create:**
- `apps/api/` (full FastAPI service — ~30 files)
- `apps/worker/` (full RQ worker — ~12 files)
- `infra/compose/docker-compose.yml` + `docker-compose.prod.yml`
- `infra/nginx/cutflow.conf`
- `scripts/{deploy,smoke-test,migrate}.sh`
- `.github/workflows/{ci,deploy}.yml`
- `apps/web/src/pages/legal/{Terms,Privacy,Refund,DMCA,AUP}.tsx`
- `apps/web/src/pages/Dashboard.tsx`, `Pricing.tsx` (if not in kimi export)
- `apps/web/src/components/editor/*.tsx` (Upload, Stepper, Style picker, etc.)

**To reference (do not modify — for pattern copying):**
- `/Users/kvimedia/podar-1/apps/api/src/` (Clerk + Stripe + S3 patterns)
- `/Users/kvimedia/podar-1/scripts/deploy.sh`
- `/Users/kvimedia/audio/backend/` (FastAPI + RQ + librosa-adjacent patterns)
- `/Users/kvimedia/podar-1/infra/compose/` (nginx + compose layout)

---

## Definition of done

CutFlow v1 ships when **all** of these are true:
- [ ] Phase 0 legal scrub complete (no Huynh, no fabricated stats, legal pages live)
- [ ] cutflow.ai resolves to the marketing site with working sign-in
- [ ] `api.cutflow.ai/v1/health` returns 200 with all subsystems ok
- [ ] User can sign up, upload audio + clips, render, and download an MP4 with beat-synced cuts
- [ ] User can pay $29 and unlock unlimited projects + 4K + no watermark
- [ ] Stripe webhook is verified-signature + idempotent
- [ ] All 13 smoke tests green in CI
- [ ] Sentry receives events from frontend + API + worker
- [ ] Waitlist captures emails and adds to Resend audience
- [ ] Free-tier limits enforced server-side (not just UI)
- [ ] No Lighthouse errors on marketing pages
- [ ] Mobile responsive on iPhone 14 Pro viewport
- [ ] Deploy is one command (`./scripts/deploy.sh`) and rolls back on smoke-test failure
- [ ] Kasey has manually tested the end-to-end flow and signed off
