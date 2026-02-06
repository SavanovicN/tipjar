"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { THIRTY_SECONDS } from "@/lib/constants";
import { isConnectionError } from "@/lib/errors";

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error) => {
          if (isConnectionError(error)) {
            return false;
          }
          return failureCount < 3;
        },
        refetchOnWindowFocus: false,
        staleTime: THIRTY_SECONDS,
      },
    },
  });
}

export const TanstackProviderComponent = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(() => createQueryClient());

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};
