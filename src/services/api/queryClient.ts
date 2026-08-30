import { QueryClient } from '@tanstack/react-query';

// Shared React Query client.
//
// Defaults tuned for this app:
// - staleTime 2 min: most screens re-mount often (route changes); this stops a
//   refetch storm without making data feel stale.
// - retry 1: the axios layer in utils/api.ts already retries 5xx/network errors
//   with back-off, so React Query only needs a single extra attempt.
// - refetchOnWindowFocus off: POS / dashboard are left open for long stretches;
//   focus refetches were noisy. Screens that want fresh-on-focus can opt back in.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
