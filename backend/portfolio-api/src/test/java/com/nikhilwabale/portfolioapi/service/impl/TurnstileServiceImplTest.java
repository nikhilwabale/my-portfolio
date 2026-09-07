package com.nikhilwabale.portfolioapi.service.impl;

import com.nikhilwabale.portfolioapi.config.SecurityProperties;
import com.nikhilwabale.portfolioapi.config.TurnstileProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.env.Environment;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

import java.io.IOException;
import java.net.http.HttpClient;
import java.net.http.HttpResponse;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TurnstileServiceImplTest {

    @Mock
    private HttpClient httpClient;
    @Mock
    private Environment environment;

    private final ObjectMapper objectMapper = JsonMapper.builder().build();
    private TurnstileProperties turnstileProperties;
    private SecurityProperties securityProperties;
    private TurnstileServiceImpl turnstileService;

    @BeforeEach
    void setUp() {
        turnstileProperties = new TurnstileProperties();
        turnstileProperties.setSecretKey("test-secret");

        securityProperties = new SecurityProperties();
        turnstileService = new TurnstileServiceImpl(turnstileProperties, securityProperties, environment, objectMapper, httpClient);
    }

    @Test
    void bypassesVerificationInDevelopmentByDefault() {
        when(environment.matchesProfiles("prod", "production")).thenReturn(false);
        // securityProperties.enableTurnstileInDevelopment defaults to false

        var result = turnstileService.verify("any-token", "127.0.0.1");

        assertThat(result).isTrue();
        verifyNoInteractions(httpClient);
    }

    @Test
    void callsCloudflareWhenExplicitlyEnabledInDevelopment() throws IOException, InterruptedException {
        when(environment.matchesProfiles("prod", "production")).thenReturn(false);
        securityProperties.setEnableTurnstileInDevelopment(true);
        mockSiteverifyResponse(200, "{\"success\":true}");

        var result = turnstileService.verify("token", "127.0.0.1");

        assertThat(result).isTrue();
    }

    @Test
    void requiresVerificationInProductionByDefault() throws IOException, InterruptedException {
        when(environment.matchesProfiles("prod", "production")).thenReturn(true);
        mockSiteverifyResponse(200, "{\"success\":true}");

        var result = turnstileService.verify("token", "203.0.113.5");

        assertThat(result).isTrue();
        verify(httpClient).send(any(), any());
    }

    @Test
    void rejectsWhenSecretKeyIsNotConfigured() {
        when(environment.matchesProfiles("prod", "production")).thenReturn(true);
        turnstileProperties.setSecretKey("");

        var result = turnstileService.verify("token", "203.0.113.5");

        assertThat(result).isFalse();
        verifyNoInteractions(httpClient);
    }

    @Test
    void rejectsWhenTokenIsBlank() {
        when(environment.matchesProfiles("prod", "production")).thenReturn(true);

        var result = turnstileService.verify("  ", "203.0.113.5");

        assertThat(result).isFalse();
        verifyNoInteractions(httpClient);
    }

    @Test
    void rejectsWhenCloudflareReportsFailure() throws IOException, InterruptedException {
        when(environment.matchesProfiles("prod", "production")).thenReturn(true);
        mockSiteverifyResponse(200, "{\"success\":false,\"error-codes\":[\"invalid-input-response\"]}");

        var result = turnstileService.verify("token", "203.0.113.5");

        assertThat(result).isFalse();
    }

    @Test
    void rejectsOnNonSuccessHttpStatus() throws IOException, InterruptedException {
        when(environment.matchesProfiles("prod", "production")).thenReturn(true);
        mockSiteverifyResponse(500, "");

        var result = turnstileService.verify("token", "203.0.113.5");

        assertThat(result).isFalse();
    }

    @Test
    void rejectsWhenHttpClientThrows() throws IOException, InterruptedException {
        when(environment.matchesProfiles("prod", "production")).thenReturn(true);
        when(httpClient.send(any(), any())).thenThrow(new IOException("network unreachable"));

        var result = turnstileService.verify("token", "203.0.113.5");

        assertThat(result).isFalse();
    }

    @SuppressWarnings("unchecked")
    private void mockSiteverifyResponse(int statusCode, String body) throws IOException, InterruptedException {
        HttpResponse<String> response = mock(HttpResponse.class);
        when(response.statusCode()).thenReturn(statusCode);
        // Only consumed on the 2xx path - production code returns early otherwise.
        lenient().when(response.body()).thenReturn(body);
        when(httpClient.<String>send(any(), any())).thenReturn(response);
    }
}
