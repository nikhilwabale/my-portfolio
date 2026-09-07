package com.nikhilwabale.portfolioapi.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

/**
 * Bounded executor for the contact flow's email step (see ContactNotificationService), so the
 * HTTP response doesn't wait on Resend's API. Deliberately tiny: this app runs on Render's
 * free-tier 512MB container (see Dockerfile's JVM flags), and email notifications are
 * low-volume, so a couple of threads is plenty - this is not a general-purpose task pool.
 */
@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean(name = "contactNotificationExecutor")
    public Executor contactNotificationExecutor() {
        var executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(1);
        executor.setMaxPoolSize(2);
        executor.setQueueCapacity(50);
        executor.setThreadNamePrefix("contact-notify-");
        executor.initialize();
        return executor;
    }
}
