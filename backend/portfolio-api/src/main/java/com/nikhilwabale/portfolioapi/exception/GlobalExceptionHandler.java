package com.nikhilwabale.portfolioapi.exception;

import com.nikhilwabale.portfolioapi.dto.ContactResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Minimal exception handler kept in scope for Stage 1: it only ensures Bean Validation
 * failures come back in the same {success,message} envelope the frontend already expects,
 * instead of Spring's default error body. Broader, structured error handling (RFC 7807
 * problem details, more exception types) is a Stage 2 code-quality task.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ContactResponse> handleValidation(MethodArgumentNotValidException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ContactResponse.fail("Please check the form fields and try again."));
    }
}
