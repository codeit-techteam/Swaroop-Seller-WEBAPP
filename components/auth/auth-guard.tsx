"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { ROUTES } from "@/lib/constants";
import { useAuthStore } from "@/store/authStore";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const onboardingComplete = useAuthStore((s) => s.onboardingComplete);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const setHasHydrated = useAuthStore((s) => s.setHasHydrated);

  useEffect(() => {
    const finish = () => setHasHydrated(true);
    const persistApi = useAuthStore.persist;
    const unsub = persistApi.onFinishHydration(finish);
    if (persistApi.hasHydrated()) finish();
    const timeout = window.setTimeout(finish, 600);
    return () => {
      unsub();
      window.clearTimeout(timeout);
    };
  }, [setHasHydrated]);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated) {
      router.replace(ROUTES.LOGIN);
      return;
    }
    if (!onboardingComplete && !pathname.startsWith("/onboarding")) {
      router.replace(ROUTES.ONBOARDING);
    }
  }, [hasHydrated, isAuthenticated, onboardingComplete, pathname, router]);

  if (!hasHydrated || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F4F7F9]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#1B6EF3] border-t-transparent" />
      </div>
    );
  }

  if (!onboardingComplete && !pathname.startsWith("/onboarding")) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F4F7F9]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#1B6EF3] border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
