IF DB_ID('PortfolioDB') IS NULL
BEGIN
    CREATE DATABASE PortfolioDB;
END
GO

USE PortfolioDB;
GO

IF OBJECT_ID('dbo.ContactMessages', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.ContactMessages
    (
        Id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_ContactMessages PRIMARY KEY,
        Name NVARCHAR(100) NOT NULL,
        Email NVARCHAR(255) NOT NULL,
        Subject NVARCHAR(180) NOT NULL,
        InquiryType NVARCHAR(80) NOT NULL,
        Message NVARCHAR(2000) NOT NULL,
        IpAddress NVARCHAR(64) NULL,
        UserAgent NVARCHAR(512) NULL,
        SubmittedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_ContactMessages_SubmittedAtUtc DEFAULT SYSUTCDATETIME(),
        IsRead BIT NOT NULL CONSTRAINT DF_ContactMessages_IsRead DEFAULT 0,
        EmailNotificationSent BIT NOT NULL CONSTRAINT DF_ContactMessages_EmailNotificationSent DEFAULT 0,
        EmailFailureReason NVARCHAR(MAX) NULL
    );

    CREATE INDEX IX_ContactMessages_SubmittedAtUtc ON dbo.ContactMessages(SubmittedAtUtc DESC);
    CREATE INDEX IX_ContactMessages_Email ON dbo.ContactMessages(Email);
END
GO
