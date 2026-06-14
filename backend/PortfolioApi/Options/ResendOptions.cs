namespace PortfolioApi.Options;

public sealed class ResendOptions
{
    public string ApiKey { get; set; } = string.Empty;
    public string FromEmail { get; set; } = "Portfolio <onboarding@resend.dev>";
    public string ToEmail { get; set; } = string.Empty;
}
