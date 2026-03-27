using ECommerceWebsite.Application.Common.Exceptions;
using FluentValidation;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace ECommerceWebsite.API.Middleware;

/// <summary>
/// .NET 8 IExceptionHandler that maps domain and validation exceptions to
/// RFC 7807 ProblemDetails responses. All unhandled exceptions return HTTP 500.
/// Server errors are logged; client errors (4xx) are not.
/// </summary>
public sealed class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;

    /// <summary>Initialises the handler with the application logger.</summary>
    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
    {
        _logger = logger;
    }

    /// <inheritdoc/>
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        var (statusCode, title, detail) = exception switch
        {
            ConflictException ex     => (StatusCodes.Status409Conflict,           "Conflict",           ex.Message),
            UnauthorizedException ex => (StatusCodes.Status401Unauthorized,       "Unauthorized",       ex.Message),
            ValidationException ex   => (StatusCodes.Status400BadRequest,         "Validation failed",
                string.Join(" | ", ex.Errors.Select(e => e.ErrorMessage))),
            _                        => (StatusCodes.Status500InternalServerError, "An unexpected error occurred.", "See server logs for details.")
        };

        if (statusCode == StatusCodes.Status500InternalServerError)
            _logger.LogError(exception, "Unhandled exception on {Method} {Path}",
                httpContext.Request.Method, httpContext.Request.Path);

        httpContext.Response.StatusCode = statusCode;
        await httpContext.Response.WriteAsJsonAsync(
            new ProblemDetails
            {
                Status   = statusCode,
                Title    = title,
                Detail   = detail,
                Instance = httpContext.Request.Path
            },
            cancellationToken);

        return true;
    }
}
