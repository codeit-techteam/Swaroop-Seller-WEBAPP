"use client";

import { Package } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { ROUTES } from "@/lib/constants";
import { ONBOARDING_STEPS } from "@/lib/constants/onboarding";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";

export function OnboardingShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isPreview = searchParams.get("preview") === "1";
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
    if (onboardingComplete && !isPreview) router.replace(ROUTES.DASHBOARD);
  }, [hasHydrated, isAuthenticated, isPreview, onboardingComplete, router]);

  if (!hasHydrated || !isAuthenticated || (onboardingComplete && !isPreview)) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F4F7F9]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#1B6EF3] border-t-transparent" />
      </div>
    );
  }

  const currentIndex = Math.max(
    0,
    ONBOARDING_STEPS.findIndex((step) => pathname.startsWith(step.route)),
  );

  return (
    <div className="min-h-screen bg-[#F4F7F9]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href={ROUTES.ONBOARDING} className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#0B1F3A] text-white">
              <Package className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#0B1F3A]">PetroTrade</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1B6EF3]">
                Seller Onboarding
              </p>
            </div>
          </Link>
          <p className="text-sm text-slate-500">
            Step {currentIndex + 1} of {ONBOARDING_STEPS.length}
          </p>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-6 py-8">
        <ol className="mb-8 grid grid-cols-2 gap-2 md:grid-cols-6">
          {ONBOARDING_STEPS.map((step, index) => (
            <li key={step.id}>
              <Link
                href={isPreview ? `${step.route}?preview=1` : step.route}
                className={cn(
                  "block rounded-lg border px-3 py-2 text-xs font-medium",
                  index === currentIndex
                    ? "border-[#1B6EF3] bg-[#E8F1FF] text-[#1B6EF3]"
                    : index < currentIndex
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-white text-slate-500",
                )}
              >
                {index + 1}. {step.label}
              </Link>
            </li>
          ))}
        </ol>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
