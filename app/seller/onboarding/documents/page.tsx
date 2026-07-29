"use client";

import { motion } from "framer-motion";
import { Clock, FileCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";

import {
  FooterNavigation,
  ProgressHeader,
  UploadCard,
} from "@/components/onboarding";
import { Badge } from "@/components/ui/badge";
import { useMockUpload } from "@/hooks/useMockUpload";
import { ROUTES } from "@/lib/constants";
import { useOnboardingStore } from "@/store/onboardingStore";

export default function DocumentsPage() {
  const router = useRouter();
  const documents = useOnboardingStore((s) => s.documents);
  const markStepComplete = useOnboardingStore((s) => s.markStepComplete);
  const setCurrentStep = useOnboardingStore((s) => s.setCurrentStep);
  const { simulateUpload, simulateDelete, simulateCancel } = useMockUpload();

  useEffect(() => {
    setCurrentStep("documents");
  }, [setCurrentStep]);

  const uploadedCount = useMemo(
    () =>
      documents.filter(
        (d) =>
          d.status === "uploaded" ||
          d.status === "verified" ||
          d.status === "pending_review",
      ).length,
    [documents],
  );

  const requiredCount = documents.filter((d) => d.required).length;

  const handleContinue = () => {
    const allRequiredUploaded = documents
      .filter((d) => d.required)
      .every(
        (d) =>
          d.status !== "empty" &&
          d.status !== "uploading" &&
          d.status !== "rejected",
      );

    if (!allRequiredUploaded) {
      toast.error("Please upload all required documents before continuing");
      return;
    }

    markStepComplete("documents");
    setCurrentStep("gst-pan");
    router.push(ROUTES.ONBOARDING_GST_PAN);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-6xl pb-24"
    >
      <ProgressHeader
        stepId="documents"
        title="Step 2: Document Verification"
        description="Upload all required documents for KYC verification. Documents are reviewed within 24-48 hours."
        badge={
          <Badge variant="secondary" className="gap-1.5">
            <FileCheck className="h-3.5 w-3.5" />
            {uploadedCount}/{requiredCount} UPLOADED
          </Badge>
        }
      />

      <div className="mb-6 flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/5 px-4 py-3 text-sm">
        <Clock className="h-4 w-4 text-warning" />
        <span>
          Estimated verification time: <strong>24-48 business hours</strong>{" "}
          after all documents are uploaded.
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {documents.map((doc) => (
          <UploadCard
            key={doc.id}
            document={doc}
            onUpload={(file) => simulateUpload(doc.id, file)}
            onReplace={(file) => simulateUpload(doc.id, file)}
            onDelete={() => simulateDelete(doc.id)}
            onCancel={() => simulateCancel(doc.id)}
          />
        ))}
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <section className="rounded-xl border bg-card p-5 shadow-card">
          <h4 className="font-semibold">Upload Guidelines</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>• Accepted formats: PDF, PNG, JPG only</li>
            <li>• Maximum file size: 10MB per document</li>
            <li>• Ensure documents are clear and not photocopies</li>
            <li>• All text must be legible and unobstructed</li>
          </ul>
        </section>
        <section className="rounded-xl border bg-card p-5 shadow-card">
          <h4 className="font-semibold">Need Assistance?</h4>
          <p className="mt-2 text-sm text-muted-foreground">
            Our support team is available to help with document uploads.
          </p>
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              className="text-sm font-medium text-primary hover:underline"
            >
              Live Chat
            </button>
            <button
              type="button"
              className="text-sm font-medium text-primary hover:underline"
            >
              Email Support
            </button>
          </div>
        </section>
      </div>

      <FooterNavigation
        onPrevious={() => router.push(ROUTES.ONBOARDING_COMPANY)}
        onContinue={handleContinue}
      />
    </motion.div>
  );
}
