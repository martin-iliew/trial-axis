import type { ApiError } from "../constants/errors.ts";
import { API_ROUTES } from "../constants/endpoints.ts";

type AccessTokenPayload = {
  accessToken: string;
};

type ProblemDetailsLike = {
  status?: number;
  title?: string;
  detail?: string;
  message?: string;
};

export function normalizeBaseUrl(baseURL: string): string {
  return baseURL.replace(/\/+$/, "");
}

export function getAuthRoutes(): {
  login: string;
  refresh: string;
  logout: string;
} {
  return {
    login: API_ROUTES.auth.login,
    refresh: API_ROUTES.auth.refresh,
    logout: API_ROUTES.auth.logout,
  };
}

export function readAccessToken(payload: unknown): string {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "accessToken" in payload &&
    typeof (payload as AccessTokenPayload).accessToken === "string"
  ) {
    return (payload as AccessTokenPayload).accessToken;
  }

  throw new Error("Expected auth response payload with accessToken.");
}

export function toApiError(payload: unknown, fallbackMessage: string): ApiError {
  if (typeof payload === "object" && payload !== null) {
    const data = payload as ProblemDetailsLike;

    if (typeof data.detail === "string" || typeof data.title === "string") {
      return {
        status: data.status,
        title: data.title,
        message: data.detail ?? data.title ?? fallbackMessage,
      };
    }

    if (typeof data.message === "string") {
      return {
        status: data.status,
        title: data.title,
        message: data.message,
      };
    }
  }

  return { message: fallbackMessage };
}
