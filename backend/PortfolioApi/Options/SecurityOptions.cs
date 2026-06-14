namespace PortfolioApi.Options;

public sealed class SecurityOptions
{
    public string ContactClientKey { get; set; } = "portfolio-web-client";
    public bool RequireCaptcha { get; set; } = false;
}
