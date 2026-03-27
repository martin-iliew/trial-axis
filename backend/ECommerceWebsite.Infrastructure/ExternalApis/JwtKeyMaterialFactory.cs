using System.Security.Cryptography;

namespace ECommerceWebsite.Infrastructure.ExternalApis;

public sealed record JwtKeyMaterial(
    string PrivateKeyPem,
    string PublicKeyPem,
    string Issuer,
    string Audience);

public static class JwtKeyMaterialFactory
{
    private const string DefaultIssuer = "ECommerceShop";
    private const string DefaultAudience = "ECommerceShopClient";

    public static JwtKeyMaterial Create(
        string? privateKeyPem,
        string? publicKeyPem,
        string? issuer,
        string? audience,
        bool isDevelopment)
    {
        privateKeyPem = Normalize(privateKeyPem);
        publicKeyPem = Normalize(publicKeyPem);
        issuer = Normalize(issuer) ?? DefaultIssuer;
        audience = Normalize(audience) ?? DefaultAudience;

        if (privateKeyPem is null)
        {
            if (publicKeyPem is not null)
            {
                throw new InvalidOperationException("JWT_PRIVATE_KEY environment variable is required when JWT_PUBLIC_KEY is configured.");
            }

            if (!isDevelopment)
            {
                throw new InvalidOperationException("JWT_PRIVATE_KEY environment variable is not set.");
            }

            using var generatedRsa = RSA.Create(2048);
            privateKeyPem = generatedRsa.ExportPkcs8PrivateKeyPem();
            publicKeyPem = generatedRsa.ExportSubjectPublicKeyInfoPem();
        }
        else if (publicKeyPem is null)
        {
            using var privateRsa = RSA.Create();
            privateRsa.ImportFromPem(privateKeyPem);
            publicKeyPem = privateRsa.ExportSubjectPublicKeyInfoPem();
        }

        return new JwtKeyMaterial(
            PrivateKeyPem: privateKeyPem,
            PublicKeyPem: publicKeyPem,
            Issuer: issuer,
            Audience: audience);
    }

    private static string? Normalize(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
