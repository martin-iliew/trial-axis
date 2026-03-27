import { api } from "../api/client";
import { getAuthRoutes } from "../api/contract";
import { API_ROUTES } from "../constants/endpoints";
import type {
  AuthSessionResponse,
  LoginRequest,
  RegisterRequest,
  User,
} from "../api-types/auth";

type AuthApi = {
  login: (data: LoginRequest) => Promise<AuthSessionResponse>;
  register: (data: RegisterRequest) => Promise<User>;
  getMe: () => Promise<User>;
  refresh: () => Promise<AuthSessionResponse>;
  logout: () => Promise<void>;
};

const routes = getAuthRoutes();

export const authApi: AuthApi = {
  login: (data: LoginRequest) =>
    api.post<AuthSessionResponse>(routes.login, data),

  register: (data: RegisterRequest) =>
    api.post<User>(API_ROUTES.auth.register, data),

  getMe: () =>
    api.get<User>(API_ROUTES.auth.me),

  refresh: () =>
    api.post<AuthSessionResponse>(routes.refresh),

  logout: () =>
    api.post<void>(routes.logout),
};
