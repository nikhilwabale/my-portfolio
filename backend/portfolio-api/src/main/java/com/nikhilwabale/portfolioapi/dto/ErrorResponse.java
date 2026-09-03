package com.nikhilwabale.portfolioapi.dto;

/**
 * Generic {success,message} envelope for framework-level failures (malformed JSON, wrong
 * HTTP method, unmatched routes, unexpected errors) that aren't specific to the contact
 * form. ContactResponse stays reserved for ContactController's own domain responses.
 */
public record ErrorResponse(boolean success, String message) {

    public static ErrorResponse of(String message) {
        return new ErrorResponse(false, message);
    }
}
