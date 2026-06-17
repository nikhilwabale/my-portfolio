using System.Text.Json;
using Microsoft.Extensions.Options;
using PortfolioAPI.Options;

namespace PortfolioAPI.Services;

public sealed class TurnstileService(IHttpClientFactory httpClientFactory, IConfiguration configuration, IHostEnvironment environment, IOptions<SecurityOptions> securityOptions) : ITurnstileService
{
    public async Task<bool> VerifyAsync(string? token, string? remoteIp, CancellationToken cancellationToken)
    {
        var secret = configuration["Turnstile:SecretKey"] ?? configuration["TURNSTILE_SECRET_KEY"];
        var shouldVerify = environment.IsProduction()
            ? securityOptions.Value.RequireTurnstileInProduction
            : securityOptions.Value.EnableTurnstileInDevelopment;

        if (!shouldVerify) return true;
        if (string.IsNullOrWhiteSpace(secret) || string.IsNullOrWhiteSpace(token)) return false;

        using var content = new FormUrlEncodedContent(new Dictionary<string, string>
        {
            ["secret"] = secret,
            ["response"] = token,
            ["remoteip"] = remoteIp ?? string.Empty
        });

        var client = httpClientFactory.CreateClient("turnstile");
        using var response = await client.PostAsync("https://challenges.cloudflare.com/turnstile/v0/siteverify", content, cancellationToken);
        if (!response.IsSuccessStatusCode) return false;

        await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
        var result = await JsonSerializer.DeserializeAsync<TurnstileResponse>(stream, new JsonSerializerOptions { PropertyNameCaseInsensitive = true }, cancellationToken);
        return result?.Success == true;
    }

    private sealed record TurnstileResponse(bool Success);
}
