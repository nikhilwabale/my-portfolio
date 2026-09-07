# Deployment

How this portfolio site actually gets from a `git push` to production, and how to verify it
worked. Written as a handoff document, not a tutorial - if you're picking this project up cold,
this is what you need to know to deploy it, debug a failed deploy, or hand it to someone else.

## Architecture

```
                          ┌─────────────────────┐
  Browser  ─────────────► │  Vercel (frontend)   │
                          │  Next.js, static      │
                          └──────────┬───────────┘
                                     │ POST /api/contact
                                     ▼
                          ┌─────────────────────┐        ┌──────────────┐
                          │  Render (backend)     │──────► │ Resend       │  (email)
                          │  Spring Boot, Docker   │        └──────────────┘
                          └──────────┬───────────┘        ┌──────────────┐
                                     │                     │ Cloudflare   │  (captcha,
                                     │ JDBC                │ Turnstile    │   verified
                                     ▼                     └──────────────┘   server-side)
                          ┌─────────────────────┐
                          │  Neon (Postgres)      │
                          └─────────────────────┘

  GitHub push (main) ──► GitHub Actions: test → docker-build (smoke test) → deploy hook ──► Render
                     └──► Vercel's own GitHub integration ─────────────────────────────────► Vercel
```

Two independent deploy paths trigger off the same `main` branch:

- **Backend (Render)**: gated by GitHub Actions. Render's own `autoDeploy` is deliberately
  **off** - see [render.yaml](render.yaml)'s comment for why - so a push to `main` only reaches
  Render after all 51 backend tests pass and a real `docker compose` smoke test (build the image,
  boot it against a real Postgres, poll `/health` and `/health/db`) succeeds.
- **Frontend (Vercel)**: Vercel's own native GitHub integration deploys independently on every
  push, using its own build (`next build`) as the only gate. There's no custom CI step for the
  frontend in this repo - Vercel's build failing a deploy already is the equivalent gate.

## One-time setup

