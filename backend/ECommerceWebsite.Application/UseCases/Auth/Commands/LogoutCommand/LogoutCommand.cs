using MediatR;

namespace ECommerceWebsite.Application.UseCases.Auth.Commands.LogoutCommand;

/// <summary>
/// Revokes the presented refresh token in the database.
/// The client is responsible for discarding the access token from memory.
/// This operation is idempotent: if the token is already gone, no error is raised.
/// </summary>
public record LogoutCommand(string RefreshToken) : IRequest;
