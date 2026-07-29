"use client";

import {
  Building2,
  Check,
  ClipboardCheck,
  CreditCard,
  FileText,
  Fuel,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { ONBOARDING_STEPS } from "@/lib/constants/onboarding";
import { cn } from "@/lib/utils";
import { useOnboardingStore } from "@/store/onboardingStore";
import type { OnboardingStepId } from "@/types/onboarding";

const stepIcons: Record<OnboardingStepId, React.ElementType> = {
  company: Building2,
  documents: FileText,
  "gst-pan": ShieldCheck,
  bank: CreditCard,
  location: MapPin,
  review: ClipboardCheck,
  submitted: Check,
};

interface StepSidebarProps {
  className?: string;
}

export function StepSidebar({ className }: StepSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const completedSteps = useOnboardingStore((s) => s.completedSteps);
  const isStepAccessible = useOnboardingStore((s) => s.isStepAccessible);

  const handleStepClick = (stepId: OnboardingStepId, route: string) => {
    if (isStepAccessible(stepId)) {
      router.push(route);
    }
  };

  return (
    <aside
      className={cn(
        "flex w-72 shrink-0 flex-col bg-sidebar text-sidebar-foreground",
        className,
      )}
    >
      <div className="border-b border-sidebar-muted px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-accent">
            <Fuel className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold">Petro Admin</p>
            <p className="text-xs text-sidebar-foreground/60">
              SELLER ONBOARDING
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        <p className="mb-3 px-3 text-xs font-medium uppercase tracking-wider text-sidebar-foreground/50">
          Onboarding Progress
        </p>
        {ONBOARDING_STEPS.map((step) => {
          const Icon = stepIcons[step.id];
          const isActive = pathname === step.route;
          const isCompleted = completedSteps.includes(step.id);
          const isAccessible = isStepAccessible(step.id);

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => handleStepClick(step.id, step.route)}
              disabled={!isAccessible}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                isActive && "bg-sidebar-accent/20 text-white",
                !isActive && isAccessible && "hover:bg-sidebar-muted/50",
                !isAccessible && "cursor-not-allowed opacity-40",
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  isCompleted && "bg-success text-white",
                  isActive && !isCompleted && "bg-sidebar-accent text-white",
                  !isActive &&
                    !isCompleted &&
                    "bg-sidebar-muted text-sidebar-foreground/70",
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>
              <span className={cn("font-medium", isActive && "text-white")}>
                {step.label}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-muted px-6 py-4">
        <p className="text-xs text-sidebar-foreground/50">
          Need help?{" "}
          <Link href="#" className="text-sidebar-accent underline">
            Contact Support
          </Link>
        </p>
      </div>
    </aside>
  );
}
