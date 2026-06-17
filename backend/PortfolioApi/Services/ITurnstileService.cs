namespace PortfolioAPI.Services;

public interface ITurnstileService
{
    Task<bool> VerifyAsync(string? token, string? remoteIp, CancellationToken cancellationToken);
}
