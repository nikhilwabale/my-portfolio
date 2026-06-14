using System.Text.RegularExpressions;

namespace PortfolioApi.Helpers;

public static partial class InputSanitizer
{
    public static string Clean(string? value, int maxLength)
    {
        if (string.IsNullOrWhiteSpace(value)) return string.Empty;

        var withoutTags = HtmlTagRegex().Replace(value, string.Empty);
        var normalized = withoutTags.Replace("\0", string.Empty).Trim();
        return normalized.Length <= maxLength ? normalized : normalized[..maxLength];
    }

    [GeneratedRegex("<.*?>", RegexOptions.Compiled)]
    private static partial Regex HtmlTagRegex();
}
