"use client";

import { AuthProvider } from "@/components/auth/auth-context";
import { ToastProvider } from "@/components/toast";

export default function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ToastProvider>{children}</ToastProvider>
    </AuthProvider>
  );
}
