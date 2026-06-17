# Production Environment Variables

Do not commit real secrets to GitHub. Add them only in hosting dashboards.

## Vercel

NEXT_PUBLIC_SITE_URL=https://my-portfolio-lake-one.vercel.app
NEXT_PUBLIC_CONTACT_API_URL=https://YOUR_RENDER_BACKEND_URL/api/contact
NEXT_PUBLIC_ENABLE_TURNSTILE=true
NEXT_PUBLIC_TURNSTILE_SITE_KEY=YOUR_CLOUDFLARE_TURNSTILE_SITE_KEY
NEXT_PUBLIC_GITHUB_URL=https://github.com/nikhilwabale
NEXT_PUBLIC_LINKEDIN_URL=https://www.linkedin.com/in/nikhil-wabale-401678229
NEXT_PUBLIC_X_URL=

## Render

ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://0.0.0.0:8080
AllowedOrigins=https://my-portfolio-lake-one.vercel.app
ConnectionStrings__DefaultConnection=Host=YOUR_NEON_HOST;Database=neondb;Username=neondb_owner;Password=YOUR_NEON_PASSWORD;SSL Mode=Require
Turnstile__SecretKey=YOUR_CLOUDFLARE_TURNSTILE_SECRET_KEY
Resend__ApiKey=YOUR_RESEND_API_KEY
Resend__FromEmail=onboarding@resend.dev
Resend__ToEmail=wablenikhil2000@gmail.com
Email__ApiKey=YOUR_RESEND_API_KEY
Email__FromEmail=onboarding@resend.dev
Email__ToEmail=wablenikhil2000@gmail.com
