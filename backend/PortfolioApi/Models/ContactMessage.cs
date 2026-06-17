using System.ComponentModel.DataAnnotations;

namespace PortfolioAPI.Models;

public sealed class ContactMessage
{
    public int Id { get; set; }

    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required, MaxLength(255), EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required, MaxLength(180)]
    public string Subject { get; set; } = string.Empty;

    [Required, MaxLength(80)]
    public string InquiryType { get; set; } = string.Empty;

    [Required, MaxLength(2000)]
    public string Message { get; set; } = string.Empty;

    [MaxLength(64)]
    public string? IpAddress { get; set; }

    [MaxLength(512)]
    public string? UserAgent { get; set; }

    public DateTime SubmittedAtUtc { get; set; } = DateTime.UtcNow;
    public bool IsRead { get; set; }
    public bool EmailNotificationSent { get; set; }
    [MaxLength(1000)]
    public string? EmailFailureReason { get; set; }
}
