const fallbackBaseUrl = "https://localhost:7236";

export const WEB_API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? fallbackBaseUrl).replace(/\/+$/, "");
