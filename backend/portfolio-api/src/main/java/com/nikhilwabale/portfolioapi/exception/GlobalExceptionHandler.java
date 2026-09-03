package com.nikhilwabale.portfolioapi.exception;

import com.nikhilwabale.portfolioapi.dto.ContactResponse;
import com.nikhilwabale.portfolioapi.dto.ErrorResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

/**
 * Central exception handling so every error response - not just the contact endpoint's own
 * domain errors - comes back as consistent JSON instead of Spring Boot's default HTML/error
 * body. ContactController still handles its own domain-specific failures (honeypot, captcha,
 * database, email) directly, since those carry contact-specific context; this class covers
 * failures that happen before or around a controller method: malformed request bodies, bean
 * validation, wrong HTTP methods, unmatched routes, and anything unexpected.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ContactResponse> handleValidation(MethodArgumentNotValidException ex) {
        var message = ex.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(error -> error.getDefaultMessage())
                .orElse("Please check the form fields and try again.");

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ContactResponse.fail(message));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleUnreadableBody(HttpMessageNotReadableException ex) {
        log.warn("Rejected a request with a malformed or unreadable body.");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ErrorResponse.of("Malformed request body. Please check your input and try again."));
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ErrorResponse> handleMethodNotSupported(HttpRequestMethodNotSupportedException ex) {
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED)
                .body(ErrorResponse.of("This endpoint does not support " + ex.getMethod() + " requests."));
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(NoResourceFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ErrorResponse.of("The requested resource was not found."));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnexpected(Exception ex) {
        log.error("Unhandled exception reached the global error handler.", ex);
        return ResponseEntity.internalServerError()
                .body(ErrorResponse.of("Something went wrong. Please try again later."));
    }
}
