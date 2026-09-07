import type { NextConfig } from 'next';

function backendOrigin(): string | null {
  const apiUrl = process.env.NEXT_PUBLIC_CONTACT_API_URL;
  if (!apiUrl) return null;
  try {
    return new URL(apiUrl).origin;
  } catch {
    return null;
  }
}

// Static (build-time) CSP - no middleware, so the homepage stays fully static and
// CDN-cacheable.
//
// script-src keeps 'unsafe-inline' deliberately: removing it requires per-request nonces
// (Next.js applies them to its own hydration scripts too, verified live), which forces
// dynamic rendering. Given this site never reflects user input into its own HTML (the
// contact form posts straight to the backend API, nothing user-supplied is ever rendered
// back into a page), the realistic exploitation path for that 'unsafe-inline' is negligible,
// and wasn't judged worth trading static hosting for.
//
// style-src keeps 'unsafe-inline' out of necessity, not preference: verified live via a
// headless-browser console check that Framer Motion sets the style="" attribute directly
// with per-animation-frame values (82 confirmed CSP violations with style-src 'self' alone).
// CSP has no nonce/hash mechanism that can allow-list a value that changes every frame, so
// there is no stricter alternative while this site uses Framer Motion for animation.
//
// script-src also adds 'unsafe-eval' in development only: Next.js/Turbopack + React's dev-mode
// debugging features (Fast Refresh, component stack traces) legitimately use eval() to build
// them, and Next.js's own dev server confirms this itself ("React will never use eval() in
// production mode") - so this is dev-tooling requiring it, not application code, and it's
// scoped out of the production policy entirely rather than loosened for everyone.
function buildCsp(isDev: boolean): string {
  const connectSrc = ["'self'", 'https://challenges.cloudflare.com', backendOrigin()]
    .filter(Boolean)
    .join(' ');

  const scriptSrc = isDev
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com"
    : "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com";

  return [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    `connect-src ${connectSrc}`,
    'frame-src https://challenges.cloudflare.com',
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    'upgrade-insecure-requests'
  ].join('; ');
}

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp']
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: buildCsp(process.env.NODE_ENV === 'development') },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' }
        ]
      }
    ];
  }
};

export default nextConfig;
