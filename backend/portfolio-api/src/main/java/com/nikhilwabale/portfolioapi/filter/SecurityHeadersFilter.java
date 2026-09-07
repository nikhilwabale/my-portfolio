package com.nikhilwabale.portfolioapi.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * This API only ever returns JSON - never HTML - so browsers never render its responses as
 * a document and never evaluate script-src/style-src/img-src/etc. against them (those only
 * apply to documents, not to fetch()/XHR response bodies). The original CSP here was a
 * direct port of the old SecurityHeadersMiddleware and inherited that middleware's frontend-
 * shaped policy (script-src/style-src 'unsafe-inline', a Cloudflare allowlist for a script
 * this API never loads) unchanged, which was inert rather than meaningfully permissive.
 * default-src 'none' is the correct, minimal policy for the JSON endpoints: they have no
 * inline-script/style exception to remove because they never needed one.
 *
 * Swagger UI (dev-only) is the one path that actually IS an HTML document the browser
 * renders, so it gets its own policy instead. Verified live in a real browser (not just
 * reading its static HTML shell, which looked inline-script-free but doesn't reflect what
 * the bundle does once it runs): its own JS never needed script-src leniency, but it does
 * apply inline styles at runtime and renders icons as data: URI SVGs, so those two specific
 * allowances are real requirements, not a guess.
 */
@Component
public class SecurityHeadersFilter extends OncePerRequestFilter {

    private static final String API_CSP = "default-src 'none'; frame-ancestors 'none'";
    private static final String SWAGGER_CSP =
            "default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-ancestors 'none'";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        response.setHeader("X-Content-Type-Options", "nosniff");
        response.setHeader("X-Frame-Options", "DENY");
        response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
        response.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
        response.setHeader("Content-Security-Policy", isSwaggerPath(request) ? SWAGGER_CSP : API_CSP);
        chain.doFilter(request, response);
    }

    private boolean isSwaggerPath(HttpServletRequest request) {
        var path = request.getRequestURI();
        return path.startsWith("/swagger-ui") || path.startsWith("/v3/api-docs");
    }
}
