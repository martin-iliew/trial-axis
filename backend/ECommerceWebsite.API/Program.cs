using System.Security.Cryptography;
using AspNetCoreRateLimit;
using ECommerceWebsite.Application.Common.Behaviors;
using ECommerceWebsite.Application.DTOs.Requests;
using ECommerceWebsite.Application.Services;
using ECommerceWebsite.Application.UseCases.Auth.Commands.RegisterCommand;
using ECommerceWebsite.Domain.Interfaces;
using ECommerceWebsite.Infrastructure.ExternalApis;
using ECommerceWebsite.Infrastructure.Persistence;
using ECommerceWebsite.Infrastructure.Persistence.Seeders;
using ECommerceWebsite.Infrastructure.Repositories;
using ECommerceWebsite.Infrastructure.Services;
using ECommerceWebsite.API.Middleware;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// ── Database ──────────────────────────────────────────────────────────────────
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// ── MediatR (scans the Application assembly for all IRequestHandler<,> types) ─
builder.Services.AddMediatR(cfg =>
    cfg.RegisterServicesFromAssembly(typeof(RegisterCommand).Assembly));

// Register the validation pipeline behavior for every MediatR request.
builder.Services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));

// ── FluentValidation (scans Application assembly for all AbstractValidator<T>) ─
builder.Services.AddValidatorsFromAssemblyContaining<RegisterRequest>();

// ── Application services ──────────────────────────────────────────────────────
// TokenService MUST be singleton — it holds RSA keys loaded at startup.
var jwtKeyMaterial = JwtKeyMaterialFactory.Create(
    privateKeyPem: Environment.GetEnvironmentVariable("JWT_PRIVATE_KEY"),
    publicKeyPem: Environment.GetEnvironmentVariable("JWT_PUBLIC_KEY"),
    issuer: Environment.GetEnvironmentVariable("JWT_ISSUER") ?? builder.Configuration["Jwt:Issuer"],
    audience: Environment.GetEnvironmentVariable("JWT_AUDIENCE") ?? builder.Configuration["Jwt:Audience"],
    isDevelopment: builder.Environment.IsDevelopment());

builder.Services.AddSingleton(jwtKeyMaterial);
builder.Services.AddSingleton<ITokenService, TokenService>();
builder.Services.AddScoped<IAuthService, AuthService>();

// ── Repositories ──────────────────────────────────────────────────────────────
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();

// ── TimeProvider (used by handlers and repositories for testable time) ────────
builder.Services.AddSingleton(TimeProvider.System);

// ── Startup seed ──────────────────────────────────────────────────────────────
builder.Services.AddHostedService<AdminSeeder>();

// ── JWT Bearer authentication (RS256) ─────────────────────────────────────────
// The public key is used here for validation only. The private key stays in TokenService.
var rsa = RSA.Create();
rsa.ImportFromPem(jwtKeyMaterial.PublicKeyPem);
// Note: rsa is not explicitly disposed here. RsaSecurityKey holds a reference keeping it alive
// for the application lifetime. It will be cleaned up when the process exits.

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer           = true,
            ValidIssuer              = jwtKeyMaterial.Issuer,
            ValidateAudience         = true,
            ValidAudience            = jwtKeyMaterial.Audience,
            ValidateLifetime         = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey         = new RsaSecurityKey(rsa),
            ClockSkew                = TimeSpan.Zero // No tolerance — 15 min means exactly 15 min.
        };
    });

builder.Services.AddAuthorization();

// ── CORS ──────────────────────────────────────────────────────────────────────
// AllowCredentials() is required so the browser sends the HttpOnly refresh token cookie cross-origin.
var defaultAllowedOrigins = string.Join(',',
    "http://localhost:5173",
    "https://localhost:5173",
    "http://127.0.0.1:5173",
    "https://127.0.0.1:5173",
    "http://localhost:4173",
    "https://localhost:4173");
var allowedOrigins = (Environment.GetEnvironmentVariable("ALLOWED_ORIGINS") ?? defaultAllowedOrigins)
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

builder.Services.AddCors(options =>
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials()));

// ── IP Rate Limiting ──────────────────────────────────────────────────────────
builder.Services.AddMemoryCache();
builder.Services.Configure<IpRateLimitOptions>(builder.Configuration.GetSection("IpRateLimiting"));
builder.Services.AddSingleton<IRateLimitCounterStore, MemoryCacheRateLimitCounterStore>();
builder.Services.AddSingleton<IIpPolicyStore, MemoryCacheIpPolicyStore>();
builder.Services.AddSingleton<IRateLimitConfiguration, RateLimitConfiguration>();
builder.Services.AddSingleton<IProcessingStrategy, AsyncKeyLockProcessingStrategy>();
builder.Services.AddInMemoryRateLimiting();

// ── Exception handling + ProblemDetails ───────────────────────────────────────
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

// ── API infrastructure ────────────────────────────────────────────────────────
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "ECommerceShop API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new()
    {
        Type        = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme      = "bearer",
        BearerFormat = "JWT",
        Description = "Paste your JWT access token here. Refresh tokens are managed via HttpOnly cookies."
    });
    c.AddSecurityRequirement(new()
    {
        {
            new() { Reference = new() { Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme, Id = "Bearer" } },
            Array.Empty<string>()
        }
    });
});

// ── Build and configure middleware pipeline ───────────────────────────────────
var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseIpRateLimiting();      // Rate limiting first — reject before any processing.
app.UseExceptionHandler();    // Catch all unhandled exceptions and return ProblemDetails.
app.UseHttpsRedirection();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
