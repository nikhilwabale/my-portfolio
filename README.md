# Nikhil Wabale Portfolio - Vercel + Render + Neon Final Build

This build is prepared for the deployment plan below:

```txt
Frontend  -> Vercel
Backend   -> Render Web Service using Docker
Database  -> Neon PostgreSQL
Captcha   -> Cloudflare Turnstile
Email     -> Resend
```

## Current frontend URL

```txt
https://my-portfolio-lake-one.vercel.app
```

## Folder structure

```txt
frontend/                 Next.js portfolio frontend
backend/PortfolioAPI/     ASP.NET Core 8 Web API backend
database/                 PostgreSQL scripts for Neon
render.yaml               Optional Render Blueprint file
```

## What is fixed in this version

- Backend is migrated from SQL Server to PostgreSQL for Neon.
- `UseSqlServer(...)` is replaced with `UseNpgsql(...)`.
- PostgreSQL provider package is used: `Npgsql.EntityFrameworkCore.PostgreSQL`.
- Dockerfile is added for Render deployment.
- `/health` endpoint is added for API uptime testing.
- `/health/db` endpoint is added for Neon connection testing.
- Swagger is enabled at `/swagger`.
- Database startup no longer crashes the whole API when Neon is not configured; it logs the issue and the API still starts.
- Contact API returns a clean error if database save fails.
- Frontend environment examples are updated for Vercel + Render.
- Backend environment examples are updated for Neon + Turnstile + Resend.

## 1. Frontend on Vercel

Frontend is already deployed. In Vercel project settings, use these environment variables:

```env
NEXT_PUBLIC_SITE_URL=https://my-portfolio-lake-one.vercel.app
NEXT_PUBLIC_CONTACT_API_URL=https://your-render-api.onrender.com/api/contact
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_cloudflare_turnstile_site_key
```

After editing Vercel environment variables, redeploy the frontend.

## 2. Create Neon PostgreSQL Database

Create a Neon project and copy the connection string. Use the ADO.NET style connection string in Render:

```env
ConnectionStrings__DefaultConnection=Host=your-neon-host;Database=neondb;Username=neondb_owner;Password=your-password;SSL Mode=Require;Trust Server Certificate=true
```

The API calls `EnsureCreated()` on startup, so it can create the `ContactMessages` table automatically. An optional manual script is here:

```txt
database/NeonPostgreSQL.sql
```

## 3. Deploy Backend on Render

Create a Render Web Service from GitHub with these settings:

```txt
Name: my-portfolio-api
Language: Docker
Branch: main
Root Directory: backend/PortfolioAPI
Dockerfile Path: ./Dockerfile
Plan: Free
```

Add these Render environment variables:

```env
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://0.0.0.0:8080
ConnectionStrings__DefaultConnection=your_neon_connection_string
Cors__AllowedOrigins__0=https://my-portfolio-lake-one.vercel.app
TURNSTILE_SECRET_KEY=your_cloudflare_turnstile_secret_key
RESEND_API_KEY=your_resend_api_key
Email__FromEmail=onboarding@resend.dev
Email__ToEmail=wablenikhil2000@gmail.com
Security__RequireTurnstileInProduction=true
```

After deployment, test:

```txt
https://your-render-api.onrender.com/health
https://your-render-api.onrender.com/health/db
https://your-render-api.onrender.com/swagger
```

## 4. Cloudflare Turnstile

Create a Cloudflare Turnstile widget and add this domain:

```txt
my-portfolio-lake-one.vercel.app
```

Use:

```env
NEXT_PUBLIC_TURNSTILE_SITE_KEY=site_key_from_cloudflare
TURNSTILE_SECRET_KEY=secret_key_from_cloudflare
```

## 5. Resend Email

Create a Resend API key and add it in Render:

```env
RESEND_API_KEY=your_resend_api_key
Email__FromEmail=onboarding@resend.dev
Email__ToEmail=wablenikhil2000@gmail.com
```

For production with your own domain, verify your domain in Resend and replace `Email__FromEmail`.

## 6. Final Contact Form Test

1. Open the Vercel portfolio URL.
2. Submit the Contact form.
3. Confirm the frontend shows success.
4. Confirm a new row in Neon `ContactMessages`.
5. Confirm email notification in your inbox.

## Local frontend test

```bash
cd frontend
npm install
npm run build
npm run dev
```

## Local backend test

You need the .NET 8 SDK. Without a valid PostgreSQL/Neon connection string, `/health` works but contact form database save will fail.

```bash
cd backend/PortfolioAPI
dotnet restore
dotnet build
dotnet run
```

Then test:

```txt
https://localhost:7241/health
https://localhost:7241/swagger
```

If local backend tries to connect to `127.0.0.1:5432`, either start local PostgreSQL or use your Neon connection string in environment variables.


## Production Deployment

This version is ready for Vercel + Render Docker + Neon PostgreSQL + Cloudflare Turnstile + Resend.

See `DEPLOYMENT-SECRETS-GUIDE.md` for exact environment variables. Real keys are intentionally not hardcoded in the source code.
