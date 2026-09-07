package com.nikhilwabale.portfolioapi.service;

import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;
import com.nikhilwabale.portfolioapi.entity.ContactMessage;
import com.nikhilwabale.portfolioapi.repository.ContactMessageRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.slf4j.LoggerFactory;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

/**
 * Verifies visitor email addresses never reach the application log output when the async
 * email-send step fails - see ContactControllerLoggingTest for the equivalent guarantee on
 * ContactController's own (synchronous) failure paths.
 */
@ExtendWith(MockitoExtension.class)
class ContactNotificationServiceLoggingTest {

    private static final String VISITOR_EMAIL = "sensitive.visitor@example.com";

    @Mock
    private EmailService emailService;
    @Mock
    private ContactMessageRepository contactMessageRepository;

    private ContactNotificationService service;
    private ListAppender<ILoggingEvent> logAppender;

    @BeforeEach
    void setUp() {
        service = new ContactNotificationService(emailService, contactMessageRepository);

        logAppender = new ListAppender<>();
        logAppender.start();
        ((Logger) LoggerFactory.getLogger(ContactNotificationService.class)).addAppender(logAppender);
    }

    @AfterEach
    void tearDown() {
        ((Logger) LoggerFactory.getLogger(ContactNotificationService.class)).detachAppender(logAppender);
    }

    @Test
    void emailFailureLogDoesNotContainTheVisitorEmailAndUpdatesTheRow() {
        when(emailService.sendContactNotification(any()))
                .thenReturn(EmailService.EmailResult.failure("Email provider unreachable"));

        var message = new ContactMessage();
        message.setEmail(VISITOR_EMAIL);

        service.sendAndRecord(message);

        assertThat(message.isEmailNotificationSent()).isFalse();
        assertThat(message.getEmailFailureReason()).isEqualTo("Email provider unreachable");
        assertThat(renderedLogMessages()).noneMatch(msg -> msg.contains(VISITOR_EMAIL));
        assertThat(renderedLogMessages()).anyMatch(msg -> msg.contains("Email notification failed for contact message"));
    }

    @Test
    void unexpectedFailureLogDoesNotContainTheVisitorEmail() {
        when(emailService.sendContactNotification(any())).thenThrow(new RuntimeException("boom"));

        var message = new ContactMessage();
        message.setEmail(VISITOR_EMAIL);

        service.sendAndRecord(message);

        assertThat(renderedLogMessages()).noneMatch(msg -> msg.contains(VISITOR_EMAIL));
        assertThat(renderedLogMessages())
                .anyMatch(msg -> msg.contains("Unexpected error sending/recording email notification"));
    }

    private List<String> renderedLogMessages() {
        return logAppender.list.stream().map(ILoggingEvent::getFormattedMessage).toList();
    }
}
