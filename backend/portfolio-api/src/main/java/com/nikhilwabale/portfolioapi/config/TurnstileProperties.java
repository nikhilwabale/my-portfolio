package com.nikhilwabale.portfolioapi.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "turnstile")
public class TurnstileProperties {
    private String siteKey;
    private String secretKey;
}
