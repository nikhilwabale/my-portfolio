package com.nikhilwabale.portfolioapi.service;

import com.nikhilwabale.portfolioapi.entity.ContactMessage;
import com.nikhilwabale.portfolioapi.repository.ContactMessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * Sends the contact-notification email off the request thread and records the result back onto
 * the already-saved ContactMessage row, so a slow or unreachable Resend API never makes the
 * visitor's browser wait - see ContactController, which returns as soon as the message itself
 * is saved. This intentionally never surfaces email failures to the caller in real time; the
 * "message saved but email failed" case is now only visible in the database row and server
 * logs, not the HTTP response, since the response has already gone out by the time the result
 * is known.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ContactNotificationService {

    private final EmailService emailService;
    private final ContactMessageRepository contactMessageRepository;

    @Async("contactNotificationExecutor")
    public void sendAndRecord(ContactMessage message) {
        try {
            var start = System.nanoTime();
            var result = emailService.sendContactNotification(message);
            var elapsedMs = (System.nanoTime() - start) / 1_000_000;

            message.setEmailNotificationSent(result.success());
            var error = result.error();
            message.setEmailFailureReason(error != null && error.length() > 1000 ? error.substring(0, 1000) : error);
            contactMessageRepository.save(message);

            if (result.success()) {
                log.info("Email notification sent for contact message {} in {}ms", message.getId(), elapsedMs);
            } else {
                log.warn("Email notification failed for contact message {} after {}ms: {}",
                        message.getId(), elapsedMs, result.error());
            }
        } catch (Exception ex) {
            // Runs on a background thread with no caller left to propagate to - must not let
            // anything escape unlogged, or a failure here would be silently invisible.
            log.error("Unexpected error sending/recording email notification for contact message {}", message.getId(), ex);
        }
    }
}
