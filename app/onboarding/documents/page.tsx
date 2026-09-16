"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import toast from "react-hot-toast";

import { UploadCard } from "@/components/onboarding/upload-card";
import { Button } from "@/components/ui/button";
import { useMockUpload } from "@/hooks/useMockUpload";
import { ROUTES } from "@/lib/constants";
import { useOnboardingStore } from "@/store/onboardingStore";

export default function OnboardingDocumentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const previewSuffix = searchParams.get("preview") === "1" ? "?preview=1" : "";
  const documents = useOnboardingStore((s) => s.documents);
  const markStepComplete = useOnboardingStore((s) => s.markStepComplete);
  const setCurrentStep = useOnboardingStore((s) => s.setCurrentStep);
  const { simulateUpload, simulateDelete } = useMockUpload();
  const orderedDocuments = useMemo(
    () =>
      [...documents].sort((a, b) => Number(b.required) - Number(a.required)),
    [documents],
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold">Document Uploads</h1>
        <p className="mt-1 text-sm text-slate-500">
          Upload GST Certificate, PAN Card, Aadhaar and Cancelled Cheque — the
          same documents collected in Seller Panel onboarding.
        </p>
      </div>
      <div className="grid gap-4">
        {orderedDocuments.map((doc) => (
          <UploadCard
            key={doc.id}
            document={doc}
            onUpload={(file) => simulateUpload(doc.id, file)}
            onReplace={(file) => simulateUpload(doc.id, file)}
            onDelete={() => simulateDelete(doc.id)}
          />
        ))}
      </div>
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Back
        </Button>
        <Button
          onClick={() => {
            const missing = documents.filter(
              (doc) =>
                doc.required &&
                (doc.status === "empty" || doc.status === "uploading"),
            );
            if (missing.length > 0) {
              toast.error(
                `Upload required documents: ${missing.map((doc) => doc.name).join(", ")}`,
              );
              return;
            }
            markStepComplete("documents");
            setCurrentStep("review");
            router.push(`${ROUTES.ONBOARDING_REVIEW}${previewSuffix}`);
          }}
        >
          Continue to Review
        </Button>
      </div>
    </div>
  );
}
