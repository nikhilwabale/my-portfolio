package com.nikhilwabale.portfolioapi.service.impl;

import com.nikhilwabale.portfolioapi.config.ResendProperties;
import com.nikhilwabale.portfolioapi.entity.ContactMessage;
import com.nikhilwabale.portfolioapi.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ResendEmailService implements EmailService {

    private static final String RESEND_ENDPOINT = "https://api.resend.com/emails";
    private static final DateTimeFormatter SUBMITTED_AT_FORMAT =
            DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a 'UTC'", Locale.ENGLISH);

    private final ResendProperties resendProperties;
    private final ObjectMapper objectMapper;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    @Override
    public EmailResult sendContactNotification(ContactMessage message) {
        var apiKey = resendProperties.getApiKey();
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("Resend API key is missing. Message {} was saved but email was skipped.", message.getId());
            return EmailResult.failure("Email API key is not configured.");
        }

        var fromEmail = resendProperties.getFromEmail();
        var toEmail = resendProperties.getToEmail();
        if (fromEmail == null || fromEmail.isBlank() || toEmail == null || toEmail.isBlank()) {
            log.warn("Resend sender/receiver is missing. Message {} was saved but email was skipped.", message.getId());
            return EmailResult.failure("Email sender/receiver is not configured.");
        }

        var from = fromEmail.contains("<") ? fromEmail : "Nikhil Wabale Portfolio <" + fromEmail + ">";
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("from", from);
        payload.put("to", List.of(toEmail));
        payload.put("subject", "New Portfolio Inquiry - " + message.getSubject());
        payload.put("html", buildHtmlEmail(message));
        payload.put("text", buildPlainTextEmail(message));
        payload.put("reply_to", message.getEmail());

        try {
            var body = objectMapper.writeValueAsString(payload);
            var request = HttpRequest.newBuilder()
                    .uri(URI.create(RESEND_ENDPOINT))
                    .timeout(Duration.ofSeconds(10))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(body, StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                return EmailResult.ok();
            }

            log.warn("Resend email failed for message {}. Status: {}. Body: {}",
                    message.getId(), response.statusCode(), response.body());
            return EmailResult.failure("Email provider returned " + response.statusCode() + ": " + response.body());
        } catch (IOException | InterruptedException | JacksonException ex) {
            if (ex instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
            log.error("Email notification failed for message {}. Message was already saved.", message.getId(), ex);
            return EmailResult.failure("Email notification failed after database save.");
        }
    }

    private String buildHtmlEmail(ContactMessage message) {
        var submittedAt = message.getSubmittedAtUtc().format(SUBMITTED_AT_FORMAT);

        return """
                <!doctype html>
                <html lang="en">
                  <head>
                    <meta charset="utf-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1" />
                    <title>New Portfolio Inquiry</title>
                  </head>
                  <body style="margin:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
                    <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="background:#f4f7fb;padding:28px 12px;">
                      <tr>
                        <td align="center">
                          <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="max-width:680px;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 20px 45px rgba(15,23,42,0.08);">
                            <tr>
                              <td style="background:linear-gradient(135deg,#0891b2,#2563eb);padding:28px 32px;color:#ffffff;">
                                <div style="font-size:13px;letter-spacing:0.12em;text-transform:uppercase;font-weight:700;opacity:0.9;">Nikhil Wabale Portfolio</div>
                                <h1 style="margin:10px 0 0;font-size:26px;line-height:1.25;">New Portfolio Inquiry</h1>
                                <p style="margin:8px 0 0;font-size:15px;opacity:0.95;">A visitor submitted your contact form.</p>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding:30px 32px;">
                                <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                                  %s
                                  %s
                                  %s
                                  %s
                                  %s
                                </table>

                                <div style="margin-top:26px;">
                                  <div style="font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#64748b;font-weight:700;margin-bottom:10px;">Message</div>
                                  <div style="border:1px solid #e2e8f0;background:#f8fafc;border-radius:14px;padding:18px 20px;font-size:15px;line-height:1.7;white-space:pre-wrap;">%s</div>
                                </div>

                                <div style="margin-top:28px;padding:16px 18px;background:#ecfeff;border:1px solid #a5f3fc;border-radius:14px;color:#155e75;font-size:14px;line-height:1.6;">
                                  You can reply directly to this email. The visitor email is set as the reply-to address.
                                </div>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding:18px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;color:#64748b;font-size:12px;text-align:center;">
                                Sent automatically from your secure portfolio contact form.
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </body>
                </html>
                """.formatted(
                row("Name", escape(message.getName())),
                row("Email", "<a href=\"mailto:" + escapeAttr(message.getEmail()) + "\" style=\"color:#2563eb;text-decoration:none;font-weight:700;\">" + escape(message.getEmail()) + "</a>"),
                row("Subject", escape(message.getSubject())),
                row("Inquiry Type", escape(message.getInquiryType())),
                row("Submitted At", escape(submittedAt)),
                escape(message.getMessage())
        );
    }

    private String row(String label, String htmlValue) {
        return """
                <tr>
                  <td style="padding:13px 0;border-bottom:1px solid #e2e8f0;width:150px;color:#64748b;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;vertical-align:top;">%s</td>
                  <td style="padding:13px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:15px;font-weight:600;vertical-align:top;">%s</td>
                </tr>
                """.formatted(escape(label), htmlValue);
    }

    private String buildPlainTextEmail(ContactMessage message) {
        var submittedAt = message.getSubmittedAtUtc().format(SUBMITTED_AT_FORMAT);
        return """
                New Portfolio Inquiry

                Name: %s
                Email: %s
                Subject: %s
                Inquiry Type: %s
                Submitted At: %s

                Message:
                %s
                """.formatted(
                message.getName(), message.getEmail(), message.getSubject(),
                message.getInquiryType(), submittedAt, message.getMessage()
        );
    }

    private String escape(String value) {
        if (value == null) return "";
        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }

    private String escapeAttr(String value) {
        return escape(value);
    }
}
