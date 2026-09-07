package com.nikhilwabale.portfolioapi.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.net.http.HttpClient;
import java.time.Duration;

/**
 * Named HttpClient beans so the outbound timeout for each external dependency is explicit
 * and independently configurable, and so the client itself is a mockable constructor
 * dependency in tests instead of a hardcoded field.
 */
@Configuration
public class HttpClientConfig {

    @Bean
    public HttpClient resendHttpClient() {
        return HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    @Bean
    public HttpClient turnstileHttpClient() {
        return HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(8))
                .build();
    }
}
