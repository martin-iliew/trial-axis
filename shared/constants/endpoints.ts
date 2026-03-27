export const API_ROUTES = {
  auth: {
    login: "/api/auth/login",
    register: "/api/auth/register",
    me: "/api/auth/me",
    refresh: "/api/auth/refresh",
    logout: "/api/auth/logout",
  },
  admin: {
    users: "/api/admin/users",
  },
} as const;
