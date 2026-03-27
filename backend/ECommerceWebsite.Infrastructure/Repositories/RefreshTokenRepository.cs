using ECommerceWebsite.Domain.Entities;
using ECommerceWebsite.Domain.Interfaces;
using ECommerceWebsite.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace ECommerceWebsite.Infrastructure.Repositories;

/// <summary>EF Core implementation of <see cref="IRefreshTokenRepository"/>.</summary>
public sealed class RefreshTokenRepository : IRefreshTokenRepository
{
    private readonly AppDbContext _db;
    private readonly TimeProvider _timeProvider;

    /// <summary>Initialises the repository with the application database context.</summary>
    public RefreshTokenRepository(AppDbContext db, TimeProvider timeProvider)
    {
        _db = db;
        _timeProvider = timeProvider;
    }

    /// <inheritdoc/>
    public async Task<RefreshToken?> GetByTokenHashAsync(string tokenHash, CancellationToken ct = default)
        => await _db.RefreshTokens
            .FirstOrDefaultAsync(rt => rt.TokenHash == tokenHash, ct);

    /// <inheritdoc/>
    public async Task AddAsync(RefreshToken token, CancellationToken ct = default)
    {
        await _db.RefreshTokens.AddAsync(token, ct);
        await _db.SaveChangesAsync(ct);
    }

    /// <inheritdoc/>
    public async Task RotateAsync(RefreshToken consumed, RefreshToken replacement, CancellationToken ct = default)
    {
        await using var transaction = await _db.Database.BeginTransactionAsync(ct);
        try
        {
            _db.RefreshTokens.Update(consumed);
            await _db.RefreshTokens.AddAsync(replacement, ct);
            await _db.SaveChangesAsync(ct);
            await transaction.CommitAsync(ct);
        }
        catch
        {
            await transaction.RollbackAsync(ct);
            throw;
        }
    }

    /// <inheritdoc/>
    public async Task RevokeAllByFamilyAsync(Guid family, CancellationToken ct = default)
    {
        var now = _timeProvider.GetUtcNow().UtcDateTime;
        await _db.RefreshTokens
            .Where(rt => rt.Family == family && rt.RevokedAt == null)
            .ExecuteUpdateAsync(s => s.SetProperty(rt => rt.RevokedAt, now), ct);
    }

    /// <inheritdoc/>
    public async Task UpdateAsync(RefreshToken token, CancellationToken ct = default)
    {
        _db.RefreshTokens.Update(token);
        await _db.SaveChangesAsync(ct);
    }
}
