package com.nikhilwabale.portfolioapi.dto;

/** Same shape as the old C# record ContactResponse(bool Success, string Message, int? MessageId). */
public record ContactResponse(boolean success, String message, Integer messageId) {

    public static ContactResponse ok(String message, Integer messageId) {
        return new ContactResponse(true, message, messageId);
    }

    public static ContactResponse fail(String message) {
        return new ContactResponse(false, message, null);
    }
}
