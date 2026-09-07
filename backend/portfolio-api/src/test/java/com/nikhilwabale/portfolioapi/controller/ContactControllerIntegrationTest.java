package com.nikhilwabale.portfolioapi.controller;

import com.nikhilwabale.portfolioapi.repository.ContactMessageRepository;
import com.nikhilwabale.portfolioapi.service.EmailService;
import com.nikhilwabale.portfolioapi.service.TurnstileService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.resttestclient.TestRestTemplate;
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureTestRestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.util.LinkedHashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Full-stack integration test for POST /api/contact: real embedded server, real H2-backed
 * repository, real rate limiter/security-header filters and the real global exception
 * handler. Only the two external dependencies (Resend, Cloudflare Turnstile) are mocked at
 * their service-interface boundary, since hitting the real internet in a test suite would be
 * slow, flaky and would spam real inboxes.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureTestRestTemplate
@ActiveProfiles("test")
class ContactControllerIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private ContactMessageRepository contactMessageRepository;

    @MockitoBean
    private EmailService emailService;

    @MockitoBean
    private TurnstileService turnstileService;

    @AfterEach
    void cleanUp() {
        contactMessageRepository.deleteAll();
    }

    @Test
    void acceptsAValidSubmissionAndPersistsIt() {
        when(turnstileService.verify(any(), any())).thenReturn(true);
        when(emailService.sendContactNotification(any())).thenReturn(EmailService.EmailResult.ok());

        var response = postContact(validPayload(), "203.0.113.101");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).contains("\"success\":true");
        assertThat(contactMessageRepository.findAll()).hasSize(1);

        var saved = contactMessageRepository.findAll().get(0);
        assertThat(saved.getName()).isEqualTo("Test User");
        assertThat(saved.getEmail()).isEqualTo("test@example.com");
        assertThat(saved.isEmailNotificationSent()).isTrue();
    }

    @Test
    void returns502WhenSavedButEmailFails() {
        when(turnstileService.verify(any(), any())).thenReturn(true);
        when(emailService.sendContactNotification(any()))
                .thenReturn(EmailService.EmailResult.failure("Email provider unreachable"));

        var response = postContact(validPayload(), "203.0.113.102");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_GATEWAY);
        assertThat(contactMessageRepository.findAll()).hasSize(1);
        var saved = contactMessageRepository.findAll().get(0);
        assertThat(saved.isEmailNotificationSent()).isFalse();
        assertThat(saved.getEmailFailureReason()).isEqualTo("Email provider unreachable");
    }

    @Test
    void rejectsHoneypotSubmissionsWithoutPersistingOrCallingDependencies() {
        var payload = validPayload();
        payload.put("website", "http://spam.example");

        var response = postContact(payload, "203.0.113.103");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).contains("Request rejected.");
        assertThat(contactMessageRepository.findAll()).isEmpty();
        verify(turnstileService, never()).verify(any(), any());
        verify(emailService, never()).sendContactNotification(any());
    }

    @Test
    void rejectsWhenCaptchaVerificationFails() {
        when(turnstileService.verify(any(), any())).thenReturn(false);

        var response = postContact(validPayload(), "203.0.113.104");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).contains("Security verification failed");
        assertThat(contactMessageRepository.findAll()).isEmpty();
        verify(emailService, never()).sendContactNotification(any());
    }

    @Test
    void rejectsTooShortMessageWithTheSpecificFieldMessage() {
        var payload = validPayload();
        payload.put("message", "short");

        var response = postContact(payload, "203.0.113.105");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).contains("Message must be between 10 and 2000 characters.");
        assertThat(contactMessageRepository.findAll()).isEmpty();
    }

    @Test
    void rejectsWhitespacePaddedNameThatFailsLengthAfterTrimming() {
        var payload = validPayload();
        payload.put("name", "   a");

        var response = postContact(payload, "203.0.113.106");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).contains("Name must be between 2 and 100 characters.");
    }

    @Test
    void blocksTheFourthRequestFromTheSameIpWithinAnHour() {
        when(turnstileService.verify(any(), any())).thenReturn(true);
        when(emailService.sendContactNotification(any())).thenReturn(EmailService.EmailResult.ok());

        var ip = "203.0.113.107";
        for (int i = 0; i < 3; i++) {
            var response = postContact(validPayload(), ip);
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        }

        var fourthResponse = postContact(validPayload(), ip);

        assertThat(fourthResponse.getStatusCode()).isEqualTo(HttpStatus.TOO_MANY_REQUESTS);
        assertThat(fourthResponse.getBody()).contains("Too many requests");
        assertThat(contactMessageRepository.findAll()).hasSize(3);
    }

    private org.springframework.http.ResponseEntity<String> postContact(Map<String, Object> payload, String forwardedForIp) {
        var headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        // server.forward-headers-strategy=framework makes RateLimitFilter/HealthController
        // resolve the client IP from this header, giving each test its own rate-limit bucket.
        headers.set("X-Forwarded-For", forwardedForIp);

        return restTemplate.postForEntity("/api/contact", new HttpEntity<>(payload, headers), String.class);
    }

    private Map<String, Object> validPayload() {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("name", "Test User");
        payload.put("email", "test@example.com");
        payload.put("subject", "A valid subject line");
        payload.put("inquiryType", "Other");
        payload.put("message", "This is a perfectly valid test message body.");
        payload.put("turnstileToken", "test-token");
        payload.put("website", "");
        return payload;
    }
}
