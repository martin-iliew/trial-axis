using ECommerceWebsite.Application.Services;
using ECommerceWebsite.Domain.Interfaces;
using MediatR;

namespace ECommerceWebsite.Application.UseCases.Auth.Commands.LogoutCommand;

/// <summary>Handles <see cref="LogoutCommand"/>: revokes the token if it exists and is still active.</summary>
public sealed class LogoutCommandHandler : IRequestHandler<LogoutCommand>
{
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly ITokenService _tokenService;
    private readonly TimeProvider _timeProvider;

    /// <summary>Initialises the handler with required dependencies.</summary>
    public LogoutCommandHandler(
        IRefreshTokenRepository refreshTokenRepository,
        ITokenService tokenService,
        TimeProvider timeProvider)
    {
        _refreshTokenRepository = refreshTokenRepository;
        _tokenService = tokenService;
        _timeProvider = timeProvider;
    }

    /// <inheritdoc/>
    public async Task Handle(LogoutCommand request, CancellationToken cancellationToken)
    {
        var tokenHash = _tokenService.HashToken(request.RefreshToken);
        var stored = await _refreshTokenRepository.GetByTokenHashAsync(tokenHash, cancellationToken);

        var now = _timeProvider.GetUtcNow().UtcDateTime;
        if (stored is null || !stored.IsActiveAt(now))
            return; // Already gone or expired — logout is idempotent.

        stored.Revoke(now);
        await _refreshTokenRepository.UpdateAsync(stored, cancellationToken);
    }
}
