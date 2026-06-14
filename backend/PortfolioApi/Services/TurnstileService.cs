using System.Net.Http.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Options;
using PortfolioApi.Options;

namespace PortfolioApi.Services;

public sealed class TurnstileService(HttpClient httpClient, IOptions<TurnstileOptions> options, ILogger<TurnstileService> logger) : ITurnstileService
{
    public async Task<bool> VerifyAsync(string? token, string ipAddress, CancellationToken cancellationToken)
    {
        var secret = options.Value.SecretKey;
        if (string.IsNullOrWhiteSpace(secret))
        {
            logger.LogWarning("Turnstile secret key not configured. Captcha verification skipped.");
            return true;
        }

        if (string.IsNullOrWhiteSpace(token)) return false;

        var form = new Dictionary<string, string>
        {
            ["secret"] = secret,
            ["response"] = token,
            ["remoteip"] = ipAddress
        };

        using var response = await httpClient.PostAsync("https://challenges.cloudflare.com/turnstile/v0/siteverify", new FormUrlEncodedContent(form), cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            logger.LogWarning("Turnstile verification HTTP failure: {StatusCode}", response.StatusCode);
            return false;
        }

        var result = await response.Content.ReadFromJsonAsync<TurnstileVerifyResponse>(cancellationToken: cancellationToken);
        return result?.Success == true;
    }

    private sealed class TurnstileVerifyResponse
    {
        [JsonPropertyName("success")]
        public bool Success { get; set; }
    }
}
