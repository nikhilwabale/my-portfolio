package com.nikhilwabale.portfolioapi.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.ArrayList;
import java.util.List;

/**
 * Bound from "cors.allowed-origins" (application.yml) or the CORS_ALLOWED_ORIGINS env var
 * (comma-separated - Spring's relaxed binding turns a delimited env var into a List<String>).
 */
@Getter
@Setter
@ConfigurationProperties(prefix = "cors")
public class CorsProperties {
    private List<String> allowedOrigins = new ArrayList<>();
}
