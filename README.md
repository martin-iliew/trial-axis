# AUBG Hackathon 2026

This repo contains:
- `backend/`: ASP.NET Core API with JWT auth, rotating refresh tokens, SQL Server persistence, and admin seeding.
- `apps/web/`: Vite React app using the current backend auth contract.
- `shared/`: shared auth contracts, API client wiring, permissions, and validation.

## Current Integration Shape

- Web auth uses `/api/auth/login`, `/api/auth/refresh`, and `/api/auth/logout` with an HttpOnly refresh cookie.
- The active frontend fetches the current user via `/api/auth/me`.
- The old notes template flow is intentionally removed from active routes until matching backend endpoints exist.

## Local Run Order

Open separate terminals for backend and web.

### 1. Backend

Required environment variables:
- `JWT_PRIVATE_KEY` outside development
- `ALLOWED_ORIGINS` if you need custom web origins

Development behavior:
- If `ASPNETCORE_ENVIRONMENT=Development` and no JWT keys are configured, the API generates an in-memory RSA keypair for that process.
- If `JWT_PRIVATE_KEY` is set and `JWT_PUBLIC_KEY` is omitted, the public key is derived automatically.

Run:

```powershell
cd backend
dotnet run --project ECommerceWebsite.API
```

Default local URLs from launch settings:
- `https://localhost:7236`
- `http://localhost:5248`

Swagger is available at `/swagger` in development.

### 2. Web

Create `apps/web/.env` from `apps/web/.env.example` if needed.

```powershell
cd apps/web
npm install
npm run dev
```

Default expected API base URL:
- `https://localhost:7236`
