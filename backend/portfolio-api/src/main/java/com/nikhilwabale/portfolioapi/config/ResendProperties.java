package com.nikhilwabale.portfolioapi.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Bound from "resend.*" properties. Spring's relaxed env-var binding means a single
 * property here is reachable both as structured config (resend.api-key in application.yml)
 * and as a flat env var (RESEND_API_KEY) - no manual fallback chain needed, unlike the
 * old ASP.NET Core version which had to check three config keys by hand.
 */
@Getter
@Setter
@ConfigurationProperties(prefix = "resend")
public class ResendProperties {
    private String apiKey;
    private String fromEmail = "onboarding@resend.dev";
    private String toEmail = "wablenikhil2000@gmail.com";
}
