using ECommerceWebsite.Application.DTOs.Responses;
using MediatR;

namespace ECommerceWebsite.Application.UseCases.Auth.Queries.GetCurrentUserQuery;

/// <summary>Returns the public profile for the authenticated user identified by <see cref="UserId"/>.</summary>
public record GetCurrentUserQuery(Guid UserId) : IRequest<UserResponse>;
