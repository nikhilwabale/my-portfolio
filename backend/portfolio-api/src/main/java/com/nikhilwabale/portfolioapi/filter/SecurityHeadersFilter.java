package com.nikhilwabale.portfolioapi.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Direct port of the old SecurityHeadersMiddleware. CSP still allows 'unsafe-inline' for
 * scripts/styles - tightening this without breaking Next.js hydration is tracked as a
 * Stage 3 security-hardening task, not changed here to keep Stage 1 behavior-preserving.
 */
@Component
public class SecurityHeadersFilter extends OncePerRequestFilter {

    private static final String CSP = "default-src 'self'; "
            + "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com; "
            + "frame-src https://challenges.cloudflare.com; "
            + "connect-src 'self' https://challenges.cloudflare.com; "
            + "img-src 'self' data: https:; "
            + "style-src 'self' 'unsafe-inline'; "
            + "frame-ancestors 'none'; "
            + "base-uri 'self'; "
            + "form-action 'self'";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        response.setHeader("X-Content-Type-Options", "nosniff");
        response.setHeader("X-Frame-Options", "DENY");
        response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
        response.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
        response.setHeader("Content-Security-Policy", CSP);
        chain.doFilter(request, response);
    }
}
