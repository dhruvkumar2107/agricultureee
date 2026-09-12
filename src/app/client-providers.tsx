"use client";

import { useEffect, useState } from "react";
import { AuthProvider } from "@/contexts/auth-context";
import AppLayout from "@/components/AppLayout";
import { usePathname } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";

const publicPaths = ["/login", "/register"];

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublic = publicPaths.includes(pathname);
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    fetch("/api/seed", { method: "POST" })
      .then(() => setSeeded(true))
      .catch(() => setSeeded(true));
  }, []);

  if (!seeded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <LoadingSpinner size="lg" text="Initializing AgriSentinel..." />
      </div>
    );
  }

  return (
    <AuthProvider>
      {isPublic ? children : <AppLayout>{children}</AppLayout>}
    </AuthProvider>
  );
}
