"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { ROUTES } from "@/lib/constants";
import { useAuthStore } from "@/store/authStore";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const onboardingComplete = useAuthStore((s) => s.onboardingComplete);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const setHasHydrated = useAuthStore((s) => s.setHasHydrated);
  const syncOnboardingFromApi = useAuthStore((s) => s.syncOnboardingFromApi);
  const syncAttemptedFor = useRef<string | null>(null);
  const [syncedFor, setSyncedFor] = useState<string | null>(null);
  const sessionKey = user?.id ?? "";
  const statusReady =
    hasHydrated &&
    isAuthenticated &&
    (onboardingComplete || syncedFor === sessionKey);

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

  // Confirm seller status from API before forcing onboarding.
  useEffect(() => {
    if (!hasHydrated || !isAuthenticated) {
      syncAttemptedFor.current = null;
      return;
    }
    if (onboardingComplete || syncAttemptedFor.current === sessionKey) return;
    syncAttemptedFor.current = sessionKey;
    void syncOnboardingFromApi().finally(() => setSyncedFor(sessionKey));
  }, [
    hasHydrated,
    isAuthenticated,
    onboardingComplete,
    sessionKey,
    syncOnboardingFromApi,
  ]);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated) {
      router.replace(ROUTES.LOGIN);
      return;
    }
    if (!statusReady) return;
    if (user?.mustChangePassword) {
      router.replace(ROUTES.CHANGE_PASSWORD);
      return;
    }
    const assignedManager = user?.role === "SELLER_MANAGER";
    if (
      !onboardingComplete &&
      !assignedManager &&
      !pathname.startsWith("/onboarding")
    ) {
      router.replace(ROUTES.ONBOARDING);
    }
  }, [
    hasHydrated,
    statusReady,
    isAuthenticated,
    onboardingComplete,
    pathname,
    router,
    user?.mustChangePassword,
    user?.role,
  ]);

  if (!hasHydrated || !isAuthenticated || !statusReady) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F4F7F9]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#1B6EF3] border-t-transparent" />
      </div>
    );
  }

  if (
    user?.role !== "SELLER_MANAGER" &&
    !onboardingComplete &&
    !pathname.startsWith("/onboarding")
  ) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F4F7F9]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#1B6EF3] border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
