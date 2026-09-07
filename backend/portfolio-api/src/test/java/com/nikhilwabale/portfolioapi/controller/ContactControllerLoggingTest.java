package com.nikhilwabale.portfolioapi.controller;

import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;
import com.nikhilwabale.portfolioapi.dto.ContactRequest;
import com.nikhilwabale.portfolioapi.repository.ContactMessageRepository;
import com.nikhilwabale.portfolioapi.service.EmailService;
import com.nikhilwabale.portfolioapi.service.TurnstileService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.mock.web.MockHttpServletRequest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

/**
 * Verifies visitor email addresses never reach the application log output, even on the
 * failure paths that used to include them (ContactController previously logged
 * message.getEmail() on DB/unexpected-error catches). This asserts against the actual
 * rendered log line content via a real Logback appender, not just that the source code
 * looks right.
 */
@ExtendWith(MockitoExtension.class)
class ContactControllerLoggingTest {

    private static final String VISITOR_EMAIL = "sensitive.visitor@example.com";

    @Mock
    private ContactMessageRepository contactMessageRepository;
    @Mock
    private TurnstileService turnstileService;
    @Mock
    private EmailService emailService;

    private ContactController controller;
    private ListAppender<ILoggingEvent> logAppender;

    @BeforeEach
    void setUp() {
        controller = new ContactController(contactMessageRepository, turnstileService, emailService);

        logAppender = new ListAppender<>();
        logAppender.start();
        ((Logger) LoggerFactory.getLogger(ContactController.class)).addAppender(logAppender);
    }

    @AfterEach
    void tearDown() {
        ((Logger) LoggerFactory.getLogger(ContactController.class)).detachAppender(logAppender);
    }

    @Test
    void databaseFailureLogDoesNotContainTheVisitorEmail() {
        when(turnstileService.verify(any(), any())).thenReturn(true);
        when(contactMessageRepository.save(any())).thenThrow(new DataAccessResourceFailureException("connection refused"));

        var response = controller.submit(validRequest(), mockHttpRequest());

        assertThat(response.getStatusCode().value()).isEqualTo(503);
        assertThat(renderedLogMessages()).noneMatch(msg -> msg.contains(VISITOR_EMAIL));
        assertThat(renderedLogMessages()).anyMatch(msg -> msg.contains("Database save failed for contact message"));
    }

    @Test
    void unexpectedFailureLogDoesNotContainTheVisitorEmail() {
        when(turnstileService.verify(any(), any())).thenReturn(true);
        when(contactMessageRepository.save(any())).thenThrow(new RuntimeException("boom"));

        var response = controller.submit(validRequest(), mockHttpRequest());

        assertThat(response.getStatusCode().value()).isEqualTo(500);
        assertThat(renderedLogMessages()).noneMatch(msg -> msg.contains(VISITOR_EMAIL));
        assertThat(renderedLogMessages()).anyMatch(msg -> msg.contains("Unexpected error while processing contact message"));
    }

    @Test
    void emailFailureLogDoesNotContainTheVisitorEmail() {
        when(turnstileService.verify(any(), any())).thenReturn(true);
        when(emailService.sendContactNotification(any()))
                .thenReturn(EmailService.EmailResult.failure("Email provider unreachable"));

        var response = controller.submit(validRequest(), mockHttpRequest());

        assertThat(response.getStatusCode().value()).isEqualTo(502);
        assertThat(renderedLogMessages()).noneMatch(msg -> msg.contains(VISITOR_EMAIL));
    }

    private java.util.List<String> renderedLogMessages() {
        return logAppender.list.stream().map(ILoggingEvent::getFormattedMessage).toList();
    }

    private ContactRequest validRequest() {
        return new ContactRequest(
                "Test User",
                VISITOR_EMAIL,
                "A valid subject line",
                "Other",
                "This is a perfectly valid test message body.",
                "test-token",
                ""
        );
    }

    private MockHttpServletRequest mockHttpRequest() {
        var request = new MockHttpServletRequest("POST", "/api/contact");
        request.setRemoteAddr("203.0.113.55");
        return request;
    }
}
