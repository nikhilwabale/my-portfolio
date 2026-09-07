package com.nikhilwabale.portfolioapi.config;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class DataSourceConfigTest {

    @Test
    void parsesNeonStyleUriPreservingItsOwnSslMode() {
        var details = DataSourceConfig.parseConnectionDetails(
                "postgres://neondb_owner:s3cr3t@ep-cool-name.neon.tech/neondb?sslmode=require", "", "");

        assertThat(details.jdbcUrl()).isEqualTo("jdbc:postgresql://ep-cool-name.neon.tech:5432/neondb?sslmode=require");
        assertThat(details.username()).isEqualTo("neondb_owner");
        assertThat(details.password()).isEqualTo("s3cr3t");
    }

    @Test
    void defaultsToSslModeRequireWhenSourceUriOmitsIt() {
        var details = DataSourceConfig.parseConnectionDetails(
                "postgres://user:pass@some-host.example.com/mydb", "", "");

        assertThat(details.jdbcUrl()).isEqualTo("jdbc:postgresql://some-host.example.com:5432/mydb?sslmode=require");
    }

    @Test
    void honorsAnExplicitSslModeDisableForLocalDockerComposePostgres() {
        var details = DataSourceConfig.parseConnectionDetails(
                "postgres://portfolio:portfolio@postgres:5432/portfolio?sslmode=disable", "", "");

        assertThat(details.jdbcUrl()).isEqualTo("jdbc:postgresql://postgres:5432/portfolio?sslmode=disable");
        assertThat(details.username()).isEqualTo("portfolio");
        assertThat(details.password()).isEqualTo("portfolio");
    }

    @Test
    void respectsAnExplicitPortWhenGiven() {
        var details = DataSourceConfig.parseConnectionDetails(
                "postgresql://user:pass@localhost:15432/mydb?sslmode=disable", "", "");

        assertThat(details.jdbcUrl()).isEqualTo("jdbc:postgresql://localhost:15432/mydb?sslmode=disable");
    }

    @Test
    void urlDecodesPercentEncodedCredentials() {
        var details = DataSourceConfig.parseConnectionDetails(
                "postgres://user%40example.com:p%40ss%3Aword@host/db?sslmode=require", "", "");

        assertThat(details.username()).isEqualTo("user@example.com");
        assertThat(details.password()).isEqualTo("p@ss:word");
    }

    @Test
    void passesThroughAnAlreadyJdbcUrlUsingTheFallbackCredentials() {
        var details = DataSourceConfig.parseConnectionDetails(
                "jdbc:postgresql://host:5432/db?sslmode=require", "fallback-user", "fallback-pass");

        assertThat(details.jdbcUrl()).isEqualTo("jdbc:postgresql://host:5432/db?sslmode=require");
        assertThat(details.username()).isEqualTo("fallback-user");
        assertThat(details.password()).isEqualTo("fallback-pass");
    }

    @Test
    void blankFallbackCredentialsBecomeNullForAnAlreadyJdbcUrl() {
        var details = DataSourceConfig.parseConnectionDetails(
                "jdbc:postgresql://host:5432/db", "", "");

        assertThat(details.username()).isNull();
        assertThat(details.password()).isNull();
    }
}
