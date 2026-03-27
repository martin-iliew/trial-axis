using System.Security.Cryptography;
using ECommerceWebsite.Infrastructure.ExternalApis;

return Run();

static int Run()
{
    try
    {
        var developmentKeys = JwtKeyMaterialFactory.Create(
            privateKeyPem: null,
            publicKeyPem: null,
            issuer: null,
            audience: null,
            isDevelopment: true);

        Assert(developmentKeys.PrivateKeyPem.Contains("BEGIN PRIVATE KEY", StringComparison.Ordinal), "Development fallback should generate a private key.");
        Assert(developmentKeys.PublicKeyPem.Contains("BEGIN PUBLIC KEY", StringComparison.Ordinal), "Development fallback should generate a public key.");
        Assert(developmentKeys.Issuer == "ECommerceShop", "Default issuer should be applied.");
        Assert(developmentKeys.Audience == "ECommerceShopClient", "Default audience should be applied.");

        var derivedKeys = JwtKeyMaterialFactory.Create(
            privateKeyPem: developmentKeys.PrivateKeyPem,
            publicKeyPem: null,
            issuer: "CustomIssuer",
            audience: "CustomAudience",
            isDevelopment: false);

        using var expectedPublicKey = RSA.Create();
        expectedPublicKey.ImportFromPem(developmentKeys.PrivateKeyPem);
        using var actualPublicKey = RSA.Create();
        actualPublicKey.ImportFromPem(derivedKeys.PublicKeyPem);

        Assert(
            Convert.ToBase64String(expectedPublicKey.ExportSubjectPublicKeyInfo()) ==
            Convert.ToBase64String(actualPublicKey.ExportSubjectPublicKeyInfo()),
            "Public key should be derived from the configured private key.");
        Assert(derivedKeys.Issuer == "CustomIssuer", "Explicit issuer should be preserved.");
        Assert(derivedKeys.Audience == "CustomAudience", "Explicit audience should be preserved.");

        try
        {
            JwtKeyMaterialFactory.Create(
                privateKeyPem: null,
                publicKeyPem: null,
                issuer: null,
                audience: null,
                isDevelopment: false);
            throw new Exception("Missing production keys should throw.");
        }
        catch (InvalidOperationException ex)
        {
            Assert(ex.Message.Contains("JWT_PRIVATE_KEY", StringComparison.Ordinal), "Production failure should explain the missing private key.");
        }

        try
        {
            JwtKeyMaterialFactory.Create(
                privateKeyPem: null,
                publicKeyPem: developmentKeys.PublicKeyPem,
                issuer: null,
                audience: null,
                isDevelopment: false);
            throw new Exception("Public-key-only configuration should throw.");
        }
        catch (InvalidOperationException ex)
        {
            Assert(ex.Message.Contains("JWT_PRIVATE_KEY", StringComparison.Ordinal), "Public-key-only configuration should explain the missing private key.");
        }

        Console.WriteLine("JwtKeyMaterialFactory smoke checks passed.");
        return 0;
    }
    catch (Exception ex)
    {
        Console.Error.WriteLine(ex);
        return 1;
    }
}

static void Assert(bool condition, string message)
{
    if (!condition)
    {
        throw new Exception(message);
    }
}
