using System.Text.RegularExpressions;

namespace PortfolioAPI.Extensions;

public static partial class StringSanitizer
{
    public static string Clean(string? value, int maxLength)
    {
        if (string.IsNullOrWhiteSpace(value)) return string.Empty;
        var cleaned = HtmlTagRegex().Replace(value.Trim(), string.Empty);
        cleaned = cleaned.Replace("\0", string.Empty);
        return cleaned.Length <= maxLength ? cleaned : cleaned[..maxLength];
    }

    [GeneratedRegex("<.*?>", RegexOptions.Compiled)]
    private static partial Regex HtmlTagRegex();
}
