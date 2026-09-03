package com.nikhilwabale.portfolioapi.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Swagger UI availability itself is controlled per-profile via
 * springdoc.api-docs.enabled / springdoc.swagger-ui.enabled
 * (see application.yml / application-prod.yml) so it is dev-only.
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI portfolioApiOpenApi() {
        return new OpenAPI().info(new Info()
                .title("Portfolio API")
                .description("Contact form backend for nikhilwabale.dev")
                .version("v1")
                .contact(new Contact().name("Nikhil Wabale").email("wablenikhil2000@gmail.com")));
    }
}
