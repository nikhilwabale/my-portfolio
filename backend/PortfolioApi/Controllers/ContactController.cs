using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Options;
using PortfolioApi.Data;
using PortfolioApi.DTOs;
using PortfolioApi.Extensions;
using PortfolioApi.Helpers;
using PortfolioApi.Models;
using PortfolioApi.Options;
using PortfolioApi.Services;

namespace PortfolioApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class ContactController(AppDbContext dbContext, ITurnstileService turnstileService, IEmailService emailService, IOptions<SecurityOptions> securityOptions, ILogger<ContactController> logger) : ControllerBase
{
    [HttpPost]
    [EnableRateLimiting("contact")]
    public async Task<ActionResult<ContactResponseDto>> Submit([FromBody] ContactRequestDto request, CancellationToken cancellationToken)
    {
        var expectedClientKey = securityOptions.Value.ContactClientKey;
        var suppliedClientKey = Request.Headers["X-Portfolio-Client"].FirstOrDefault();
        if (!string.IsNullOrWhiteSpace(expectedClientKey) && !string.Equals(suppliedClientKey, expectedClientKey, StringComparison.Ordinal))
        {
            return BadRequest(new ContactResponseDto(false, "Invalid request source."));
        }

        if (!string.IsNullOrWhiteSpace(request.CompanyFaxNumber))
        {
            logger.LogWarning("Honeypot triggered from IP {Ip}", HttpContext.GetClientIpAddress());
            return Ok(new ContactResponseDto(true, "Message received."));
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(new ContactResponseDto(false, "Please check the form fields and try again."));
        }

        var ipAddress = HttpContext.GetClientIpAddress();
        var captchaRequired = securityOptions.Value.RequireCaptcha;
        var captchaVerified = await turnstileService.VerifyAsync(request.TurnstileToken, ipAddress, cancellationToken);
        if (captchaRequired && !captchaVerified)
        {
            return BadRequest(new ContactResponseDto(false, "Security verification failed. Please refresh and try again."));
        }

        var message = new ContactMessage
        {
            Name = InputSanitizer.Clean(request.Name, 100),
            Email = InputSanitizer.Clean(request.Email, 255),
            Subject = InputSanitizer.Clean(request.Subject, 200),
            Message = InputSanitizer.Clean(request.Message, 2000),
            InquiryType = InputSanitizer.Clean(request.InquiryType, 30),
            IpAddress = InputSanitizer.Clean(ipAddress, 80),
            UserAgent = InputSanitizer.Clean(Request.Headers.UserAgent.ToString(), 500),
            CaptchaVerified = captchaVerified,
            SubmittedAtUtc = DateTime.UtcNow
        };

        dbContext.ContactMessages.Add(message);
        await dbContext.SaveChangesAsync(cancellationToken);

        var emailResult = await emailService.SendContactEmailAsync(message, cancellationToken);
        message.EmailNotificationSent = emailResult.Success;
        message.EmailStatus = InputSanitizer.Clean(emailResult.Status, 120);
        await dbContext.SaveChangesAsync(cancellationToken);

        return Ok(new ContactResponseDto(true, "Message sent successfully. Thank you for reaching out.", message.Id, emailResult.Success));
    }
}
