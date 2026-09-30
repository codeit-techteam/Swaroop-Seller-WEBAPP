"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

let activeQueryClient: QueryClient | null = null;

export function clearSellerQueries() {
  activeQueryClient?.clear();
}
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

import { IS_DEV } from "@/lib/constants";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => {
    const client = makeQueryClient();
    activeQueryClient = client;
    return client;
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {IS_DEV ? <ReactQueryDevtools initialIsOpen={false} /> : null}
    </QueryClientProvider>
  );
}
