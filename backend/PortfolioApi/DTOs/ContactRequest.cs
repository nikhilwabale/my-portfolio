using System.ComponentModel.DataAnnotations;

namespace PortfolioAPI.DTOs;

public sealed class ContactRequest
{
    [Required, StringLength(100, MinimumLength = 2)]
    public string Name { get; set; } = string.Empty;

    [Required, EmailAddress, StringLength(255)]
    public string Email { get; set; } = string.Empty;

    [Required, StringLength(180, MinimumLength = 3)]
    public string Subject { get; set; } = string.Empty;

    [Required, StringLength(80, MinimumLength = 1)]
    public string InquiryType { get; set; } = string.Empty;

    [Required, StringLength(2000, MinimumLength = 10)]
    public string Message { get; set; } = string.Empty;

    public string? TurnstileToken { get; set; }

    // Honeypot field. Real users never fill it. Bots often do.
    public string? Website { get; set; }
}
