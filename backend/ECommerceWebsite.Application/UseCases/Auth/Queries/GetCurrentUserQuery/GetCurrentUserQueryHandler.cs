using ECommerceWebsite.Application.Common.Exceptions;
using ECommerceWebsite.Application.DTOs.Responses;
using ECommerceWebsite.Domain.Interfaces;
using MediatR;

namespace ECommerceWebsite.Application.UseCases.Auth.Queries.GetCurrentUserQuery;

/// <summary>Handles <see cref="GetCurrentUserQuery"/>: loads the user or throws if the id is invalid.</summary>
public sealed class GetCurrentUserQueryHandler : IRequestHandler<GetCurrentUserQuery, UserResponse>
{
    private readonly IUserRepository _userRepository;

    /// <summary>Initialises the handler with required dependencies.</summary>
    public GetCurrentUserQueryHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    /// <inheritdoc/>
    public async Task<UserResponse> Handle(GetCurrentUserQuery request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken);
        if (user is null)
            throw new UnauthorizedException("User not found.");

        return new UserResponse(user.Id, user.Email, user.CreatedAt, user.Role);
    }
}
