package com.nikhilwabale.portfolioapi.controller;

import com.nikhilwabale.portfolioapi.dto.ContactRequest;
import com.nikhilwabale.portfolioapi.dto.ContactResponse;
import com.nikhilwabale.portfolioapi.entity.ContactMessage;
import com.nikhilwabale.portfolioapi.repository.ContactMessageRepository;
import com.nikhilwabale.portfolioapi.service.EmailService;
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
    private final EmailService emailService;

    @PostMapping
    public ResponseEntity<ContactResponse> submit(@Valid @RequestBody ContactRequest request, HttpServletRequest httpRequest) {
        var remoteIp = httpRequest.getRemoteAddr();

        if (request.website() != null && !request.website().isBlank()) {
            log.warn("Honeypot triggered for IP {}", remoteIp);
            return ResponseEntity.badRequest().body(ContactResponse.fail("Request rejected."));
        }

        var captchaValid = turnstileService.verify(request.turnstileToken(), remoteIp);
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
            contactMessageRepository.save(message);

            var emailResult = emailService.sendContactNotification(message);
            message.setEmailNotificationSent(emailResult.success());
            var error = emailResult.error();
            message.setEmailFailureReason(error != null && error.length() > 1000 ? error.substring(0, 1000) : error);
            contactMessageRepository.save(message);

            if (!emailResult.success()) {
                log.warn("Contact message {} was saved but email notification failed: {}", message.getId(), emailResult.error());
                return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(ContactResponse.fail(
                        "Your message was saved, but email notification failed. Please check Resend API key, sender and verified recipient settings."));
            }
        } catch (DataAccessException ex) {
            log.error("Database save failed for contact request from {}", message.getEmail(), ex);
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(ContactResponse.fail("Contact service is temporarily unavailable. Please try again later."));
        } catch (Exception ex) {
            log.error("Unexpected error while processing contact request from {}", message.getEmail(), ex);
            return ResponseEntity.internalServerError()
                    .body(ContactResponse.fail("Something went wrong. Please try again later."));
        }

        return ResponseEntity.ok(ContactResponse.ok("Message submitted successfully. I will get back to you soon.", message.getId()));
    }
}
