import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import { clearTokens, getAccessToken, setAccessToken } from "../utils/tokenStorage";
import type { ApiError } from "../constants/errors";
import {
  getAuthRoutes,
  normalizeBaseUrl,
  readAccessToken,
  toApiError,
} from "./contract";

type AsyncMaybe<T> = T | Promise<T>;

type ApiClientConfig = {
  baseURL: string;
  onAuthFailure?: () => AsyncMaybe<void>;
};

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

let runtimeConfig: ApiClientConfig = {
  baseURL: "",
};
let apiClient: AxiosInstance = createClient(runtimeConfig);
let refreshPromise: Promise<string> | null = null;

function createClient(config: ApiClientConfig): AxiosInstance {
  const instance = axios.create({
    baseURL: normalizeBaseUrl(config.baseURL),
    headers: { "Content-Type": "application/json" },
    timeout: 15000,
    withCredentials: true,
  });

  instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Response interceptor: handle 401 with token refresh
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config as RetryableRequestConfig | undefined;
      const authRoutes = getAuthRoutes();
      const requestUrl = originalRequest?.url ?? "";
      const isRefreshRequest = requestUrl.includes(authRoutes.refresh);
      const isLoginRequest = requestUrl.includes(authRoutes.login);
      const isLogoutRequest = requestUrl.includes(authRoutes.logout);

      if (
        error.response?.status === 401 &&
        originalRequest &&
        !originalRequest._retry &&
        !isLoginRequest &&
        !isRefreshRequest &&
        !isLogoutRequest
      ) {
        originalRequest._retry = true;

        try {
          if (!refreshPromise) {
            refreshPromise = refreshAccessToken(instance.defaults.baseURL ?? "", runtimeConfig)
              .finally(() => {
                refreshPromise = null;
              });
          }

          const newToken = await refreshPromise;
          originalRequest.headers = originalRequest.headers ?? {};
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return instance(originalRequest);
        } catch {
          return Promise.reject(error);
        }
      }

      return Promise.reject(
        toApiError(
          error.response?.data,
          error.response?.statusText || error.message || "Network error"
        ) satisfies ApiError
      );
    }
  );

  return instance;
}

async function refreshAccessToken(baseURL: string, config: ApiClientConfig): Promise<string> {
  try {
    const routes = getAuthRoutes();

    const response = await axios.post(
      `${baseURL}${routes.refresh}`,
      undefined,
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      }
    );

    const nextAccessToken = readAccessToken(response.data);
    setAccessToken(nextAccessToken);
    return nextAccessToken;
  } catch (error) {
    clearTokens();
    await config.onAuthFailure?.();
    throw error;
  }
}

export function configureApiClient(config: ApiClientConfig): void {
  runtimeConfig = {
    ...config,
    baseURL: normalizeBaseUrl(config.baseURL),
  };
  apiClient = createClient(runtimeConfig);
}

export const api = {
  get: <T>(endpoint: string): Promise<T> =>
    apiClient.get(endpoint).then((r) => r.data),

  post: <T>(endpoint: string, body?: unknown): Promise<T> =>
    apiClient.post(endpoint, body).then((r) => r.data),

  put: <T>(endpoint: string, body?: unknown): Promise<T> =>
    apiClient.put(endpoint, body).then((r) => r.data),

  delete: <T>(endpoint: string): Promise<T> =>
    apiClient.delete(endpoint).then((r) => r.data),
};
