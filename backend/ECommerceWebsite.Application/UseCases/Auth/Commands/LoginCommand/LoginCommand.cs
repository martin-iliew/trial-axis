using ECommerceWebsite.Application.DTOs.Responses;
using MediatR;

namespace ECommerceWebsite.Application.UseCases.Auth.Commands.LoginCommand;

/// <summary>Authenticates a user and returns a new access token + raw refresh token.</summary>
public record LoginCommand(string Email, string Password) : IRequest<TokenResult>;
