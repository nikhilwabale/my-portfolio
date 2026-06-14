# Security notes

## Contact API flow

1. Frontend validates fields with Zod.
2. Hidden honeypot blocks common bots.
3. Cloudflare Turnstile token is sent to the API.
4. API validates DTOs and custom request header.
5. API verifies Turnstile server-side.
6. Rate limiting is applied directly on the contact POST action.
7. Content is sanitized before persistence and email.
8. Message is saved to SQL Server before email sending.
9. Email provider failure is handled gracefully and logged.

## Production checklist

- Use HTTPS only.
- Set exact CORS origin, not `*`.
- Set `Security__RequireCaptcha=true`.
- Store secrets in Azure App Settings, Render secrets, Docker secrets or environment variables.
- Put the API behind Cloudflare or a reverse proxy with forwarded headers enabled.
- Keep .NET, Next.js and npm dependencies updated.
- Monitor logs for high rate-limit rejections or repeated honeypot hits.
