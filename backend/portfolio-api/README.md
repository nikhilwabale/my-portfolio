# Portfolio API

Spring Boot backend for [nikhilwabale.dev](https://nikhilwabale.dev)'s contact form. A Java
migration of the project's original ASP.NET Core backend, kept behaviorally identical from the
frontend's point of view: same endpoints, same JSON response shape, same validation rules.

## Tech stack

- **Java 21** (LTS), **Spring Boot 4.1.1** / Spring Framework 7
- **Spring Data JPA** + **Npgsql/Postgres** (Neon, serverless Postgres) for persistence
- **Bean Validation** (Jakarta Validation / Hibernate Validator) for request validation
- **Bucket4j** for in-memory, per-IP rate limiting
- **springdoc-openapi** for Swagger UI (dev only)
- **Java's built-in `java.net.http.HttpClient`** for outbound calls to Resend and Cloudflare
  Turnstile - no HTTP client framework dependency needed
- **JUnit 5 + Mockito + AssertJ** for unit tests, **Spring Boot Test + H2** for integration tests

## Architecture

Standard layered structure, constructor injection throughout:

```
controller/   HTTP endpoints (ContactController, HealthController)
service/      Business logic behind interfaces (EmailService, TurnstileService)
service/impl/ Concrete implementations (ResendEmailService, TurnstileServiceImpl)
repository/   Spring Data JPA repository (ContactMessageRepository)
entity/       JPA entity mapped onto the existing Postgres schema (ContactMessage)
dto/          Request/response records (ContactRequest, ContactResponse, ErrorResponse)
config/       Configuration classes (CORS, DataSource, HttpClient beans, OpenAPI, *Properties)
filter/       Servlet filters (RateLimitFilter, SecurityHeadersFilter)
exception/    GlobalExceptionHandler - consistent {success, message} JSON for every error path
util/         StringSanitizer
```

`ContactMessage` maps onto the `ContactMessages` table exactly as the original ASP.NET Core/EF
Core backend created it (`database/NeonPostgreSQL.sql` at the repo root) - the schema was not
altered as part of this migration.

## Prerequisites

- Java 21 (a JDK, not just a JRE)
- No local Maven install needed - use the bundled wrapper (`./mvnw` / `mvnw.cmd`)
- A Neon PostgreSQL connection string (or any reachable Postgres instance) for anything beyond
  running the test suite, which uses an in-memory H2 database instead

## Environment variables

None of these are committed anywhere - set them as real OS/shell environment variables, or in
your IDE's run configuration. Copy `.env.example` to `.env` for local reference only; Spring Boot
does not auto-load `.env` files.

| Variable | Required | Purpose |
|---|---|---|
| `SPRING_PROFILES_ACTIVE` | No (defaults to no profile / dev-like behavior) | `dev` locally, `prod` on Render. Controls Swagger UI availability and whether Turnstile verification is enforced. |
| `DATABASE_URL` | Yes, outside tests | Neon's `postgres://user:pass@host/db?sslmode=require` connection string, used as-is - `DataSourceConfig` converts it to a JDBC URL at startup. |
| `CORS_ALLOWED_ORIGINS` | No (defaults to `http://localhost:3000` + the production Vercel URL) | Comma-separated list of origins allowed to call the API. |
| `TURNSTILE_SITE_KEY` | No (frontend-only value, unused by the backend) | Present for parity with the frontend's `.env`; the backend only needs the secret key. |
| `TURNSTILE_SECRET_KEY` | Yes in production, or when `security.enable-turnstile-in-development=true` | Cloudflare Turnstile secret key used to verify captcha tokens server-side. |
| `RESEND_API_KEY` | Yes, to actually send email (the endpoint still works and saves messages without it) | Resend API key. |
| `RESEND_FROM_EMAIL` | No (defaults to `onboarding@resend.dev`) | Sender address for the notification email. |
| `RESEND_TO_EMAIL` | No (defaults to the site owner's inbox) | Where the notification email is delivered. |

Each of these is readable both as a flat env var (`RESEND_API_KEY`) and as structured config
(`resend.api-key` in `application.yml`) via Spring's relaxed property binding - no manual
fallback chain needed.

## Running locally

```bash
export DATABASE_URL="postgres://user:pass@your-neon-host/neondb?sslmode=require"
./mvnw spring-boot:run
```

This runs with no active profile, which behaves like `dev`: Swagger UI is available at
`http://localhost:8080/swagger-ui.html`, and Turnstile verification is bypassed unless
`SECURITY_ENABLE_TURNSTILE_IN_DEVELOPMENT=true` is set.

To exercise the full production-like path locally (Turnstile enforced, Swagger disabled):

```bash
export SPRING_PROFILES_ACTIVE=prod
export TURNSTILE_SECRET_KEY="your-secret-key"
./mvnw spring-boot:run
```

## Running tests

```bash
./mvnw test
```

The suite (51 tests) needs no external services or database - `ContactControllerIntegrationTest`
runs against a real embedded Tomcat and an in-memory H2 database (Postgres-compatibility mode),
with `EmailService`/`TurnstileService` swapped for Mockito mocks so no real network calls reach
Resend or Cloudflare.

## API

| Endpoint | Method | Notes |
|---|---|---|
| `/api/contact` | `POST` | Rate-limited to 3 requests/hour per IP. Honeypot (`website` field), captcha and Bean Validation are checked in that order before anything is persisted. |
| `/health` | `GET` | Liveness check. |
| `/health/db` | `GET` | Returns 503 if the database is unreachable. |
| `/swagger-ui.html`, `/v3/api-docs` | `GET` | Dev-profile only. |

Validation rules on `POST /api/contact` mirror the frontend's Zod schema
(`frontend/src/components/sections/Contact.tsx`) field for field, including trimming
name/email/subject/message *before* checking their length, so a value the frontend would reject
can't slip past the API by whitespace-padding it.

## Docker

```bash
# From the repo root - builds the backend and starts it against a local Postgres:
docker compose up --build

# Backend: http://localhost:7000 (health: /health, /health/db)
# Stop and remove containers (add -v to also drop the local Postgres volume):
docker compose down
```

The `Dockerfile` here is a multi-stage build (JDK to compile, a slim `eclipse-temurin` JRE-alpine
image to run) with JVM flags tuned for Render's free-tier 512MB container limit - capped heap
(`-XX:MaxRAMPercentage=50`), Serial GC over G1, C1-only JIT, and small Tomcat/HikariCP pools to
match (`server.tomcat.threads.max=10`, `DataSourceConfig`'s pool size of 3). See the Dockerfile's
own comments for the reasoning behind each flag, and the repo root's `DEPLOYMENT.md` for how this
image actually gets to Render in production.
