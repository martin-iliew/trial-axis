# Backend Development Guide

## Tech Stack
- **Framework**: ASP.NET Core Web API (.NET 8)
- **Architecture**: Clean Architecture
- **Request pipeline**: MediatR + FluentValidation
- **Persistence**: Entity Framework Core + SQL Server
- **Auth**: RS256 JWT access tokens + rotating refresh tokens
- **Ops**: Swagger, ProblemDetails, IP rate limiting, startup admin seeding

---

## Current Scope

This backend is no longer a generic product CRUD template. The active feature set is authentication and user identity:

- register
- login
- refresh
- logout
- current user lookup
- admin seeding on startup

If you extend the backend, treat the auth flow and current clean-architecture boundaries as the source of truth.

---

## Architecture

Dependency direction is strict:

```
Domain  <-  Application  <-  Infrastructure
               ^                  ^
               └──── API ─────────┘
```

| Project | Role | May reference |
|---|---|---|
| `ECommerceWebsite.Domain` | Entities, enums, repository contracts | Nothing |
| `ECommerceWebsite.Application` | Use cases, DTOs, behaviors, service interfaces | Domain only |
| `ECommerceWebsite.Infrastructure` | EF Core, repositories, token generation, seeders | Domain + Application |
| `ECommerceWebsite.API` | HTTP adapters, middleware, DI, auth/cors/rate-limit config | Application + Infrastructure |

Rules:
- Never reference API or Infrastructure from Domain or Application.
- Never put business logic in controllers.
- Never leak Infrastructure types into Application contracts.

---

## Folder Structure

```
backend/
├── backend.sln
├── CLAUDE.md
├── ECommerceWebsite.Domain/
│   ├── Entities/                    ← `User`, `RefreshToken`
│   ├── Enums/                       ← `UserRole`
│   └── Interfaces/                  ← repository contracts
├── ECommerceWebsite.Application/
│   ├── Common/
│   │   ├── Behaviors/
│   │   ├── Constants/
│   │   └── Exceptions/
│   ├── DTOs/
│   │   ├── Requests/                ← request payloads + validators
│   │   └── Responses/               ← auth/user response shapes
│   ├── Services/                    ← `IAuthService`, `ITokenService`
│   └── UseCases/
│       └── Auth/
│           ├── Commands/
│           └── Queries/
├── ECommerceWebsite.Infrastructure/
│   ├── ExternalApis/                ← token implementation
│   ├── Persistence/
│   │   ├── Configurations/
│   │   ├── Migrations/
│   │   ├── Seeders/
│   │   ├── AppDbContext.cs
│   │   └── DesignTimeDbContextFactory.cs
│   ├── Repositories/
│   └── Services/
└── ECommerceWebsite.API/
    ├── Controllers/
    ├── Middleware/
    ├── Program.cs
    ├── appsettings.json
    └── appsettings.Development.json
```

---

## Request Flow

All backend work should follow this path:

1. Controller reads HTTP input and delegates to MediatR.
2. Command or query lives in `Application/UseCases/...`.
3. `ValidationBehavior` runs validators before the handler.
4. Handler coordinates repositories and services through interfaces.
5. Infrastructure implements persistence and token concerns.
6. Controller translates the result into HTTP concerns like cookies and status codes.

Controllers may:
- read cookies
- set cookies
- choose HTTP status codes
- extract the user id from claims

Controllers should not:
- run business rules
- access the database directly
- generate tokens
- rotate refresh tokens

---

## Auth Conventions

### Web auth
- The active auth contract is cookie-based refresh for the web app.
- Clients use Bearer access tokens and call `/api/auth/me`.
- If a mobile app is intentionally introduced later, add mobile-specific endpoints only in the same change that adds the app. Otherwise skip mobile-only backend surfaces.

### Token handling
- `TokenService` is a singleton because it owns RSA key material.
- Access tokens are validated with the public key in `Program.cs`.
- Refresh tokens are persisted and rotated through the repository/use-case flow.

### Environment and config
Startup currently depends on:
- `JWT_PRIVATE_KEY` outside development
- optional `JWT_PUBLIC_KEY` (derived from the private key when omitted)
- optional `JWT_ISSUER`
- optional `JWT_AUDIENCE`
- optional `ALLOWED_ORIGINS`

Do not hardcode environment-specific secrets or origins in handlers.

---

## MediatR Pattern

Use MediatR for every feature, including auth and future domain work.

```
UseCases/
└── Auth/
    ├── Commands/
    │   ├── LoginCommand/
    │   ├── LogoutCommand/
    │   ├── RefreshTokenCommand/
    │   └── RegisterCommand/
    └── Queries/
        └── GetCurrentUserQuery/
```

Rules:
- State-changing work goes in commands.
- Read-only work goes in queries.
- One handler per command or query.
- Public payloads belong in `DTOs`, not in controllers.
- Validators currently live next to request DTOs. Keep that pattern unless you intentionally change it repo-wide.

---

## Naming Conventions

| Artifact | Convention | Example |
|---|---|---|
| Entity | `PascalCase` | `User.cs` |
| Enum | `PascalCase` | `UserRole.cs` |
| Repository interface | `I{Thing}Repository` | `IUserRepository.cs` |
| Repository implementation | `{Thing}Repository` | `UserRepository.cs` |
| Command | `{Verb}{Thing}Command` | `LoginCommand.cs` |
| Command handler | `{Verb}{Thing}CommandHandler` | `LoginCommandHandler.cs` |
| Query | `{VerbOrLookup}{Thing}Query` | `GetCurrentUserQuery.cs` |
| Query handler | `{VerbOrLookup}{Thing}QueryHandler` | `GetCurrentUserQueryHandler.cs` |
| Request DTO | `{Verb}{Thing}Request` | `LoginRequest.cs` |
| Validator | `{RequestName}Validator` | `LoginRequestValidator.cs` |
| Response DTO | descriptive `PascalCase` | `AuthResponse.cs` |
| Controller | `{Thing}Controller` | `AuthController.cs` |

Code style:
- `PascalCase` for types and members
- `camelCase` for locals and parameters
- `_camelCase` for private fields
- `sealed` for controllers, handlers, and concrete services unless inheritance is intentional
- prefer immutable `record` types for DTOs and MediatR requests
- async methods should accept `CancellationToken`
- respect nullable reference types

---

## What Goes Where

| Need to... | Put it in |
|---|---|
| Define an entity or enum | `ECommerceWebsite.Domain` |
| Add a repository contract | `ECommerceWebsite.Domain/Interfaces` |
| Add a use case | `ECommerceWebsite.Application/UseCases/{Feature}` |
| Add validation or app exceptions | `ECommerceWebsite.Application/Common` or `DTOs/Requests` |
| Implement database access | `ECommerceWebsite.Infrastructure/Repositories` |
| Change EF mappings, migrations, or seeding | `ECommerceWebsite.Infrastructure/Persistence` |
| Implement token or external integrations | `ECommerceWebsite.Infrastructure/ExternalApis` or `Services` |
| Expose HTTP endpoints or cookie handling | `ECommerceWebsite.API/Controllers` |
| Register dependencies and middleware | `ECommerceWebsite.API/Program.cs` |

---

## Practical Rules

- If you add a new feature, create a new feature folder under `Application/UseCases` instead of expanding `Auth` into a grab bag.
- Keep `Program.cs` as the composition root only. If registration grows, extract extension methods.
- Use the existing exception pipeline and ProblemDetails flow instead of ad hoc error payloads.
- Keep refresh-token semantics aligned with the contracts in `shared/`.
- If endpoint payloads change, update `shared/api-types` and the active frontend in the same change.
