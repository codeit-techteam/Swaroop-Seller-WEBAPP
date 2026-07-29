"use client";

import { ONBOARDING_STEPS } from "@/lib/constants/onboarding";
import { cn } from "@/lib/utils";
import type { OnboardingStepId } from "@/types/onboarding";

interface ProgressHeaderProps {
  stepId: OnboardingStepId;
  title: string;
  description?: string;
  badge?: React.ReactNode;
  className?: string;
}

export function ProgressHeader({
  stepId,
  title,
  description,
  badge,
  className,
}: ProgressHeaderProps) {
  const step = ONBOARDING_STEPS.find((s) => s.id === stepId);
  const stepNumber = step?.step ?? 1;

  return (
    <div className={cn("mb-6", className)}>
      <div className="mb-2 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Step {stepNumber} of {ONBOARDING_STEPS.length} — Onboarding Journey
          </p>
          <h2 className="mt-1 text-2xl font-bold text-foreground">{title}</h2>
          {description ? (
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        {badge}
      </div>
    </div>
  );
}
