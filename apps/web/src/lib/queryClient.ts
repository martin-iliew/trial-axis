import { QueryClient } from "@tanstack/react-query";
import { getApiErrorStatus } from "./errors";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        // Don't retry auth errors — refresh already handled it
        const status = getApiErrorStatus(error);
        if (status === 401 || status === 403) {
          return false;
        }
        return failureCount < 2;
      },
    },
  },
});
