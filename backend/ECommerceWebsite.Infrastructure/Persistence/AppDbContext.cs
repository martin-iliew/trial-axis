using ECommerceWebsite.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ECommerceWebsite.Infrastructure.Persistence;

/// <summary>EF Core database context for the ECommerce application.</summary>
public sealed class AppDbContext : DbContext
{
    /// <inheritdoc/>
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    /// <summary>Users table.</summary>
    public DbSet<User> Users => Set<User>();

    /// <summary>Refresh tokens table.</summary>
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    /// <inheritdoc/>
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        // Discovers all IEntityTypeConfiguration<T> classes in this assembly automatically.
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
