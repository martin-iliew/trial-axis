using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using AppJwtConstants = ECommerceWebsite.Application.Common.Constants.JwtConstants;
using ECommerceWebsite.Application.Services;
using ECommerceWebsite.Domain.Entities;
using Microsoft.IdentityModel.Tokens;

namespace ECommerceWebsite.Infrastructure.ExternalApis;

/// <summary>
/// Implements <see cref="ITokenService"/> using RS256-signed JWTs and SHA-256 hashed refresh tokens.
/// JWT key material is resolved at startup and injected as a singleton so signing and validation use
/// the same configuration.
/// <para>
/// It MUST be registered as a singleton in the DI container: <c>AddSingleton&lt;ITokenService, TokenService&gt;()</c>.
/// Registering as scoped or transient will re-import the RSA key on every request, which is expensive.
/// </para>
/// </summary>
public sealed class TokenService : ITokenService, IDisposable
{
    private static readonly JwtSecurityTokenHandler _handler = new();

    private readonly RSA _rsaPrivate;
    private readonly RsaSecurityKey _signingKey;
    private readonly string _issuer;
    private readonly string _audience;

    /// <summary>Loads RSA private key from shared JWT key material.</summary>
    public TokenService(JwtKeyMaterial jwtKeyMaterial)
    {
        _issuer = jwtKeyMaterial.Issuer;
        _audience = jwtKeyMaterial.Audience;

        _rsaPrivate = RSA.Create();
        _rsaPrivate.ImportFromPem(jwtKeyMaterial.PrivateKeyPem);
        _signingKey = new RsaSecurityKey(_rsaPrivate);
    }

    /// <inheritdoc/>
    public string GenerateAccessToken(User user, DateTimeOffset now)
    {
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(JwtRegisteredClaimNames.Iat,
                now.ToUnixTimeSeconds().ToString(),
                ClaimValueTypes.Integer64),
            // ClaimTypes.Role maps to the long-URI scheme; ASP.NET Core's JwtBearerHandler re-maps it
            // automatically so [Authorize(Roles = "...")] works. External consumers decoding the JWT
            // directly must look for the full URI key, not the short "role" key.
            new Claim(ClaimTypes.Role, user.Role.ToString())
        };

        var credentials = new SigningCredentials(_signingKey, SecurityAlgorithms.RsaSha256);
        var token = new JwtSecurityToken(
            issuer:             _issuer,
            audience:           _audience,
            claims:             claims,
            expires:            now.UtcDateTime.AddSeconds(AppJwtConstants.AccessTokenExpirySeconds),
            signingCredentials: credentials);

        return _handler.WriteToken(token);
    }

    /// <inheritdoc/>
    public string GenerateRefreshToken()
    {
        // 32 cryptographically-random bytes → 44-character Base64 string.
        var bytes = RandomNumberGenerator.GetBytes(32);
        return Convert.ToBase64String(bytes);
    }

    /// <inheritdoc/>
    public string HashToken(string token)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(token));
        return Convert.ToHexString(bytes).ToLowerInvariant(); // 64-char hex string
    }

    /// <inheritdoc/>
    public void Dispose()
    {
        _rsaPrivate.Dispose();
    }
}
