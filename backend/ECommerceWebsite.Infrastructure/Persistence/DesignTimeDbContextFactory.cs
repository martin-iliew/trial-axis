using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace ECommerceWebsite.Infrastructure.Persistence;

/// <summary>
/// Allows <c>dotnet ef migrations add</c> to run targeting the Infrastructure project
/// without the API startup project being fully configured.
/// Reads the <c>DB_CONNECTION</c> environment variable; falls back to LocalDB for local development.
/// </summary>
public sealed class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    /// <inheritdoc/>
    public AppDbContext CreateDbContext(string[] args)
    {
        var connectionString = Environment.GetEnvironmentVariable("DB_CONNECTION")
            ?? "Server=(localdb)\\mssqllocaldb;Database=ECommerceShop;Trusted_Connection=True;";

        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlServer(connectionString)
            .Options;

        return new AppDbContext(options);
    }
}
