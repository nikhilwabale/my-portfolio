using PortfolioAPI.Models;

namespace PortfolioAPI.Services;

public interface IEmailService
{
    Task<(bool Success, string? Error)> SendContactNotificationAsync(ContactMessage message, CancellationToken cancellationToken);
}
