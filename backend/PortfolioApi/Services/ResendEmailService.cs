using System.Net.Http.Json;
using System.Net.Http.Headers;
using System.Text.Json;
using Microsoft.Extensions.Options;
using PortfolioApi.Models;
using PortfolioApi.Options;

namespace PortfolioApi.Services;

public sealed class ResendEmailService(HttpClient httpClient, IOptions<ResendOptions> options, ILogger<ResendEmailService> logger) : IEmailService
{
    public async Task<EmailSendResult> SendContactEmailAsync(ContactMessage message, CancellationToken cancellationToken)
    {
        var settings = options.Value;
        if (string.IsNullOrWhiteSpace(settings.ApiKey) || string.IsNullOrWhiteSpace(settings.ToEmail))
        {
            logger.LogWarning("Resend configuration is incomplete. Message {MessageId} saved but email notification skipped.", message.Id);
            return new EmailSendResult(false, "Email service not configured");
        }

        try
        {
            using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.resend.com/emails");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", settings.ApiKey);

            var html = $"""
                <h2>New portfolio contact message</h2>
                <p><strong>Name:</strong> {HtmlEncode(message.Name)}</p>
                <p><strong>Email:</strong> {HtmlEncode(message.Email)}</p>
                <p><strong>Type:</strong> {HtmlEncode(message.InquiryType)}</p>
                <p><strong>Subject:</strong> {HtmlEncode(message.Subject)}</p>
                <p><strong>Message:</strong></p>
                <p>{HtmlEncode(message.Message).Replace("\n", "<br />")}</p>
                <hr />
                <p><small>IP: {HtmlEncode(message.IpAddress)} | User Agent: {HtmlEncode(message.UserAgent)}</small></p>
                """;

            var payload = new
            {
                from = settings.FromEmail,
                to = new[] { settings.ToEmail },
                reply_to = message.Email,
                subject = $"Portfolio inquiry: {message.Subject}",
                html
            };

            request.Content = JsonContent.Create(payload);
            using var response = await httpClient.SendAsync(request, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                var status = $"Email provider returned {(int)response.StatusCode} {response.ReasonPhrase}";
                logger.LogWarning("{Status}. Message {MessageId} remains saved in SQL.", status, message.Id);
                return new EmailSendResult(false, status);
            }

            return new EmailSendResult(true, "Sent");
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException or OperationCanceledException)
        {
            logger.LogWarning(ex, "Email provider failed. Message {MessageId} remains saved in SQL.", message.Id);
            return new EmailSendResult(false, "Email provider unavailable");
        }
    }

    private static string HtmlEncode(string value) => System.Net.WebUtility.HtmlEncode(value);
}
