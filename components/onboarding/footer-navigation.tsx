"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";

import { AutoSaveIndicator } from "@/components/onboarding/auto-save-indicator";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useOnboardingStore } from "@/store/onboardingStore";

interface FooterNavigationProps {
  onPrevious?: () => void;
  onContinue?: () => void;
  onSaveDraft?: () => void;
  previousLabel?: string;
  continueLabel?: string;
  showPrevious?: boolean;
  showContinue?: boolean;
  showSaveDraft?: boolean;
  continueDisabled?: boolean;
  isLoading?: boolean;
  continueType?: "button" | "submit";
  className?: string;
  children?: React.ReactNode;
}

export function FooterNavigation({
  onPrevious,
  onContinue,
  onSaveDraft,
  previousLabel = "Previous Step",
  continueLabel = "Continue",
  showPrevious = true,
  showContinue = true,
  showSaveDraft = true,
  continueDisabled = false,
  isLoading = false,
  continueType = "button",
  className,
  children,
}: FooterNavigationProps) {
  const progress = useOnboardingStore((s) => s.getProgress());
  const triggerAutoSave = useOnboardingStore((s) => s.triggerAutoSave);

  const handleSaveDraft = () => {
    triggerAutoSave();
    onSaveDraft?.();
  };

  return (
    <footer
      className={cn(
        "sticky bottom-0 z-10 border-t bg-card px-6 py-4 shadow-elevated",
        className,
      )}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          {showPrevious && onPrevious ? (
            <Button variant="outline" onClick={onPrevious} type="button">
              <ArrowLeft className="h-4 w-4" />
              {previousLabel}
            </Button>
          ) : null}
          {showSaveDraft ? (
            <Button variant="outline" onClick={handleSaveDraft} type="button">
              Save Draft
            </Button>
          ) : null}
          {children}
        </div>

        <div className="flex items-center gap-6">
          <AutoSaveIndicator />
          <div className="hidden min-w-[160px] items-center gap-3 md:flex">
            <span className="text-xs font-medium text-muted-foreground">
              Progress
            </span>
            <Progress value={progress} className="h-2 w-32" />
            <span className="text-xs font-semibold">{progress}%</span>
          </div>
          {showContinue ? (
            <Button
              onClick={continueType === "button" ? onContinue : undefined}
              disabled={continueDisabled || isLoading}
              type={continueType}
              className="min-w-[140px]"
            >
              {isLoading ? "Processing..." : continueLabel}
              {!isLoading ? <ArrowRight className="h-4 w-4" /> : null}
            </Button>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
