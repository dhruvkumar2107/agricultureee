"use client";

import { useEffect, useState } from "react";
import { AuthProvider } from "@/contexts/auth-context";
import AppLayout from "@/components/AppLayout";
import { usePathname } from "next/navigation";

const publicPaths = ["/login", "/register"];

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublic = publicPaths.includes(pathname);
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    const timeout = new AbortController();
    const timer = setTimeout(() => timeout.abort(), 15000);
    fetch("/api/seed", { method: "POST", signal: timeout.signal })
      .finally(() => {
        clearTimeout(timer);
        setSeeded(true);
      });
  }, []);

  if (!seeded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-stone-600">Initializing AgriSentinel...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      {isPublic ? children : <AppLayout>{children}</AppLayout>}
    </AuthProvider>
  );
}
