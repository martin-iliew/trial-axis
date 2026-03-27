using ECommerceWebsite.Application.Common.Exceptions;
using ECommerceWebsite.Application.UseCases.Auth.Commands.LoginCommand;
using ECommerceWebsite.Application.UseCases.Auth.Commands.LogoutCommand;
using ECommerceWebsite.Application.UseCases.Auth.Commands.RefreshTokenCommand;
using ECommerceWebsite.Application.UseCases.Auth.Commands.RegisterCommand;
using ECommerceWebsite.Application.UseCases.Auth.Queries.GetCurrentUserQuery;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using ECommerceWebsite.Application.DTOs.Requests;
using ECommerceWebsite.Application.DTOs.Responses;

namespace ECommerceWebsite.API.Controllers;

/// <summary>
/// Authentication endpoints. This is a thin HTTP adapter — all business logic lives in MediatR handlers.
/// The controller's only responsibilities are: reading HTTP inputs, setting cookies, and returning HTTP responses.
/// </summary>
[ApiController]
[Route("api/auth")]
[Produces("application/json")]
public sealed class AuthController : ControllerBase
{
    private const string RefreshTokenCookieName = "refreshToken";
    private readonly ISender _sender;

    /// <summary>Initialises the controller with the MediatR sender.</summary>
    public AuthController(ISender sender)
    {
        _sender = sender;
    }

    /// <summary>Registers a new user account.</summary>
    /// <param name="request">Email and password payload.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>201 Created with the new user's public profile.</returns>
    [HttpPost("register")]
    [ProducesResponseType(typeof(UserResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request, CancellationToken ct)
    {
        var result = await _sender.Send(new RegisterCommand(request.Email, request.Password), ct);
        return CreatedAtAction(nameof(Me), result);
    }

    /// <summary>
    /// Authenticates a user. Returns the access token in the JSON body.
    /// Sets a Secure, HttpOnly, SameSite=Strict refresh token cookie.
    /// </summary>
    /// <param name="request">Email and password payload.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>200 OK with <see cref="AuthResponse"/>.</returns>
    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken ct)
    {
        var result = await _sender.Send(new LoginCommand(request.Email, request.Password), ct);
        SetRefreshTokenCookie(result.RefreshToken);
        return Ok(result.Auth);
    }

    /// <summary>
    /// Rotates the refresh token. Reads the current token from the HttpOnly cookie,
    /// issues a new token pair, and updates the cookie.
    /// </summary>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>200 OK with a new <see cref="AuthResponse"/>.</returns>
    [HttpPost("refresh")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Refresh(CancellationToken ct)
    {
        var refreshToken = Request.Cookies[RefreshTokenCookieName];
        if (string.IsNullOrEmpty(refreshToken))
            throw new UnauthorizedException("Refresh token cookie is missing.");

        var result = await _sender.Send(new RefreshTokenCommand(refreshToken), ct);
        SetRefreshTokenCookie(result.RefreshToken);
        return Ok(result.Auth);
    }

    /// <summary>Revokes the refresh token in the database and clears the cookie.</summary>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>204 No Content.</returns>
    [HttpPost("logout")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Logout(CancellationToken ct)
    {
        var refreshToken = Request.Cookies[RefreshTokenCookieName];
        if (!string.IsNullOrEmpty(refreshToken))
            await _sender.Send(new LogoutCommand(refreshToken), ct);

        Response.Cookies.Delete(RefreshTokenCookieName);
        return NoContent();
    }

    /// <summary>Returns the authenticated user's public profile. Requires a valid Bearer access token.</summary>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>200 OK with <see cref="UserResponse"/>.</returns>
    [HttpGet("me")]
    [Authorize]
    [ProducesResponseType(typeof(UserResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Me(CancellationToken ct)
    {
        // The JWT sub claim holds the user id. JwtRegisteredClaimNames.Sub maps to ClaimTypes.NameIdentifier.
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)
                       ?? User.FindFirstValue("sub");

        if (!Guid.TryParse(userIdClaim, out var userId))
            throw new UnauthorizedException("User identity claim is missing or invalid.");

        var result = await _sender.Send(new GetCurrentUserQuery(userId), ct);
        return Ok(result);
    }

    // ── Private helpers ─────────────────────────────────────────────────────

    private void SetRefreshTokenCookie(string rawToken)
    {
        Response.Cookies.Append(RefreshTokenCookieName, rawToken, BuildRefreshTokenCookieOptions());
    }

    private CookieOptions BuildRefreshTokenCookieOptions()
    {
        var environment = HttpContext.RequestServices.GetRequiredService<IHostEnvironment>();

        return new CookieOptions
        {
            HttpOnly = true,
            Secure   = true,
            SameSite = environment.IsDevelopment() ? SameSiteMode.None : SameSiteMode.Strict,
            Expires  = DateTimeOffset.UtcNow.AddDays(7)
        };
    }
}
