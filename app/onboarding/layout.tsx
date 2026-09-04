import { Suspense } from "react";

import { OnboardingShell } from "@/components/onboarding/onboarding-shell";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-[#F4F7F9]">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#1B6EF3] border-t-transparent" />
        </div>
      }
    >
      <OnboardingShell>{children}</OnboardingShell>
    </Suspense>
  );
}
