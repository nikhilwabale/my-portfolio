package com.nikhilwabale.portfolioapi.service;

import com.nikhilwabale.portfolioapi.entity.ContactMessage;

public interface EmailService {

    record EmailResult(boolean success, String error) {
        public static EmailResult ok() {
            return new EmailResult(true, null);
        }

        public static EmailResult failure(String error) {
            return new EmailResult(false, error);
        }
    }

    EmailResult sendContactNotification(ContactMessage message);
}
