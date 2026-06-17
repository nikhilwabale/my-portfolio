using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;
using PortfolioAPI.Models;
using PortfolioAPI.Options;

namespace PortfolioAPI.Services;

public sealed class ResendEmailService(IHttpClientFactory httpClientFactory, IConfiguration configuration, IOptions<EmailOptions> options, ILogger<ResendEmailService> logger) : IEmailService
{
    public async Task<(bool Success, string? Error)> SendContactNotificationAsync(ContactMessage message, CancellationToken cancellationToken)
    {
        var apiKey = configuration["Resend:ApiKey"] ?? configuration["Email:ApiKey"] ?? configuration["RESEND_API_KEY"];
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            logger.LogWarning("Resend API key is missing. Message {MessageId} was saved but email was skipped.", message.Id);
            return (false, "Email API key is not configured.");
        }

        var emailOptions = options.Value;
        var fromEmail = configuration["Resend:FromEmail"] ?? configuration["Email:FromEmail"] ?? emailOptions.FromEmail;
        var toEmail = configuration["Resend:ToEmail"] ?? configuration["Email:ToEmail"] ?? emailOptions.ToEmail;

        if (string.IsNullOrWhiteSpace(fromEmail) || string.IsNullOrWhiteSpace(toEmail))
        {
            logger.LogWarning("Resend email sender/receiver is missing. Message {MessageId} was saved but email was skipped.", message.Id);
            return (false, "Email sender/receiver is not configured.");
        }

        var html = BuildProfessionalEmailHtml(message);
        var plainText = BuildPlainTextEmail(message);

        var payload = new
        {
            from = fromEmail.Contains("<") ? fromEmail : $"Nikhil Wabale Portfolio <{fromEmail}>",
            to = new[] { toEmail },
            subject = $"New Portfolio Inquiry - {message.Subject}",
            html,
            text = plainText,
            reply_to = message.Email
        };

        try
        {
            var client = httpClientFactory.CreateClient("resend");
            using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.resend.com/emails");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
            request.Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
            using var response = await client.SendAsync(request, cancellationToken);
            if (response.IsSuccessStatusCode) return (true, null);

            var body = await response.Content.ReadAsStringAsync(cancellationToken);
            logger.LogWarning("Resend email failed for message {MessageId}. Status: {Status}. Body: {Body}", message.Id, response.StatusCode, body);
            return (false, $"Email provider returned {(int)response.StatusCode}: {body}");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Email notification failed for message {MessageId}. Message was already saved.", message.Id);
            return (false, "Email notification failed after database save.");
        }
    }

    private static string BuildProfessionalEmailHtml(ContactMessage message)
    {
        var submittedAt = message.SubmittedAtUtc.ToString("dd MMM yyyy, hh:mm tt 'UTC'");

        return $"""
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>New Portfolio Inquiry</title>
  </head>
  <body style="margin:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f7fb;padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 20px 45px rgba(15,23,42,0.08);">
            <tr>
              <td style="background:linear-gradient(135deg,#0891b2,#2563eb);padding:28px 32px;color:#ffffff;">
                <div style="font-size:13px;letter-spacing:0.12em;text-transform:uppercase;font-weight:700;opacity:0.9;">Nikhil Wabale Portfolio</div>
                <h1 style="margin:10px 0 0;font-size:26px;line-height:1.25;">New Portfolio Inquiry</h1>
                <p style="margin:8px 0 0;font-size:15px;opacity:0.95;">A visitor submitted your contact form.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:30px 32px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                  {Row("Name", message.Name)}
                  {Row("Email", $"<a href=\"mailto:{EscapeAttr(message.Email)}\" style=\"color:#2563eb;text-decoration:none;font-weight:700;\">{Escape(message.Email)}</a>", false)}
                  {Row("Subject", message.Subject)}
                  {Row("Inquiry Type", message.InquiryType)}
                  {Row("Submitted At", submittedAt)}
                </table>

                <div style="margin-top:26px;">
                  <div style="font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#64748b;font-weight:700;margin-bottom:10px;">Message</div>
                  <div style="border:1px solid #e2e8f0;background:#f8fafc;border-radius:14px;padding:18px 20px;font-size:15px;line-height:1.7;white-space:pre-wrap;">{Escape(message.Message)}</div>
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
""";
    }

    private static string Row(string label, string value, bool encodeValue = true)
    {
        var displayValue = encodeValue ? Escape(value) : value;
        return $"""
<tr>
  <td style="padding:13px 0;border-bottom:1px solid #e2e8f0;width:150px;color:#64748b;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;vertical-align:top;">{Escape(label)}</td>
  <td style="padding:13px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:15px;font-weight:600;vertical-align:top;">{displayValue}</td>
</tr>
""";
    }

    private static string BuildPlainTextEmail(ContactMessage message) => $"""
New Portfolio Inquiry

Name: {message.Name}
Email: {message.Email}
Subject: {message.Subject}
Inquiry Type: {message.InquiryType}
Submitted At: {message.SubmittedAtUtc:dd MMM yyyy, hh:mm tt 'UTC'}

Message:
{message.Message}
""";

    private static string Escape(string value) => System.Net.WebUtility.HtmlEncode(value ?? string.Empty);

    private static string EscapeAttr(string value) => Escape(value).Replace("\"", "&quot;");
}
