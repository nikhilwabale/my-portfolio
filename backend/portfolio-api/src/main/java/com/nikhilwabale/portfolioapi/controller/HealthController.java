package com.nikhilwabale.portfolioapi.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.SQLException;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Plain, dependency-light health endpoints (distinct from Spring Boot Actuator's
 * /actuator/health) kept at the same paths as the old backend so uptime monitors
 * do not need to change: GET /health and GET /health/db.
 */
@RestController
@RequiredArgsConstructor
public class HealthController {

    private final DataSource dataSource;

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", "ok");
        body.put("service", "PortfolioAPI");
        body.put("utc", Instant.now().toString());
        return ResponseEntity.ok(body);
    }

    @GetMapping("/health/db")
    public ResponseEntity<Map<String, Object>> healthDb() {
        Map<String, Object> body = new LinkedHashMap<>();
        try (var connection = dataSource.getConnection()) {
            var canConnect = connection.isValid(5);
            if (canConnect) {
                body.put("status", "ok");
                body.put("database", "connected");
                body.put("provider", "PostgreSQL");
                body.put("utc", Instant.now().toString());
                return ResponseEntity.ok(body);
            }
        } catch (SQLException ignored) {
            // fall through to the error response below
        }

        body.put("status", "error");
        body.put("database", "disconnected");
        body.put("detail", "Database connection failed.");
        body.put("utc", Instant.now().toString());
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(body);
    }
}
