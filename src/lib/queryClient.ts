/* SOLO PARA SSR */

import { QueryClient } from "@tanstack/react-query";

export function getQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
      },
    },
  });
}
