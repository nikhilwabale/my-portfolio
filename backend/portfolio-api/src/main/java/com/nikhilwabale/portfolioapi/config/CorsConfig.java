package com.nikhilwabale.portfolioapi.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;

@Configuration
@RequiredArgsConstructor
public class CorsConfig implements WebMvcConfigurer {

    private static final List<String> DEFAULT_ORIGINS =
            List.of("http://localhost:3000", "https://my-portfolio-lake-one.vercel.app");

    private final CorsProperties corsProperties;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        var origins = corsProperties.getAllowedOrigins();
        var allowedOrigins = (origins == null || origins.isEmpty())
                ? DEFAULT_ORIGINS
                : origins;

        registry.addMapping("/api/**")
                .allowedOrigins(allowedOrigins.toArray(new String[0]))
                .allowedMethods("POST", "OPTIONS")
                .allowedHeaders("Content-Type")
                .maxAge(3600);
    }
}
