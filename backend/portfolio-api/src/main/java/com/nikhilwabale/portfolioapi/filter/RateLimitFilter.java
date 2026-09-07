package com.nikhilwabale.portfolioapi.filter;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

/**
 * Fixed-quota, per-IP rate limiting for the contact endpoint: 3 requests per hour,
 * matching the old ASP.NET Core FixedWindowRateLimiter policy. Backed by an in-memory
 * token bucket per client IP - fine for a single-instance, low-traffic portfolio API.
 */
@Slf4j
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final int PERMITS = 3;
    private static final Duration WINDOW = Duration.ofHours(1);

    private final ConcurrentMap<String, Bucket> buckets = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        var resolvedIp = clientIp(request);
        var bucket = buckets.computeIfAbsent(resolvedIp, ip -> newBucket());

        // Temporary diagnostic - a live production test sent 4 rapid requests and none were
        // rate-limited. Logging the resolved IP and bucket identity/count to confirm whether
        // requests are landing in the same bucket at all. Remove once confirmed.
        log.info("Rate limit check: resolvedIp={}, bucketCount={}, remoteAddr={}, xForwardedFor={}",
                resolvedIp, buckets.size(), request.getRemoteAddr(), request.getHeader("X-Forwarded-For"));

        if (bucket.tryConsume(1)) {
            chain.doFilter(request, response);
            return;
        }

        response.setStatus(429); // 429 Too Many Requests - not defined as a constant in the Servlet API
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write("{\"success\":false,\"message\":\"Too many requests. Please try again later.\"}");
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !("POST".equalsIgnoreCase(request.getMethod()) && "/api/contact".equals(request.getRequestURI()));
    }

    private Bucket newBucket() {
        var limit = Bandwidth.classic(PERMITS, Refill.intervally(PERMITS, WINDOW));
        return Bucket.builder().addLimit(limit).build();
    }

    private String clientIp(HttpServletRequest request) {
        var ip = request.getRemoteAddr();
        return ip == null ? "unknown" : ip;
    }
}
