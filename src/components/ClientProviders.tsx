"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { LocaleProvider } from "./LocaleContext";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "./ThemeProvider";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: false,
          },
        },
      })
  );

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <LocaleProvider>
          <ThemeProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: "var(--zinc-900)",
                  color: "var(--zinc-100)",
                  border: "1px solid var(--zinc-800)",
                },
              }}
            />
          </ThemeProvider>
        </LocaleProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
