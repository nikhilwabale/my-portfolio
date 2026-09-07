# Nikhil Wabale Portfolio

Personal portfolio site: a Next.js frontend with a Spring Boot backend behind its contact form.

```txt
Frontend  -> Next.js 16 / React 19, deployed on Vercel
Backend   -> Spring Boot 4 (Java 21), deployed on Render as a Docker container
Database  -> Neon (serverless Postgres)
Captcha   -> Cloudflare Turnstile (verified server-side)
Email     -> Resend
CI/CD     -> GitHub Actions (test -> docker smoke test -> deploy to Render)
```

Live: [nikhilwabale.dev](https://my-portfolio-lake-one.vercel.app)

## Folder structure

```txt
frontend/                  Next.js portfolio site
backend/portfolio-api/     Spring Boot backend (contact form API)
backend/PortfolioAPI/      Retired ASP.NET Core backend - superseded by backend/portfolio-api/,
                            kept only for reference during the migration
database/                  Postgres schema reference (Neon self-provisions this on startup)
docker-compose.yml         Local dev: backend + a throwaway Postgres (frontend/Neon stay external)
render.yaml                Render Blueprint for the backend
.github/workflows/         CI/CD pipeline (test, docker build/smoke-test, deploy)
DEPLOYMENT.md              Full production deployment flow, one-time setup, troubleshooting
```

## Local development

**Frontend** (needs the backend running somewhere - see below):

```bash
cd frontend
pnpm install
cp .env.local.example .env.local   # then edit NEXT_PUBLIC_CONTACT_API_URL if needed
pnpm dev                            # http://localhost:3000
```

**Backend** - either directly with Java, or via Docker:

```bash
# Directly (needs a Postgres connection string, e.g. from Neon):
cd backend/portfolio-api
cp .env.example .env                # then fill in DATABASE_URL - loaded automatically, no export needed
./mvnw spring-boot:run              # http://localhost:8080

# Or via Docker, against a local throwaway Postgres (no Neon needed):
docker compose up --build           # http://localhost:7000
```

See [backend/portfolio-api/README.md](backend/portfolio-api/README.md) for environment variables,
running tests, and the API surface in detail.

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for the full flow: one-time account setup across Vercel,
Render, Neon, Cloudflare and Resend; what happens on every push to `main`; how to verify a deploy;
rollback; and troubleshooting.

## Security

No secrets are committed anywhere in this repo - see `.env.example` files for the variable names
each service needs, and `DEPLOYMENT.md` for where each one actually gets set (GitHub secrets,
Render dashboard, Vercel dashboard).
