import type { ApiError } from "@shared/constants/errors";

function hasStringProperty<Key extends string>(
  value: unknown,
  key: Key,
): value is Record<Key, string> {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;
  return typeof record[key] === "string";
}

function hasNumberProperty<Key extends string>(
  value: unknown,
  key: Key,
): value is Record<Key, number> {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;
  return typeof record[key] === "number";
}

export function isApiError(error: unknown): error is ApiError {
  return hasStringProperty(error, "message");
}

export function getApiErrorStatus(error: unknown): number | undefined {
  return hasNumberProperty(error, "status") ? error.status : undefined;
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (hasStringProperty(error, "message") && error.message.trim().length > 0) {
    return error.message;
  }

  if (hasStringProperty(error, "title") && error.title.trim().length > 0) {
    return error.title;
  }

  return fallback;
}
