# Deployment Secrets Guide

Do not commit real secrets to GitHub and do not share them inside ZIP files.

## Vercel - Frontend Environment Variables

Add these in Vercel Project Settings -> Environment Variables:

```env
NEXT_PUBLIC_SITE_URL=https://my-portfolio-lake-one.vercel.app
NEXT_PUBLIC_CONTACT_API_URL=https://YOUR_RENDER_BACKEND_URL/api/contact
NEXT_PUBLIC_ENABLE_TURNSTILE=true
NEXT_PUBLIC_TURNSTILE_SITE_KEY=YOUR_CLOUDFLARE_TURNSTILE_SITE_KEY
NEXT_PUBLIC_GITHUB_URL=https://github.com/nikhilwabale
NEXT_PUBLIC_LINKEDIN_URL=https://www.linkedin.com/in/nikhil-wabale
NEXT_PUBLIC_X_URL=
```

## Render - Backend Environment Variables

Add these in Render Backend Service -> Environment:

```env
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://0.0.0.0:8080
AllowedOrigins=https://my-portfolio-lake-one.vercel.app
ConnectionStrings__DefaultConnection=Host=YOUR_NEON_HOST;Database=neondb;Username=neondb_owner;Password=YOUR_NEON_PASSWORD;SSL Mode=Require
Turnstile__SecretKey=YOUR_CLOUDFLARE_TURNSTILE_SECRET_KEY
Turnstile__SiteKey=YOUR_CLOUDFLARE_TURNSTILE_SITE_KEY
Resend__ApiKey=YOUR_RESEND_API_KEY
Resend__FromEmail=onboarding@resend.dev
Resend__ToEmail=wablenikhil2000@gmail.com
Email__ApiKey=YOUR_RESEND_API_KEY
Email__FromEmail=onboarding@resend.dev
Email__ToEmail=wablenikhil2000@gmail.com
Security__RequireTurnstileInProduction=true
Security__EnableTurnstileInDevelopment=false
```

## Local testing

Copy:

```txt
frontend/.env.local.example -> frontend/.env.local
```

For local testing, keep:

```env
NEXT_PUBLIC_ENABLE_TURNSTILE=false
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
```

Use .NET user secrets or a local-only uncommitted config file for backend secrets.
