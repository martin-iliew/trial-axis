// ECommerceWebsite.Infrastructure/Persistence/Seeders/AdminSeeder.cs
using ECommerceWebsite.Application.Services;
using ECommerceWebsite.Domain.Interfaces;
using ECommerceWebsite.Domain.Enums;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace ECommerceWebsite.Infrastructure.Persistence.Seeders;

/// <summary>
/// Seeds a default admin user on application startup.
/// Reads credentials from environment variables:
///   ADMIN_EMAIL    — admin's email address (defaults to "admin@ecommerce.com")
///   ADMIN_PASSWORD — admin's password (required; no default — checked at startup)
/// No-ops if an account with ADMIN_EMAIL already exists, so it is safe to run on every startup.
/// </summary>
public sealed class AdminSeeder : IHostedService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<AdminSeeder> _logger;
    private readonly TimeProvider _timeProvider;

    /// <summary>Initialises the seeder with the root service provider, logger, and time provider.</summary>
    public AdminSeeder(IServiceProvider serviceProvider, ILogger<AdminSeeder> logger, TimeProvider timeProvider)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
        _timeProvider = timeProvider;
    }

    /// <inheritdoc/>
    public async Task StartAsync(CancellationToken cancellationToken)
    {
        var adminEmail = Environment.GetEnvironmentVariable("ADMIN_EMAIL") ?? "admin@ecommerce.com";

        try
        {
            var adminPassword = Environment.GetEnvironmentVariable("ADMIN_PASSWORD")
                ?? throw new InvalidOperationException("ADMIN_PASSWORD environment variable is not set.");
            // IAuthService and IUserRepository are Scoped — create a scope to resolve them.
            await using var scope = _serviceProvider.CreateAsyncScope();
            var userRepository = scope.ServiceProvider.GetRequiredService<IUserRepository>();
            var authService    = scope.ServiceProvider.GetRequiredService<IAuthService>();

            var existing = await userRepository.GetByEmailAsync(adminEmail, cancellationToken);
            if (existing is not null)
            {
                _logger.LogInformation("Admin user {Email} already exists — skipping seed.", adminEmail);
                return;
            }

            var now = _timeProvider.GetUtcNow().UtcDateTime;
            await authService.CreateUserAsync(adminEmail, adminPassword, now, UserRole.Admin, cancellationToken);
            _logger.LogInformation("Admin user {Email} created.", adminEmail);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to seed admin user {Email}.", adminEmail);
            throw;
        }
    }

    /// <inheritdoc/>
    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}
