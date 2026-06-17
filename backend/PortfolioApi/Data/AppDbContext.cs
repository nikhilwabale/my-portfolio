using Microsoft.EntityFrameworkCore;
using PortfolioAPI.Models;

namespace PortfolioAPI.Data;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<ContactMessage> ContactMessages => Set<ContactMessage>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ContactMessage>(entity =>
        {
            entity.ToTable("ContactMessages");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Name).HasMaxLength(100).IsRequired();
            entity.Property(x => x.Email).HasMaxLength(255).IsRequired();
            entity.Property(x => x.Subject).HasMaxLength(180).IsRequired();
            entity.Property(x => x.InquiryType).HasMaxLength(80).IsRequired();
            entity.Property(x => x.Message).HasMaxLength(2000).IsRequired();
            entity.Property(x => x.IpAddress).HasMaxLength(64);
            entity.Property(x => x.UserAgent).HasMaxLength(512);
            entity.Property(x => x.SubmittedAtUtc).HasDefaultValueSql("(NOW() AT TIME ZONE 'UTC')");
            entity.Property(x => x.EmailFailureReason).HasMaxLength(1000);
            entity.HasIndex(x => x.SubmittedAtUtc);
            entity.HasIndex(x => x.Email);
        });
    }
}
