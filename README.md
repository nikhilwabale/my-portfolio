# Nikhil Wabale Portfolio — Full Stack

This package contains:

- `frontend/` — Next.js 16, TypeScript, Tailwind CSS, Framer Motion portfolio UI
- `backend/PortfolioApi/` — ASP.NET Core 8 secure Contact API
- `database/` — SQL Server setup script

## Security included

- DTO validation and length limits
- SQL Server via EF Core parameterized queries
- Cloudflare Turnstile CAPTCHA support
- Honeypot spam field
- Fixed-window rate limiting on the contact endpoint
- CORS restricted to configured frontend URLs
- Proxy-safe IP handling with forwarded headers
- Security headers including CSP, frame deny, no-sniff and permissions policy
- Resend email failures are caught, logged and stored in SQL so the API does not crash if email quota/API is unavailable
- No SMTP/API credentials are stored in committed config files

No public website can be guaranteed impossible to hack, but this implementation is hardened for a portfolio/contact-form use case.

## Frontend setup

```bash
cd frontend
copy .env.example .env.local
npm install
npm run dev
```

Update `frontend/.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=https://localhost:7214
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_cloudflare_turnstile_site_key
NEXT_PUBLIC_CONTACT_CLIENT_KEY=portfolio-web-client
```

## Backend setup

```bash
cd backend/PortfolioApi
dotnet restore
dotnet run
```

Set secrets locally with environment variables or user-secrets:

```bash
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=(localdb)\\MSSQLLocalDB;Database=NikhilPortfolioDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True"
dotnet user-secrets set "Security:RequireCaptcha" "true"
dotnet user-secrets set "Turnstile:SecretKey" "your_turnstile_secret_key"
dotnet user-secrets set "Resend:ApiKey" "your_resend_api_key"
dotnet user-secrets set "Resend:ToEmail" "your-email@example.com"
```

## Database

Either run `database/create-database.sql` manually, or use EF Core migrations:

```bash
cd backend/PortfolioApi
dotnet tool install --global dotnet-ef
dotnet ef migrations add InitialCreate
dotnet ef database update
```
