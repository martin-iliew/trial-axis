using ECommerceWebsite.Application.Common.Exceptions;
using ECommerceWebsite.Application.DTOs.Responses;
using ECommerceWebsite.Application.Services;
using ECommerceWebsite.Domain.Interfaces;
using MediatR;

namespace ECommerceWebsite.Application.UseCases.Auth.Commands.RegisterCommand;

/// <summary>Handles <see cref="RegisterCommand"/>: checks email uniqueness then delegates creation to IAuthService.</summary>
public sealed class RegisterCommandHandler : IRequestHandler<RegisterCommand, UserResponse>
{
    private readonly IUserRepository _userRepository;
    private readonly IAuthService _authService;
    private readonly TimeProvider _timeProvider;

    /// <summary>Initialises the handler with required dependencies.</summary>
    public RegisterCommandHandler(IUserRepository userRepository, IAuthService authService, TimeProvider timeProvider)
    {
        _userRepository = userRepository;
        _authService = authService;
        _timeProvider = timeProvider;
    }

    /// <inheritdoc/>
    public async Task<UserResponse> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        var existing = await _userRepository.GetByEmailAsync(request.Email, cancellationToken);
        if (existing is not null)
            throw new ConflictException("An account with this email address already exists.");

        var now = _timeProvider.GetUtcNow().UtcDateTime;
        var user = await _authService.CreateUserAsync(request.Email, request.Password, now, ct: cancellationToken);
        return new UserResponse(user.Id, user.Email, user.CreatedAt, user.Role);
    }
}
