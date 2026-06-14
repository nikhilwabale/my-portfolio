namespace PortfolioApi.DTOs;

public sealed record ContactResponseDto(bool Success, string Message, int? ReferenceId = null, bool EmailNotificationSent = false);
