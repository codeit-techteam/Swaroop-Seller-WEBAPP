"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { UploadCard } from "@/components/onboarding/upload-card";
import { Button } from "@/components/ui/button";
import { useOnboardingDocuments } from "@/hooks/useOnboardingDocuments";
import { ROUTES } from "@/lib/constants";
import { saveSellerOnboardingDraft } from "@/services/onboarding";
import {
  isOnboardingDocumentReady,
  onboardingApiError,
} from "@/services/onboarding-documents";
import { useOnboardingStore } from "@/store/onboardingStore";

export default function OnboardingDocumentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const previewSuffix = searchParams.get("preview") === "1" ? "?preview=1" : "";
  const documents = useOnboardingStore((s) => s.documents);
  const markStepComplete = useOnboardingStore((s) => s.markStepComplete);
  const setCurrentStep = useOnboardingStore((s) => s.setCurrentStep);
  const { syncing, upload, remove, cancel, preview } = useOnboardingDocuments();
  const [saving, setSaving] = useState(false);
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
          Upload GST Certificate, PAN Card, Aadhaar and Cancelled Cheque. Each
          file is stored in Cloudflare R2 and recorded against your seller
          profile.
        </p>
        {syncing ? (
          <p className="mt-2 text-xs text-slate-400">
            Checking documents already stored…
          </p>
        ) : null}
      </div>
      <div className="grid gap-4">
        {orderedDocuments.map((doc) => (
          <UploadCard
            key={doc.id}
            document={doc}
            onUpload={(file) => void upload(doc.id, file)}
            onReplace={(file) => void upload(doc.id, file)}
            onDelete={() => void remove(doc.id)}
            onCancel={() => cancel(doc.id)}
            onPreview={
              doc.storageDocumentId || doc.previewUrl
                ? () => void preview(doc.id)
                : undefined
            }
          />
        ))}
      </div>
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Back
        </Button>
        <Button
          disabled={saving || syncing}
          onClick={() => {
            const missing = documents.filter(
              (doc) => doc.required && !isOnboardingDocumentReady(doc),
            );
            if (missing.length > 0) {
              toast.error(
                `Upload required documents: ${missing.map((doc) => doc.name).join(", ")}`,
              );
              return;
            }
            setSaving(true);
            void (async () => {
              try {
                markStepComplete("documents");
                setCurrentStep("review");
                await saveSellerOnboardingDraft(
                  useOnboardingStore.getState(),
                  "review",
                );
                router.push(`${ROUTES.ONBOARDING_REVIEW}${previewSuffix}`);
              } catch (error) {
                toast.error(
                  onboardingApiError(
                    error,
                    "Could not save document progress to the server",
                  ),
                );
              } finally {
                setSaving(false);
              }
            })();
          }}
        >
          {saving ? "Saving…" : "Continue to Review"}
        </Button>
      </div>
    </div>
  );
}
