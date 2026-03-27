using ECommerceWebsite.Application.Common.Constants;
using ECommerceWebsite.Application.Common.Exceptions;
using ECommerceWebsite.Application.DTOs.Responses;
using ECommerceWebsite.Application.Services;
using ECommerceWebsite.Domain.Entities;
using ECommerceWebsite.Domain.Interfaces;
using MediatR;

namespace ECommerceWebsite.Application.UseCases.Auth.Commands.RefreshTokenCommand;

/// <summary>Handles <see cref="RefreshTokenCommand"/>: validates the token, detects reuse, and rotates.</summary>
public sealed class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, TokenResult>
{
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly IUserRepository _userRepository;
    private readonly ITokenService _tokenService;
    private readonly TimeProvider _timeProvider;

    /// <summary>Initialises the handler with required dependencies.</summary>
    public RefreshTokenCommandHandler(
        IRefreshTokenRepository refreshTokenRepository,
        IUserRepository userRepository,
        ITokenService tokenService,
        TimeProvider timeProvider)
    {
        _refreshTokenRepository = refreshTokenRepository;
        _userRepository = userRepository;
        _tokenService = tokenService;
        _timeProvider = timeProvider;
    }

    /// <inheritdoc/>
    public async Task<TokenResult> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        var tokenHash = _tokenService.HashToken(request.RefreshToken);
        var stored = await _refreshTokenRepository.GetByTokenHashAsync(tokenHash, cancellationToken);

        if (stored is null)
            throw new UnauthorizedException("Refresh token not found.");

        // IMPORTANT — Transaction boundary: RevokeAllByFamilyAsync must complete atomically
        // so that no tokens in this family remain active after a reuse-detection event.
        if (stored.RevokedAt is not null)
        {
            await _refreshTokenRepository.RevokeAllByFamilyAsync(stored.Family, cancellationToken);
            throw new UnauthorizedException("Refresh token reuse detected. All sessions in this family have been revoked.");
        }

        var now = _timeProvider.GetUtcNow(); // DateTimeOffset — passed through to token generation
        if (stored.ExpiresAt <= now.UtcDateTime)
            throw new UnauthorizedException("Refresh token has expired. Please log in again.");

        var user = await _userRepository.GetByIdAsync(stored.UserId, cancellationToken);
        if (user is null)
            throw new UnauthorizedException("User not found.");

        // Rotate atomically: revoke the old token and persist the new one in a single transaction.
        stored.Revoke(now.UtcDateTime);
        var rawNewToken = _tokenService.GenerateRefreshToken();
        var newHash = _tokenService.HashToken(rawNewToken);
        var newToken = new RefreshToken(newHash, user.Id, now.UtcDateTime.AddDays(JwtConstants.RefreshTokenExpiryDays), stored.Family, now.UtcDateTime);
        await _refreshTokenRepository.RotateAsync(stored, newToken, cancellationToken);

        var accessToken = _tokenService.GenerateAccessToken(user, now);
        var auth = new AuthResponse(accessToken, ExpiresIn: JwtConstants.AccessTokenExpirySeconds);

        return new TokenResult(auth, rawNewToken);
    }
}
