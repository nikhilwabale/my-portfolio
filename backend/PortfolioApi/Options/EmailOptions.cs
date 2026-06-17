namespace PortfolioAPI.Options;

public sealed class EmailOptions
{
    public string Provider { get; set; } = "Resend";
    public string ApiKey { get; set; } = string.Empty;
    public string FromEmail { get; set; } = "portfolio@yourdomain.com";
    public string ToEmail { get; set; } = "wablenikhil2000@gmail.com";
}
