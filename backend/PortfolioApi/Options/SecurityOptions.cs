namespace PortfolioAPI.Options;

public sealed class SecurityOptions
{
    public bool RequireTurnstileInProduction { get; set; } = true;
    public bool EnableTurnstileInDevelopment { get; set; } = false;
}
