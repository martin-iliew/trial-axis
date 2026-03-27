using ECommerceWebsite.Application.DTOs.Responses;
using MediatR;

namespace ECommerceWebsite.Application.UseCases.Auth.Commands.RegisterCommand;

/// <summary>Registers a new user account. Returns the created user's public profile.</summary>
public record RegisterCommand(string Email, string Password) : IRequest<UserResponse>;
