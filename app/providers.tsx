"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import { GlobalLoaderProvider } from "@/components/GlobalLoader";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <GlobalLoaderProvider>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#1a1a1a",
              color: "#faf8f4",
              border: "1px solid #c9a44c",
            },
          }}
        />
      </GlobalLoaderProvider>
    </SessionProvider>
  );
}
