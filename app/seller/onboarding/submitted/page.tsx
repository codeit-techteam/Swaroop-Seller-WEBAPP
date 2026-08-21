"use client";

import { motion } from "framer-motion";
import { Clock, FileCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import {
  EstimatedReviewBanner,
  LockedDashboardButton,
  SubmissionSummaryItem,
  SuccessCard,
} from "@/components/onboarding";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/lib/constants";
import { submissionSummary } from "@/mock/onboarding/onboardingMock";
import { useOnboardingStore } from "@/store/onboardingStore";

export default function SubmittedPage() {
  const router = useRouter();
  const isSubmitted = useOnboardingStore((s) => s.isSubmitted);
  const submittedAt = useOnboardingStore((s) => s.submittedAt);
  const company = useOnboardingStore((s) => s.company);
  const documents = useOnboardingStore((s) => s.documents);
  const bank = useOnboardingStore((s) => s.bank);
  const setCurrentStep = useOnboardingStore((s) => s.setCurrentStep);

  useEffect(() => {
    if (!isSubmitted) {
      router.replace(ROUTES.ONBOARDING_REVIEW);
      return;
    }
    setCurrentStep("submitted");
  }, [isSubmitted, router, setCurrentStep]);

  const uploadedCount = documents.filter((d) => d.status !== "empty").length;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mx-auto max-w-2xl py-10"
    >
      <SuccessCard
        title="KYC Submitted Successfully"
        description="Your seller onboarding application has been submitted for review. You will be notified once verification is complete."
      >
        <Badge className="mt-4 gap-1.5" variant="secondary">
          <Clock className="h-3.5 w-3.5" />
          Current Status: Under Review
        </Badge>
      </SuccessCard>

      <div className="mt-6 space-y-4">
        <EstimatedReviewBanner hours={submissionSummary.estimatedReviewTime} />

        <section className="rounded-xl border bg-card p-6 shadow-card">
          <div className="mb-4 flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Submission Summary</h3>
          </div>
          <SubmissionSummaryItem
            label="Business Name"
            value={company.companyName || submissionSummary.businessName}
          />
          <SubmissionSummaryItem
            label="Documents Submitted"
            value={`${uploadedCount} documents`}
          />
          <SubmissionSummaryItem
            label="Bank"
            value={bank.bankName || submissionSummary.bankName}
          />
          <SubmissionSummaryItem
            label="Submitted On"
            value={
              submittedAt
                ? new Date(submittedAt).toLocaleString()
                : new Date().toLocaleString()
            }
          />
          <SubmissionSummaryItem
            label="Estimated Review"
            value={submissionSummary.estimatedReviewTime}
          />
        </section>

        <LockedDashboardButton />

        <p className="text-center text-xs text-muted-foreground">
          Dashboard access will be unlocked once your KYC verification is
          approved. You will receive an email notification at{" "}
          {company.email || "your registered email"}.
        </p>
      </div>
    </motion.div>
  );
}
