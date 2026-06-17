namespace PortfolioAPI.DTOs;

public sealed record ContactResponse(bool Success, string Message, int? MessageId = null);
