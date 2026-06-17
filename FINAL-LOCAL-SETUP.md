# Final Local Setup

1. Create `frontend/.env.local` by copying `frontend/.env.local.example`.
2. Add backend secrets locally using user secrets or an uncommitted local file.
3. Start backend:

```bash
cd backend/PortfolioAPI
dotnet restore
dotnet build
dotnet run
```

Expected backend URL:

```txt
http://localhost:7000
```

4. Start frontend:

```bash
cd frontend
npm install
npm run dev
```

Expected frontend URL:

```txt
http://localhost:3000
```

5. Test contact form locally with Turnstile disabled.
6. Test Turnstile only after deployment by enabling it in Vercel and Render environment variables.
