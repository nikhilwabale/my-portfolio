using System.Threading.RateLimiting;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using PortfolioApi.Data;
using PortfolioApi.Extensions;
using PortfolioApi.Middleware;
using PortfolioApi.Options;
using PortfolioApi.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<SecurityOptions>(builder.Configuration.GetSection("Security"));
builder.Services.Configure<TurnstileOptions>(builder.Configuration.GetSection("Turnstile"));
builder.Services.Configure<ResendOptions>(builder.Configuration.GetSection("Resend"));

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<AppDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    if (string.IsNullOrWhiteSpace(connectionString))
    {
        throw new InvalidOperationException("Database connection string is missing. Set ConnectionStrings__DefaultConnection.");
    }

    options.UseSqlServer(connectionString);
});

builder.Services.AddHttpClient<ITurnstileService, TurnstileService>();
builder.Services.AddHttpClient<IEmailService, ResendEmailService>();

var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? ["http://localhost:3000"];
builder.Services.AddCors(options =>
{
    options.AddPolicy("PortfolioFrontend", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .WithMethods("POST", "OPTIONS")
              .WithHeaders("Content-Type", "X-Portfolio-Client")
              .SetPreflightMaxAge(TimeSpan.FromMinutes(30));
    });
});

var permitLimit = builder.Configuration.GetValue<int?>("RateLimiting:PermitLimit") ?? 3;
var windowMinutes = builder.Configuration.GetValue<int?>("RateLimiting:WindowMinutes") ?? 60;
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddFixedWindowLimiter("contact", limiterOptions =>
    {
        limiterOptions.PermitLimit = permitLimit;
        limiterOptions.Window = TimeSpan.FromMinutes(windowMinutes);
        limiterOptions.QueueLimit = 0;
        limiterOptions.AutoReplenishment = true;
    });

    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
    {
        var ip = context.GetClientIpAddress();
        return RateLimitPartition.GetFixedWindowLimiter(ip, _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = 60,
            Window = TimeSpan.FromMinutes(1),
            QueueLimit = 0,
            AutoReplenishment = true
        });
    });
});

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});

var app = builder.Build();

app.UseForwardedHeaders();
app.UseMiddleware<SecurityHeadersMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseCors("PortfolioFrontend");
app.UseRateLimiter();
app.MapControllers();

app.Run();
