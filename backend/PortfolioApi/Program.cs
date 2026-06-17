using System.Threading.RateLimiting;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using PortfolioAPI.Data;
using PortfolioAPI.Middleware;
using PortfolioAPI.Options;
using PortfolioAPI.Services;
using Npgsql;

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<EmailOptions>(builder.Configuration.GetSection("Email"));
builder.Services.Configure<SecurityOptions>(builder.Configuration.GetSection("Security"));

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException("ConnectionStrings__DefaultConnection is missing. Add your Neon PostgreSQL connection string in Render/local environment variables.");
}

connectionString = NormalizePostgresConnectionString(connectionString);

builder.Services.AddDbContext<AppDbContext>(options => options.UseNpgsql(connectionString));

builder.Services.AddHttpClient("resend", client => client.Timeout = TimeSpan.FromSeconds(10));
builder.Services.AddHttpClient("turnstile", client => client.Timeout = TimeSpan.FromSeconds(8));
builder.Services.AddScoped<IEmailService, ResendEmailService>();
builder.Services.AddScoped<ITurnstileService, TurnstileService>();

var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
var allowedOriginsCsv = builder.Configuration["AllowedOrigins"];
if (!string.IsNullOrWhiteSpace(allowedOriginsCsv))
{
    allowedOrigins = allowedOrigins
        .Concat(allowedOriginsCsv.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
        .Distinct(StringComparer.OrdinalIgnoreCase)
        .ToArray();
}

builder.Services.AddCors(options =>
{
    options.AddPolicy("frontend", policy =>
    {
        if (allowedOrigins.Length == 0)
        {
            policy.WithOrigins("http://localhost:3000", "https://my-portfolio-lake-one.vercel.app");
        }
        else
        {
            policy.WithOrigins(allowedOrigins);
        }

        policy.WithMethods("POST", "OPTIONS")
            .WithHeaders("Content-Type")
            .SetPreflightMaxAge(TimeSpan.FromHours(1));
    });
});

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    // Do not manually trust spoofable X-Forwarded-For values in application code.
    // On Render, set trusted proxy/network configuration if you need exact client IPs.
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
});

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy("contact", context =>
    {
        var ip = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";

        return RateLimitPartition.GetFixedWindowLimiter(ip, _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = 3,
            Window = TimeSpan.FromHours(1),
            QueueLimit = 0,
            AutoReplenishment = true
        });
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseForwardedHeaders();
app.UseMiddleware<SecurityHeadersMiddleware>();
app.UseHttpsRedirection();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("frontend");
app.UseRateLimiter();

app.MapGet("/health", () => Results.Ok(new { status = "ok", service = "PortfolioAPI", utc = DateTime.UtcNow }));
app.MapGet("/health/db", async (AppDbContext db, CancellationToken ct) =>
{
    var canConnect = await db.Database.CanConnectAsync(ct);
    return canConnect
        ? Results.Ok(new { status = "ok", database = "connected", provider = "PostgreSQL", utc = DateTime.UtcNow })
        : Results.Problem("Database connection failed.", statusCode: StatusCodes.Status503ServiceUnavailable);
});

await EnsureDatabaseCreatedAsync(app);

app.MapControllers();

app.Run();

static async Task EnsureDatabaseCreatedAsync(WebApplication app)
{
    using var scope = app.Services.CreateScope();
    var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("DatabaseStartup");
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    try
    {
        await db.Database.EnsureCreatedAsync();
        logger.LogInformation("Database check completed successfully.");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Database initialization failed. The API will still start, but contact form submissions will fail until the Neon connection string is configured correctly.");
    }
}

static string NormalizePostgresConnectionString(string connectionString)
{
    // Neon shows a URL-style connection string. Npgsql/EF Core works best with
    // key-value style, so this supports both formats for local and Render.
    if (!connectionString.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) &&
        !connectionString.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
    {
        return connectionString;
    }

    var uri = new Uri(connectionString);
    var userInfo = uri.UserInfo.Split(':', 2);
    var username = Uri.UnescapeDataString(userInfo.ElementAtOrDefault(0) ?? string.Empty);
    var password = Uri.UnescapeDataString(userInfo.ElementAtOrDefault(1) ?? string.Empty);
    var database = uri.AbsolutePath.TrimStart('/');

    var builder = new NpgsqlConnectionStringBuilder
    {
        Host = uri.Host,
        Port = uri.Port > 0 ? uri.Port : 5432,
        Database = database,
        Username = username,
        Password = password,
        SslMode = SslMode.Require
    };

    return builder.ConnectionString;
}
