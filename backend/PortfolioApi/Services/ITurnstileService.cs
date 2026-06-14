namespace PortfolioApi.Services;

public interface ITurnstileService
{
    Task<bool> VerifyAsync(string? token, string ipAddress, CancellationToken cancellationToken);
}
