import { QueryClient } from "@tanstack/react-query";

const twelveHours = 12 * 60 * 60 * 1000;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: twelveHours,
      gcTime: twelveHours,
    },
  },
});
