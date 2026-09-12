"use client";

import { AuthProvider } from "@/contexts/auth-context";
import AppLayout from "@/components/AppLayout";
import { usePathname } from "next/navigation";

const publicPaths = ["/login", "/register"];

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublic = publicPaths.includes(pathname);

  return (
    <AuthProvider>
      {isPublic ? children : <AppLayout>{children}</AppLayout>}
    </AuthProvider>
  );
}
