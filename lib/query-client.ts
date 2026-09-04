import { QueryClient } from "@tanstack/react-query";

/**
 * Site-wide content (menus, settings, footer, popups, home sections) is the
 * same for every visitor and only changes when someone edits the CMS, so it is
 * held for two hours rather than re-fetched on each page.
 */
export const SHARED_CONTENT_STALE_TIME = 2 * 60 * 60 * 1000;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});
