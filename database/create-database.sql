IF DB_ID(N'NikhilPortfolioDb') IS NULL
BEGIN
    CREATE DATABASE NikhilPortfolioDb;
END
GO

USE NikhilPortfolioDb;
GO

IF OBJECT_ID(N'dbo.ContactMessages', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.ContactMessages
    (
        Id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_ContactMessages PRIMARY KEY,
        Name NVARCHAR(100) NOT NULL,
        Email NVARCHAR(255) NOT NULL,
        Subject NVARCHAR(200) NOT NULL,
        Message NVARCHAR(2000) NOT NULL,
        InquiryType NVARCHAR(30) NOT NULL CONSTRAINT DF_ContactMessages_InquiryType DEFAULT N'job',
        IpAddress NVARCHAR(80) NULL,
        UserAgent NVARCHAR(500) NULL,
        CaptchaVerified BIT NOT NULL CONSTRAINT DF_ContactMessages_CaptchaVerified DEFAULT 0,
        EmailNotificationSent BIT NOT NULL CONSTRAINT DF_ContactMessages_EmailNotificationSent DEFAULT 0,
        EmailStatus NVARCHAR(120) NOT NULL CONSTRAINT DF_ContactMessages_EmailStatus DEFAULT N'Pending',
        SubmittedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_ContactMessages_SubmittedAtUtc DEFAULT SYSUTCDATETIME(),
        IsRead BIT NOT NULL CONSTRAINT DF_ContactMessages_IsRead DEFAULT 0
    );

    CREATE INDEX IX_ContactMessages_SubmittedAtUtc ON dbo.ContactMessages(SubmittedAtUtc DESC);
    CREATE INDEX IX_ContactMessages_Email ON dbo.ContactMessages(Email);
    CREATE INDEX IX_ContactMessages_IpAddress ON dbo.ContactMessages(IpAddress);
END
GO
