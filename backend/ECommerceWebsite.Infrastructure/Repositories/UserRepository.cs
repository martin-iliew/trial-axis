using ECommerceWebsite.Domain.Entities;
using ECommerceWebsite.Domain.Interfaces;
using ECommerceWebsite.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace ECommerceWebsite.Infrastructure.Repositories;

/// <summary>EF Core implementation of <see cref="IUserRepository"/>.</summary>
public sealed class UserRepository : IUserRepository
{
    private readonly AppDbContext _db;

    /// <summary>Initialises the repository with the application database context.</summary>
    public UserRepository(AppDbContext db)
    {
        _db = db;
    }

    /// <inheritdoc/>
    public async Task<User?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _db.Users.FindAsync(id, ct);

    /// <inheritdoc/>
    public async Task<User?> GetByEmailAsync(string email, CancellationToken ct = default)
        => await _db.Users
            .FirstOrDefaultAsync(u => u.Email == email.ToLowerInvariant(), ct);

    /// <inheritdoc/>
    public async Task AddAsync(User user, CancellationToken ct = default)
    {
        await _db.Users.AddAsync(user, ct);
        await _db.SaveChangesAsync(ct);
    }

    /// <inheritdoc/>
    public async Task UpdateAsync(User user, CancellationToken ct = default)
    {
        _db.Users.Update(user);
        await _db.SaveChangesAsync(ct);
    }
}
