package com.nikhilwabale.portfolioapi.service.impl;

import com.nikhilwabale.portfolioapi.config.ResendProperties;
import com.nikhilwabale.portfolioapi.entity.ContactMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

import java.io.IOException;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ResendEmailServiceTest {

    @Mock
    private HttpClient httpClient;

    private final ObjectMapper objectMapper = JsonMapper.builder().build();
    private ResendProperties resendProperties;
    private ResendEmailService emailService;
    private ContactMessage message;

    @BeforeEach
    void setUp() {
        resendProperties = new ResendProperties();
        resendProperties.setApiKey("test-api-key");
        resendProperties.setFromEmail("onboarding@resend.dev");
        resendProperties.setToEmail("wablenikhil2000@gmail.com");

        emailService = new ResendEmailService(resendProperties, objectMapper, httpClient);

        message = new ContactMessage();
        message.setId(42);
        message.setName("Test User");
        message.setEmail("test@example.com");
        message.setSubject("A test inquiry");
        message.setInquiryType("Other");
        message.setMessage("This is a test message body.");
        message.setSubmittedAtUtc(OffsetDateTime.now(ZoneOffset.UTC));
    }

    @Test
    void failsWithoutCallingResendWhenApiKeyIsMissing() {
        resendProperties.setApiKey("");

        var result = emailService.sendContactNotification(message);

        assertThat(result.success()).isFalse();
        assertThat(result.error()).isEqualTo("Email API key is not configured.");
        verifyNoInteractions(httpClient);
    }

    @Test
    void failsWithoutCallingResendWhenFromEmailIsMissing() {
        resendProperties.setFromEmail("");

        var result = emailService.sendContactNotification(message);

        assertThat(result.success()).isFalse();
        assertThat(result.error()).isEqualTo("Email sender/receiver is not configured.");
        verifyNoInteractions(httpClient);
    }

    @Test
    void failsWithoutCallingResendWhenToEmailIsMissing() {
        resendProperties.setToEmail("");

        var result = emailService.sendContactNotification(message);

        assertThat(result.success()).isFalse();
        assertThat(result.error()).isEqualTo("Email sender/receiver is not configured.");
        verifyNoInteractions(httpClient);
    }

    @Test
    void succeedsAndCallsResendWithAuthorizationHeaderOnHttpSuccess() throws IOException, InterruptedException {
        mockResendResponse(200, "{\"id\":\"abc123\"}");

        var result = emailService.sendContactNotification(message);

        assertThat(result.success()).isTrue();
        assertThat(result.error()).isNull();

        var requestCaptor = ArgumentCaptor.forClass(HttpRequest.class);
        verify(httpClient).send(requestCaptor.capture(), any());
        var sentRequest = requestCaptor.getValue();
        assertThat(sentRequest.uri().toString()).isEqualTo("https://api.resend.com/emails");
        assertThat(sentRequest.headers().firstValue("Authorization")).hasValue("Bearer test-api-key");
        assertThat(sentRequest.method()).isEqualTo("POST");
    }

    @Test
    void treats2xxRangeBoundariesAsSuccess() throws IOException, InterruptedException {
        mockResendResponse(299, "");

        var result = emailService.sendContactNotification(message);

        assertThat(result.success()).isTrue();
    }

    @Test
    void failsWithProviderStatusAndBodyOnNonSuccessResponse() throws IOException, InterruptedException {
        mockResendResponse(422, "{\"message\":\"Invalid from address\"}");

        var result = emailService.sendContactNotification(message);

        assertThat(result.success()).isFalse();
        assertThat(result.error())
                .contains("422")
                .contains("Invalid from address");
    }

    @Test
    void failsGracefullyWhenHttpClientThrows() throws IOException, InterruptedException {
        when(httpClient.<String>send(any(), any())).thenThrow(new IOException("connection reset"));

        var result = emailService.sendContactNotification(message);

        assertThat(result.success()).isFalse();
        assertThat(result.error()).isEqualTo("Email notification failed after database save.");
    }

    @SuppressWarnings("unchecked")
    private void mockResendResponse(int statusCode, String body) throws IOException, InterruptedException {
        HttpResponse<String> response = mock(HttpResponse.class);
        when(response.statusCode()).thenReturn(statusCode);
        // Only consumed on the failure path - the 2xx branch returns before reading it.
        lenient().when(response.body()).thenReturn(body);
        when(httpClient.<String>send(any(), any())).thenReturn(response);
    }
}
