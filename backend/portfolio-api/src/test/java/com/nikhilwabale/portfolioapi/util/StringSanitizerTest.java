package com.nikhilwabale.portfolioapi.util;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;

import static org.assertj.core.api.Assertions.assertThat;

class StringSanitizerTest {

    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = {" ", "   ", "\t\n"})
    void blankOrNullInputReturnsEmptyString(String input) {
        assertThat(StringSanitizer.clean(input, 100)).isEmpty();
    }

    @Test
    void stripsHtmlTags() {
        assertThat(StringSanitizer.clean("<script>alert('xss')</script>Hello", 100))
                .isEqualTo("alert('xss')Hello");
    }

    @Test
    void stripsMultipleAndNestedLookingTags() {
        assertThat(StringSanitizer.clean("<b>Bold</b> and <i>Italic</i>", 100))
                .isEqualTo("Bold and Italic");
    }

    @Test
    void removesNullBytes() {
        assertThat(StringSanitizer.clean("Hello\0World", 100)).isEqualTo("HelloWorld");
    }

    @Test
    void trimsLeadingAndTrailingWhitespace() {
        assertThat(StringSanitizer.clean("  padded value  ", 100)).isEqualTo("padded value");
    }

    @Test
    void truncatesToMaxLength() {
        var input = "a".repeat(50);
        assertThat(StringSanitizer.clean(input, 10)).isEqualTo("a".repeat(10));
    }

    @Test
    void leavesShortInputUnderMaxLengthUntouched() {
        assertThat(StringSanitizer.clean("short", 100)).isEqualTo("short");
    }

    @Test
    void combinesTagStrippingAndTruncation() {
        // Tags are stripped first, then the *cleaned* result is truncated.
        assertThat(StringSanitizer.clean("<p>1234567890</p>", 5)).isEqualTo("12345");
    }

    @Test
    void plainTextWithNoSpecialCharactersIsUnchanged() {
        assertThat(StringSanitizer.clean("Nikhil Wabale", 100)).isEqualTo("Nikhil Wabale");
    }
}
