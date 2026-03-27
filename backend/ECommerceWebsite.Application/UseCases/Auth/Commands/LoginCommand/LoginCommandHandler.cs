using ECommerceWebsite.Application.Common.Constants;
using ECommerceWebsite.Application.Common.Exceptions;
using ECommerceWebsite.Application.DTOs.Responses;
using ECommerceWebsite.Application.Services;
using ECommerceWebsite.Domain.Entities;
using ECommerceWebsite.Domain.Interfaces;
using MediatR;

namespace ECommerceWebsite.Application.UseCases.Auth.Commands.LoginCommand;

/// <summary>Handles <see cref="LoginCommand"/>: verifies credentials and issues a JWT + refresh token pair.</summary>
public sealed class LoginCommandHandler : IRequestHandler<LoginCommand, TokenResult>
{
    private readonly IAuthService _authService;
    private readonly ITokenService _tokenService;
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly TimeProvider _timeProvider;

    /// <summary>Initialises the handler with required dependencies.</summary>
    public LoginCommandHandler(
        IAuthService authService,
        ITokenService tokenService,
        IRefreshTokenRepository refreshTokenRepository,
        TimeProvider timeProvider)
    {
        _authService = authService;
        _tokenService = tokenService;
        _refreshTokenRepository = refreshTokenRepository;
        _timeProvider = timeProvider;
    }

    /// <inheritdoc/>
    public async Task<TokenResult> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var user = await _authService.VerifyCredentialsAsync(request.Email, request.Password, cancellationToken);
        if (user is null)
            throw new UnauthorizedException("Invalid email or password.");

        var rawRefreshToken = _tokenService.GenerateRefreshToken();
        var tokenHash = _tokenService.HashToken(rawRefreshToken);
        var family = Guid.NewGuid(); // Each login starts a new family.

        var now = _timeProvider.GetUtcNow(); // DateTimeOffset — passed through to token generation
        var refreshToken = new RefreshToken(
            tokenHash,
            user.Id,
            expiresAt: now.UtcDateTime.AddDays(JwtConstants.RefreshTokenExpiryDays),
            family,
            now.UtcDateTime);

        await _refreshTokenRepository.AddAsync(refreshToken, cancellationToken);

        var accessToken = _tokenService.GenerateAccessToken(user, now);
        var auth = new AuthResponse(accessToken, ExpiresIn: JwtConstants.AccessTokenExpirySeconds);

        return new TokenResult(auth, rawRefreshToken);
    }
}
