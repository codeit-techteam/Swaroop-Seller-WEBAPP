"use client";

import "@/services/apiClient";

import { QueryProvider } from "./query-provider";
import { ThemeProvider } from "./theme-provider";
import { ToastProvider } from "./toast-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      <QueryProvider>
        {children}
        <ToastProvider />
      </QueryProvider>
    </ThemeProvider>
  );
}
