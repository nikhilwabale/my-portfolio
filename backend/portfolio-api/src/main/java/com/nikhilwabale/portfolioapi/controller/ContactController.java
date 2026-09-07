package com.nikhilwabale.portfolioapi.controller;

import com.nikhilwabale.portfolioapi.dto.ContactRequest;
import com.nikhilwabale.portfolioapi.dto.ContactResponse;
import com.nikhilwabale.portfolioapi.entity.ContactMessage;
import com.nikhilwabale.portfolioapi.repository.ContactMessageRepository;
import com.nikhilwabale.portfolioapi.service.ContactNotificationService;
import com.nikhilwabale.portfolioapi.service.TurnstileService;
import com.nikhilwabale.portfolioapi.util.StringSanitizer;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Locale;

@Slf4j
@RestController
@RequestMapping("/api/contact")
@RequiredArgsConstructor
public class ContactController {

    private final ContactMessageRepository contactMessageRepository;
    private final TurnstileService turnstileService;
    private final ContactNotificationService contactNotificationService;

    @PostMapping
    public ResponseEntity<ContactResponse> submit(@Valid @RequestBody ContactRequest request, HttpServletRequest httpRequest) {
        var requestStart = System.nanoTime();
        var remoteIp = httpRequest.getRemoteAddr();

        if (request.website() != null && !request.website().isBlank()) {
            log.warn("Honeypot triggered for IP {}", remoteIp);
            return ResponseEntity.badRequest().body(ContactResponse.fail("Request rejected."));
        }

        var turnstileStart = System.nanoTime();
        var captchaValid = turnstileService.verify(request.turnstileToken(), remoteIp);
        log.info("Turnstile verification took {}ms (passed: {})", elapsedMs(turnstileStart), captchaValid);
        if (!captchaValid) {
            return ResponseEntity.badRequest()
                    .body(ContactResponse.fail("Security verification failed. Please refresh and try again."));
        }

        var message = new ContactMessage();
        message.setName(StringSanitizer.clean(request.name(), 100));
        message.setEmail(StringSanitizer.clean(request.email(), 255).toLowerCase(Locale.ROOT));
        message.setSubject(StringSanitizer.clean(request.subject(), 180));
        message.setInquiryType(StringSanitizer.clean(request.inquiryType(), 80));
        message.setMessage(StringSanitizer.clean(request.message(), 2000));
        message.setIpAddress(remoteIp);
        message.setUserAgent(httpRequest.getHeader("User-Agent"));
        message.setSubmittedAtUtc(OffsetDateTime.now(ZoneOffset.UTC));

        try {
            var dbStart = System.nanoTime();
            contactMessageRepository.save(message);
            log.info("Contact message {} saved to database in {}ms", message.getId(), elapsedMs(dbStart));
        } catch (DataAccessException ex) {
            // Message ID, not email - see StringSanitizer/logging conventions: PII stays out
            // of logs, the DB row (looked up by ID, through proper access control) is the
            // correct place to go for the actual contact details behind a failure.
            log.error("Database save failed for contact message", ex);
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(ContactResponse.fail("Contact service is temporarily unavailable. Please try again later."));
        } catch (Exception ex) {
            log.error("Unexpected error while processing contact message", ex);
            return ResponseEntity.internalServerError()
                    .body(ContactResponse.fail("Something went wrong. Please try again later."));
        }

        // Fire-and-forget: the message is already saved, so the visitor's browser doesn't need
        // to wait on Resend's API (which can be slow, or briefly unreachable) before getting a
        // response. Success/failure of the email itself is recorded back onto this row - and
        // logged - by ContactNotificationService once it finishes, not surfaced here.
        contactNotificationService.sendAndRecord(message);

        log.info("Contact message {} request handled in {}ms (email send/record continues in background)",
                message.getId(), elapsedMs(requestStart));

        return ResponseEntity.ok(ContactResponse.ok("Message submitted successfully. I will get back to you soon.", message.getId()));
    }

    private static long elapsedMs(long startNanos) {
        return (System.nanoTime() - startNanos) / 1_000_000;
    }
}
