"use client";

import { StepSidebar } from "@/components/onboarding/step-sidebar";
import { TopNavigation } from "@/components/onboarding/top-navigation";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen min-w-[1024px] flex-col bg-secondary/50">
      <div className="flex flex-1">
        <StepSidebar className="hidden lg:flex" />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopNavigation />
          <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
