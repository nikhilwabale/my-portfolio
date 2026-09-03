package com.nikhilwabale.portfolioapi.service.impl;

import com.nikhilwabale.portfolioapi.config.SecurityProperties;
import com.nikhilwabale.portfolioapi.config.TurnstileProperties;
import com.nikhilwabale.portfolioapi.service.TurnstileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

@Slf4j
@Service
@RequiredArgsConstructor
public class TurnstileServiceImpl implements TurnstileService {

    private static final String SITEVERIFY_ENDPOINT = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

    private final TurnstileProperties turnstileProperties;
    private final SecurityProperties securityProperties;
    private final Environment environment;
    private final ObjectMapper objectMapper;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(8))
            .build();

    @Override
    public boolean verify(String token, String remoteIp) {
        var isProduction = environment.matchesProfiles("prod", "production");
        var shouldVerify = isProduction
                ? securityProperties.isRequireTurnstileInProduction()
                : securityProperties.isEnableTurnstileInDevelopment();

        if (!shouldVerify) {
            return true;
        }

        var secret = turnstileProperties.getSecretKey();
        if (secret == null || secret.isBlank() || token == null || token.isBlank()) {
            return false;
        }

        try {
            var form = "secret=" + encode(secret)
                    + "&response=" + encode(token)
                    + "&remoteip=" + encode(remoteIp == null ? "" : remoteIp);

            var request = HttpRequest.newBuilder()
                    .uri(URI.create(SITEVERIFY_ENDPOINT))
                    .timeout(Duration.ofSeconds(8))
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .POST(HttpRequest.BodyPublishers.ofString(form, StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                return false;
            }

            JsonNode result = objectMapper.readTree(response.body());
            return result.path("success").asBoolean(false);
        } catch (IOException | InterruptedException | JacksonException ex) {
            if (ex instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
            log.error("Turnstile verification request failed.", ex);
            return false;
        }
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
