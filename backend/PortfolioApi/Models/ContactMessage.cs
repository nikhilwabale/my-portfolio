namespace PortfolioApi.Models;

public sealed class ContactMessage
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string InquiryType { get; set; } = "job";
    public string IpAddress { get; set; } = string.Empty;
    public string UserAgent { get; set; } = string.Empty;
    public bool CaptchaVerified { get; set; }
    public bool EmailNotificationSent { get; set; }
    public string EmailStatus { get; set; } = "Pending";
    public DateTime SubmittedAtUtc { get; set; } = DateTime.UtcNow;
    public bool IsRead { get; set; }
}
