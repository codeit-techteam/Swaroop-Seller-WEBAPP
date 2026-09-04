"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import { useOnboardingStore } from "@/store/onboardingStore";

export default function OnboardingDocumentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const previewSuffix = searchParams.get("preview") === "1" ? "?preview=1" : "";
  const documents = useOnboardingStore((s) => s.documents);
  const updateDocument = useOnboardingStore((s) => s.updateDocument);
  const markStepComplete = useOnboardingStore((s) => s.markStepComplete);
  const setCurrentStep = useOnboardingStore((s) => s.setCurrentStep);
  const orderedDocuments = useMemo(
    () =>
      [...documents].sort((a, b) => Number(b.required) - Number(a.required)),
    [documents],
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold">Documents</h1>
        <p className="mt-1 text-sm text-slate-500">
          Upload GST certificate and last 3 years of payment slips. PAN is
          optional. Verification is handled later by the PetroTrade team.
        </p>
      </div>
      <div className="space-y-3">
        {orderedDocuments.map((doc) => (
          <div
            key={doc.id}
            className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium text-slate-800">
                {doc.name}
                {doc.required ? (
                  <span className="ml-1 text-destructive">*</span>
                ) : (
                  <span className="ml-1 text-xs font-normal text-slate-400">
                    (Optional)
                  </span>
                )}
              </p>
              <p className="text-xs text-slate-500">{doc.description}</p>
              <p className="mt-1 text-xs text-slate-400">
                {doc.fileName ?? "No file uploaded"} · {doc.status}
              </p>
            </div>
            <label className="inline-flex cursor-pointer items-center rounded-md border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-50">
              {doc.fileName ? "Replace" : "Upload"}
              <input
                type="file"
                className="sr-only"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  updateDocument(doc.id, {
                    fileName: file.name,
                    fileSize: file.size,
                    status: "uploaded",
                    uploadedAt: new Date().toISOString(),
                  });
                  toast.success(`${doc.name} uploaded`);
                }}
              />
            </label>
          </div>
        ))}
      </div>
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Back
        </Button>
        <Button
          onClick={() => {
            const missing = documents.filter(
              (doc) => doc.required && doc.status === "empty",
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
          Continue
        </Button>
      </div>
    </div>
  );
}