Do this once per environment (or once, ever, if you're not recreating it from scratch).

### 1. Neon (database)

1. Create a project at [neon.tech](https://neon.tech) (free tier).
2. Copy the connection string it gives you - the `postgres://user:pass@host/db?sslmode=require`
   form. You'll paste this as `DATABASE_URL` in Render below, unchanged.
3. Nothing else to do here. The schema is created automatically on first startup
   (`spring.jpa.hibernate.ddl-auto=update` in `application.yml`) - see
   `database/NeonPostgreSQL.sql` at the repo root if you want to inspect or hand-create it instead.

### 2. Render (backend)

1. New service → connect this GitHub repo → Render should detect `render.yaml` and offer to
   apply it as a Blueprint. If it doesn't, create a **Web Service**, runtime **Docker**, root
   directory `backend/portfolio-api`, Dockerfile path `./Dockerfile`, plan **Free**.
2. Set the three secrets `render.yaml` deliberately leaves out (`sync: false` means "you set this
   by hand, it's never written into the repo"):
   - `DATABASE_URL` - the Neon connection string from step 1.
   - `TURNSTILE_SECRET_KEY` - from Cloudflare, step 5 below.
   - `RESEND_API_KEY` - from Resend, step 6 below.
3. **Get the Deploy Hook URL**: Service → Settings → Deploy Hook → copy the URL. This is what
   GitHub Actions calls to actually trigger a deploy, since `autoDeploy` is off.
4. Note the service's public URL (e.g. `https://my-portfolio-api.onrender.com`) - you'll need it
   for Vercel's `NEXT_PUBLIC_CONTACT_API_URL` below.

### 3. GitHub Actions secret

Repo → Settings → Secrets and variables → Actions → New repository secret:

- Name: `RENDER_DEPLOY_HOOK_URL`
- Value: the Deploy Hook URL from Render, step 2.3 above.

Without this, the `deploy` job in `.github/workflows/ci-cd.yml` fails immediately with a clear
error rather than silently doing nothing - check the Actions tab if a push to `main` doesn't
result in a Render deploy.

### 4. Vercel (frontend)

1. New project → import this GitHub repo → set the root directory to `frontend/`.
2. Environment variables (Project Settings → Environment Variables):

   | Variable | Value |
   |---|---|
   | `NEXT_PUBLIC_SITE_URL` | Your production URL, e.g. `https://my-portfolio-lake-one.vercel.app` |
   | `NEXT_PUBLIC_CONTACT_API_URL` | Render's URL + `/api/contact`, e.g. `https://my-portfolio-api.onrender.com/api/contact` |
   | `NEXT_PUBLIC_ENABLE_TURNSTILE` | `true` |
   | `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | From Cloudflare, step 5 below |
   | `NEXT_PUBLIC_GITHUB_URL`, `NEXT_PUBLIC_LINKEDIN_URL`, `NEXT_PUBLIC_X_URL` | Your profile links |

3. Vercel deploys automatically from here on - no further setup.

### 5. Cloudflare Turnstile (captcha)

1. [Cloudflare dashboard](https://dash.cloudflare.com) → Turnstile → Add widget.
2. Domain: your Vercel production domain. Widget mode: Managed (or Invisible, if you prefer).
3. You get a **Site Key** (public, goes in Vercel's `NEXT_PUBLIC_TURNSTILE_SITE_KEY`) and a
   **Secret Key** (goes in Render's `TURNSTILE_SECRET_KEY` - never in the frontend).

### 6. Resend (email)

1. [resend.com](https://resend.com) → API Keys → create one → this is `RESEND_API_KEY` on Render.
2. Sender address: `onboarding@resend.dev` works out of the box for testing (Resend's shared
   sandbox domain) and is already the default for `RESEND_FROM_EMAIL`. To send from your own
   domain, verify it under Resend → Domains first, then set `RESEND_FROM_EMAIL` to an address on
   that domain.

## Ongoing deploy flow

Once the above is done, deploying is just:

```bash
git push origin main
```

What happens next:

1. GitHub Actions' `test` job runs the full 51-test suite on Java 21.
2. If that passes, `docker-build` builds the real Dockerfile via `docker compose up --build`,
   boots it against a real Postgres container, and polls `/health` then `/health/db` until both
   respond - this is the same `docker-compose.yml` a contributor would use locally, so it's
   proof the local dev setup and the CI environment agree, not two configs that could drift apart.
3. If that passes and the branch is `main`, `deploy` POSTs to the Render Deploy Hook.
4. Render pulls the latest commit, builds the Docker image itself (Render does its own build from
   source - the image built in step 2 was for verification, it isn't pushed anywhere Render pulls
   from), and replaces the running container once the new one passes Render's own health check.
5. Vercel, independently, builds and deploys the frontend from the same push.

Watch it happen: GitHub repo → Actions tab (backend pipeline) and Vercel dashboard → Deployments
(frontend), in parallel.

## Verifying a deploy

```bash
curl https://my-portfolio-api.onrender.com/health
curl https://my-portfolio-api.onrender.com/health/db
```

`/health` confirms the process is up; `/health/db` confirms it can actually reach Neon (a 503
here with everything else green usually means `DATABASE_URL` is wrong or Neon's connection limit
was hit, not that the deploy itself failed). Then load the live site and submit the contact form
once - a successful submission confirms Turnstile, the database write, and Resend are all wired
correctly end to end, not just individually reachable.

**Render's free tier spins down after inactivity.** The first request after a period of no
traffic can take 10-30 seconds while the container cold-starts - this is expected, not a broken
deploy. `/health` is a reasonable target for an external uptime monitor (e.g. UptimeRobot,
Better Uptime) specifically because periodic pings keep the service warm; point it at `/health`
rather than `/health/db` for that purpose, so a transient Neon blip doesn't page you for something
a retry would resolve on its own.

## Rollback

Render keeps previous deploys: Service → Events (or Deploys) → find the last good one → "Rollback
to this deploy". This reverts the running container immediately without needing a new git push or
CI run - use it first if a bad deploy needs to come down fast, then fix forward on `main` at
normal pace. Vercel has the equivalent under its own Deployments list → "Promote to Production" on
any earlier deployment.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| GitHub Actions `deploy` job fails immediately with a clear `::error::` about the secret | `RENDER_DEPLOY_HOOK_URL` isn't set - see one-time setup, step 3. |
| `docker-build` job times out waiting for `/health` | Check the job's "Show container logs on failure" step - usually a missing/wrong `DATABASE_URL` in `docker-compose.yml` (unlikely to change) or a genuine startup regression the test job didn't catch. |
| Render deploy succeeds but `/health/db` returns 503 | `DATABASE_URL` on Render is wrong, expired, or Neon's compute is suspended (Neon's free tier auto-suspends after inactivity and wakes on the next connection - the first request after a long idle period may be slow rather than actually broken). |
| Contact form submits but no email arrives | Check Render's logs for `ResendEmailService` warnings - most often `RESEND_API_KEY` is missing/wrong, or `RESEND_FROM_EMAIL` isn't a verified sender. The message is still saved to the database either way; check there before assuming data was lost. |
| Contact form always says "Security verification failed" | `TURNSTILE_SECRET_KEY` on Render doesn't match the `NEXT_PUBLIC_TURNSTILE_SITE_KEY` on Vercel - they have to be the site/secret pair from the same Cloudflare Turnstile widget. |
| CORS errors in the browser console | `CORS_ALLOWED_ORIGINS` on Render doesn't include the exact Vercel domain the request is coming from (including scheme, no trailing slash). |
