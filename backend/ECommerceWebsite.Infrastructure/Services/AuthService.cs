using ECommerceWebsite.Application.Services;
using ECommerceWebsite.Domain.Entities;
using ECommerceWebsite.Domain.Enums;
using ECommerceWebsite.Domain.Interfaces;

namespace ECommerceWebsite.Infrastructure.Services;

/// <summary>
/// Implements <see cref="IAuthService"/> using BCrypt with work factor 12.
/// Lives in Infrastructure because it takes a compile-time dependency on the BCrypt.Net-Next library.
/// </summary>
public sealed class AuthService : IAuthService
{
    private const int BcryptWorkFactor = 12;
    private readonly IUserRepository _userRepository;

    /// <summary>Initialises the service with the user repository.</summary>
    public AuthService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    /// <inheritdoc/>
    public async Task<User> CreateUserAsync(
        string email,
        string password,
        DateTime createdAt,
        UserRole role = UserRole.Customer,
        CancellationToken ct = default)
    {
        // BCrypt.HashPassword is CPU-bound; offload to a thread pool thread.
        var passwordHash = await Task.Run(
            () => BCrypt.Net.BCrypt.HashPassword(password, workFactor: BcryptWorkFactor), ct);

        var user = new User(email.ToLowerInvariant(), passwordHash, createdAt, role);
        await _userRepository.AddAsync(user, ct);
        return user;
    }

    /// <inheritdoc/>
    public async Task<User?> VerifyCredentialsAsync(string email, string password, CancellationToken ct = default)
    {
        var user = await _userRepository.GetByEmailAsync(email, ct);
        if (user is null)
            return null;

        // BCrypt.Verify uses constant-time comparison internally to prevent timing attacks.
        var valid = await Task.Run(() => BCrypt.Net.BCrypt.Verify(password, user.PasswordHash), ct);
        return valid ? user : null;
    }
}
