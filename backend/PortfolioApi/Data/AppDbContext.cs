using Microsoft.EntityFrameworkCore;
using PortfolioApi.Models;

namespace PortfolioApi.Data;

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
            entity.Property(x => x.Subject).HasMaxLength(200).IsRequired();
            entity.Property(x => x.Message).HasMaxLength(2000).IsRequired();
            entity.Property(x => x.InquiryType).HasMaxLength(30).IsRequired();
            entity.Property(x => x.IpAddress).HasMaxLength(80);
            entity.Property(x => x.UserAgent).HasMaxLength(500);
            entity.Property(x => x.EmailStatus).HasMaxLength(120).IsRequired();
            entity.Property(x => x.SubmittedAtUtc).HasDefaultValueSql("SYSUTCDATETIME()");
            entity.Property(x => x.IsRead).HasDefaultValue(false);
            entity.HasIndex(x => x.SubmittedAtUtc);
            entity.HasIndex(x => x.Email);
            entity.HasIndex(x => x.IpAddress);
        });
    }
}
