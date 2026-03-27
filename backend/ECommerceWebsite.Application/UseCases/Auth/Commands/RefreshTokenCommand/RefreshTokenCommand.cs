using ECommerceWebsite.Application.DTOs.Responses;
using MediatR;

namespace ECommerceWebsite.Application.UseCases.Auth.Commands.RefreshTokenCommand;

/// <summary>
/// Rotates a refresh token: revokes the presented token, issues a new one in the same family,
/// and returns a new access token. If the presented token has already been revoked (reuse),
/// the entire family is invalidated and an UnauthorizedException is thrown.
/// </summary>
public record RefreshTokenCommand(string RefreshToken) : IRequest<TokenResult>;
