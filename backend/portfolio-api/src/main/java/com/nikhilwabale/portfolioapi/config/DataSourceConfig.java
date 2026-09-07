package com.nikhilwabale.portfolioapi.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

/**
 * Neon gives out a single "postgres://user:pass@host/db?sslmode=require" style URI.
 * The old ASP.NET Core backend normalized that into a key-value Npgsql connection string
 * on startup (see Program.cs). This does the JDBC equivalent, so the exact same DATABASE_URL
 * value already configured in Render/Neon can be reused unchanged - no reformatting needed.
 *
 * Only active when DATABASE_URL is set; otherwise Spring Boot's standard DataSource
 * auto-configuration takes over (spring.datasource.url/username/password), which keeps
 * H2-backed tests and any non-Neon Postgres setup simple.
 */
@Configuration
@ConditionalOnProperty(name = "DATABASE_URL")
public class DataSourceConfig {

    /** Pure result of parsing a DATABASE_URL - kept separate from bean construction so it's
     *  testable without HikariDataSource's eager connection attempt on construction. */
    record ConnectionDetails(String jdbcUrl, String username, String password) {
    }

    @Bean
    public DataSource dataSource(
            @Value("${DATABASE_URL:}") String databaseUrl,
            @Value("${spring.datasource.username:}") String fallbackUsername,
            @Value("${spring.datasource.password:}") String fallbackPassword) {

        if (databaseUrl == null || databaseUrl.isBlank()) {
            throw new IllegalStateException(
                    "DATABASE_URL is missing. Set your Neon PostgreSQL connection string as the DATABASE_URL environment variable.");
        }

        var details = parseConnectionDetails(databaseUrl, fallbackUsername, fallbackPassword);

        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(details.jdbcUrl());
        config.setUsername(details.username());
        config.setPassword(details.password());
        config.setDriverClassName("org.postgresql.Driver");
        // Matches server.tomcat.threads.max=10 (application.yml) - no point pooling more
        // DB connections than there are request threads to use them, and each connection
        // is memory this app can't spare on Render's free-tier 512MB container.
        config.setMaximumPoolSize(3);
        config.setMinimumIdle(1);
        config.setPoolName("portfolio-api-pool");

        return new HikariDataSource(config);
    }

    static ConnectionDetails parseConnectionDetails(String databaseUrl, String fallbackUsername, String fallbackPassword) {
        if (databaseUrl.startsWith("postgres://") || databaseUrl.startsWith("postgresql://")) {
            var uri = URI.create(databaseUrl);
            var userInfo = uri.getUserInfo();
            String username = null;
            String password = null;
            if (userInfo != null) {
                var parts = userInfo.split(":", 2);
                username = decode(parts[0]);
                password = parts.length > 1 ? decode(parts[1]) : "";
            }

            var database = uri.getPath() == null ? "" : uri.getPath().replaceFirst("^/", "");
            var port = uri.getPort() > 0 ? uri.getPort() : 5432;
            // Neon's own connection strings already carry their sslmode (typically
            // ?sslmode=require); pass that through as-is instead of silently overwriting
            // it, and only default to "require" when the source URI left it unspecified.
            // This also lets a local docker-compose Postgres (no TLS configured) connect
            // via the same postgres:// format with ?sslmode=disable, rather than needing a
            // different DATABASE_URL shape just for local development.
            var query = uri.getQuery();
            var queryString = (query == null || query.isBlank()) ? "sslmode=require" : query;
            var jdbcUrl = "jdbc:postgresql://" + uri.getHost() + ":" + port + "/" + database + "?" + queryString;

            return new ConnectionDetails(jdbcUrl, username, password);
        }

        // Already a JDBC URL (e.g. "jdbc:postgresql://host:5432/db?sslmode=require").
        return new ConnectionDetails(
                databaseUrl,
                fallbackUsername.isBlank() ? null : fallbackUsername,
                fallbackPassword.isBlank() ? null : fallbackPassword);
    }

    private static String decode(String value) {
        return URLDecoder.decode(value, StandardCharsets.UTF_8);
    }
}
