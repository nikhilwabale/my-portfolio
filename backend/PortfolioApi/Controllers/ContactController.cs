using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using PortfolioAPI.Data;
using PortfolioAPI.DTOs;
using PortfolioAPI.Extensions;
using PortfolioAPI.Models;
using PortfolioAPI.Services;

namespace PortfolioAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class ContactController(AppDbContext dbContext, ITurnstileService turnstileService, IEmailService emailService, ILogger<ContactController> logger) : ControllerBase
{
    [HttpPost]
    [EnableRateLimiting("contact")]
    public async Task<ActionResult<ContactResponse>> Submit([FromBody] ContactRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new ContactResponse(false, "Please check the form fields and try again."));
        }

        if (!string.IsNullOrWhiteSpace(request.Website))
        {
            logger.LogWarning("Honeypot triggered for IP {Ip}", HttpContext.Connection.RemoteIpAddress?.ToString());
            return BadRequest(new ContactResponse(false, "Request rejected."));
        }

        var remoteIp = HttpContext.Connection.RemoteIpAddress?.ToString();
        var captchaValid = await turnstileService.VerifyAsync(request.TurnstileToken, remoteIp, cancellationToken);
        if (!captchaValid)
        {
            return BadRequest(new ContactResponse(false, "Security verification failed. Please refresh and try again."));
        }

        var message = new ContactMessage
        {
            Name = StringSanitizer.Clean(request.Name, 100),
            Email = StringSanitizer.Clean(request.Email, 255).ToLowerInvariant(),
            Subject = StringSanitizer.Clean(request.Subject, 180),
            InquiryType = StringSanitizer.Clean(request.InquiryType, 80),
            Message = StringSanitizer.Clean(request.Message, 2000),
            IpAddress = remoteIp,
            UserAgent = Request.Headers.UserAgent.ToString(),
            SubmittedAtUtc = DateTime.UtcNow
        };

        try
        {
            dbContext.ContactMessages.Add(message);
            await dbContext.SaveChangesAsync(cancellationToken);

            var emailResult = await emailService.SendContactNotificationAsync(message, cancellationToken);
            message.EmailNotificationSent = emailResult.Success;
            message.EmailFailureReason = emailResult.Error?.Length > 1000 ? emailResult.Error[..1000] : emailResult.Error;
            await dbContext.SaveChangesAsync(cancellationToken);

            if (!emailResult.Success)
            {
                logger.LogWarning("Contact message {MessageId} was saved but email notification failed: {Reason}", message.Id, emailResult.Error);
                return StatusCode(StatusCodes.Status502BadGateway, new ContactResponse(false, "Your message was saved, but email notification failed. Please check Resend API key, sender and verified recipient settings."));
            }
        }
        catch (DbUpdateException ex)
        {
            logger.LogError(ex, "Database save failed for contact request from {Email}", message.Email);
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new ContactResponse(false, "Contact service is temporarily unavailable. Please try again later."));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unexpected error while processing contact request from {Email}", message.Email);
            return StatusCode(StatusCodes.Status500InternalServerError, new ContactResponse(false, "Something went wrong. Please try again later."));
        }

        return Ok(new ContactResponse(true, "Message submitted successfully. I will get back to you soon.", message.Id));
    }
}
