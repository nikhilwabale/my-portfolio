package com.nikhilwabale.portfolioapi.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Mirrors the frontend's Zod schema (frontend/src/components/sections/Contact.tsx) field for field,
 * so client-side and server-side validation stay in sync.
 */
public record ContactRequest(
        @NotBlank(message = "Name is required.")
        @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters.")
        String name,

        @NotBlank(message = "Email is required.")
        @Email(message = "Please provide a valid email address.")
        @Size(max = 255, message = "Email is too long.")
        String email,

        @NotBlank(message = "Subject is required.")
        @Size(min = 3, max = 180, message = "Subject must be between 3 and 180 characters.")
        String subject,

        @NotBlank(message = "Inquiry type is required.")
        @Size(max = 80, message = "Inquiry type is too long.")
        String inquiryType,

        @NotBlank(message = "Message is required.")
        @Size(min = 10, max = 2000, message = "Message must be between 10 and 2000 characters.")
        String message,

        String turnstileToken,

        // Honeypot field. Real users never fill it. Bots often do.
        String website
) {
}
