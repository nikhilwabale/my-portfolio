package com.nikhilwabale.portfolioapi.util;

import java.util.regex.Pattern;

public final class StringSanitizer {

    private static final Pattern HTML_TAG_PATTERN = Pattern.compile("<.*?>");

    private StringSanitizer() {
    }

    public static String clean(String value, int maxLength) {
        if (value == null || value.isBlank()) {
            return "";
        }

        String cleaned = HTML_TAG_PATTERN.matcher(value.trim()).replaceAll("");
        cleaned = cleaned.replace("\0", "");

        return cleaned.length() <= maxLength ? cleaned : cleaned.substring(0, maxLength);
    }
}
