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

    @Bean
    public DataSource dataSource(
            @Value("${DATABASE_URL:}") String databaseUrl,
            @Value("${spring.datasource.username:}") String fallbackUsername,
            @Value("${spring.datasource.password:}") String fallbackPassword) {

        if (databaseUrl == null || databaseUrl.isBlank()) {
            throw new IllegalStateException(
                    "DATABASE_URL is missing. Set your Neon PostgreSQL connection string as the DATABASE_URL environment variable.");
        }

        HikariConfig config = new HikariConfig();

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
            var jdbcUrl = "jdbc:postgresql://" + uri.getHost() + ":" + port + "/" + database + "?sslmode=require";

            config.setJdbcUrl(jdbcUrl);
            config.setUsername(username);
            config.setPassword(password);
        } else {
            // Already a JDBC URL (e.g. "jdbc:postgresql://host:5432/db?sslmode=require").
            config.setJdbcUrl(databaseUrl);
            config.setUsername(fallbackUsername.isBlank() ? null : fallbackUsername);
            config.setPassword(fallbackPassword.isBlank() ? null : fallbackPassword);
        }

        config.setDriverClassName("org.postgresql.Driver");
        config.setMaximumPoolSize(5);
        config.setMinimumIdle(1);
        config.setPoolName("portfolio-api-pool");

        return new HikariDataSource(config);
    }

    private String decode(String value) {
        return URLDecoder.decode(value, StandardCharsets.UTF_8);
    }
}
