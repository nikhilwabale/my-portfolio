package com.nikhilwabale.portfolioapi.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;

/**
 * Maps to the existing "ContactMessages" table created by the previous EF Core backend.
 * Column names are quoted/case-preserved via hibernate.globally_quoted_identifiers
 * (see application.yml) so the schema is reused as-is, unmodified.
 */
@Entity
@Table(name = "ContactMessages")
@Getter
@Setter
@NoArgsConstructor
public class ContactMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id")
    private Integer id;

    @Column(name = "Name", length = 100, nullable = false)
    private String name;

    @Column(name = "Email", length = 255, nullable = false)
    private String email;

    @Column(name = "Subject", length = 180, nullable = false)
    private String subject;

    @Column(name = "InquiryType", length = 80, nullable = false)
    private String inquiryType;

    @Column(name = "Message", length = 2000, nullable = false)
    private String message;

    @Column(name = "IpAddress", length = 64)
    private String ipAddress;

    @Column(name = "UserAgent", length = 512)
    private String userAgent;

    @Column(name = "SubmittedAtUtc", nullable = false)
    private OffsetDateTime submittedAtUtc = OffsetDateTime.now(java.time.ZoneOffset.UTC);

    // Reserved for a future admin "mark as read" view; not set by the contact flow itself.
    // Mirrors the old C# entity, where IsRead was equally unused by ContactController.
    @Column(name = "IsRead", nullable = false)
    private boolean read = false;

    @Column(name = "EmailNotificationSent", nullable = false)
    private boolean emailNotificationSent = false;

    @Column(name = "EmailFailureReason", length = 1000)
    private String emailFailureReason;
}
