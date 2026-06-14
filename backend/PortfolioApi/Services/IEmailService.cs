using PortfolioApi.Models;

namespace PortfolioApi.Services;

public interface IEmailService
{
    Task<EmailSendResult> SendContactEmailAsync(ContactMessage message, CancellationToken cancellationToken);
}

public sealed record EmailSendResult(bool Success, string Status);
