package com.nikhilwabale.portfolioapi.service;

public interface TurnstileService {
    boolean verify(String token, String remoteIp);
}
