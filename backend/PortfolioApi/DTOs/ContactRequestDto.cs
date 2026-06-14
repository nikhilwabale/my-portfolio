using System.ComponentModel.DataAnnotations;

namespace PortfolioApi.DTOs;

public sealed class ContactRequestDto
{
    [Required, StringLength(100, MinimumLength = 2)]
    public string Name { get; set; } = string.Empty;

    [Required, EmailAddress, StringLength(255)]
    public string Email { get; set; } = string.Empty;

    [Required, StringLength(200, MinimumLength = 3)]
    public string Subject { get; set; } = string.Empty;

    [Required, StringLength(2000, MinimumLength = 10)]
    public string Message { get; set; } = string.Empty;

    [Required, RegularExpression("^(job|freelance|project|other)$")]
    public string InquiryType { get; set; } = "job";

    [StringLength(2048)]
    public string? TurnstileToken { get; set; }

    // Honeypot: real users never fill this. Bots often do.
    [StringLength(0)]
    public string? CompanyFaxNumber { get; set; }
}
