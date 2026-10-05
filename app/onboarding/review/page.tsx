"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useOnboardingDocuments } from "@/hooks/useOnboardingDocuments";
import { ROUTES } from "@/lib/constants";
import { maskAccountNumber } from "@/lib/mock/locations";
import { submitSellerOnboarding } from "@/services/onboarding";
import {
  isOnboardingDocumentReady,
  onboardingApiError,
} from "@/services/onboarding-documents";
import { useAuthStore } from "@/store/authStore";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useSellerStore } from "@/store/sellerStore";

export default function OnboardingReviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const previewSuffix = searchParams.get("preview") === "1" ? "?preview=1" : "";
  const company = useOnboardingStore((s) => s.company);
  const business = useOnboardingStore((s) => s.business);
  const location = useOnboardingStore((s) => s.location);
  const bank = useOnboardingStore((s) => s.bank);
  const gst = useOnboardingStore((s) => s.gst);
  const documents = useOnboardingStore((s) => s.documents);
  const review = useOnboardingStore((s) => s.review);
  const updateReview = useOnboardingStore((s) => s.updateReview);
  const submitOnboarding = useOnboardingStore((s) => s.submitOnboarding);
  const completeOnboarding = useAuthStore((s) => s.completeOnboarding);
  const updateSeller = useSellerStore((s) => s.updateSeller);
  const { syncing } = useOnboardingDocuments();
  const [submitting, setSubmitting] = useState(false);

  const uploadedDocuments = documents.filter((doc) =>
    isOnboardingDocumentReady(doc),
  );

  const submit = async () => {
    if (!review.termsAccepted) {
      toast.error("Please confirm the information is correct");
      return;
    }
    const missing = documents.filter(
      (doc) => doc.required && !isOnboardingDocumentReady(doc),
    );
    if (missing.length > 0) {
      toast.error(
        `Upload required documents: ${missing.map((doc) => doc.name).join(", ")}`,
      );
      return;
    }

    setSubmitting(true);
    try {
      await submitSellerOnboarding(useOnboardingStore.getState());
      submitOnboarding();
      const companyName = company.companyName || "Seller Organization";
      updateSeller({
        companyName,
        legalName: company.legalName || companyName,
        gst: company.gstNumber,
        pan: company.panNumber,
        contactPerson: company.contactName,
        mobile: company.phone,
        email: company.email,
        registeredAddress:
          location.registeredAddress || company.registeredAddress,
        sellerType: (business.sellerType as "distributor") || "distributor",
        paymentTerms: business.paymentTerms,
      });
      completeOnboarding();
      toast.success("Onboarding submitted for verification");
      router.push(ROUTES.DASHBOARD);
    } catch (error) {
      toast.error(
        onboardingApiError(
          error,
          "Could not submit onboarding. Confirm all documents are stored in R2.",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Review & Submit</h1>
        <p className="mt-1 text-sm text-slate-500">
          Confirm your seller profile before entering the portal. Required
          documents must already be stored in Cloudflare R2.
        </p>
        {syncing ? (
          <p className="mt-2 text-xs text-slate-400">
            Syncing stored documents…
          </p>
        ) : null}
      </div>
      <section className="grid gap-4 md:grid-cols-2">
        <ReviewCard
          title="Business Info"
          actionLabel="Edit"
          onEdit={() =>
            router.push(`${ROUTES.ONBOARDING_COMPANY}${previewSuffix}`)
          }
          rows={[
            ["Company", company.companyName],
            ["GST", company.gstNumber],
            ["PAN", company.panNumber || gst.pan || "Not provided"],
            ["State", gst.state || location.state],
            ["Contact", company.contactName],
          ]}
        />
        <ReviewCard
          title="Documents"
          actionLabel="Edit"
          onEdit={() =>
            router.push(`${ROUTES.ONBOARDING_DOCUMENTS}${previewSuffix}`)
          }
        >
          <div className="mt-3 space-y-2">
            {uploadedDocuments.length === 0 ? (
              <p className="text-sm text-slate-500">No documents stored yet</p>
            ) : (
              uploadedDocuments.map((document) => (
                <div
                  key={document.id}
                  className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {document.name}
                    </p>
                    {document.fileName ? (
                      <p className="text-xs text-slate-500">
                        {document.fileName}
                      </p>
                    ) : null}
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                    Stored
                  </span>
                </div>
              ))
            )}
          </div>
        </ReviewCard>
        <ReviewCard
          title="Business"
          rows={[
            ["Seller type", business.sellerType],
            ["Years in business", business.yearsInBusiness],
            ["Categories", business.primaryCategories],
            ["Capacity", business.operatingCapacity],
            ["Payment terms", business.paymentTerms],
            ["Preferred contact", business.preferredContactMethod],
          ]}
        />
        <ReviewCard
          title="Location"
          rows={[
            ["Registered address", location.registeredAddress],
            ["City", location.city],
            ["State", location.state],
            ["Pincode", location.pincode],
            ["Warehouse", location.warehouseAddress],
            ...(location.additionalAddresses ?? []).map(
              (item, index): [string, string] => [
                item.label || `Additional address ${index + 1}`,
                item.address,
              ],
            ),
          ]}
        />
        <ReviewCard
          title="Bank"
          rows={[
            ["Bank", bank.bankName],
            [
              "Account",
              bank.accountNumber
                ? maskAccountNumber(bank.accountNumber)
                : "Not provided",
            ],
            ["IFSC", bank.ifscCode],
          ]}
        />
      </section>
      <label className="flex items-start gap-3 text-sm">
        <Checkbox
          checked={review.termsAccepted}
          onCheckedChange={(checked) =>
            updateReview({ termsAccepted: checked === true })
          }
        />
        I confirm that the information provided is accurate and belongs to my
        business.
      </label>
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Back
        </Button>
        <Button onClick={() => void submit()} disabled={submitting || syncing}>
          {submitting ? "Submitting…" : "Submit For Verification"}
        </Button>
      </div>
    </div>
  );
}

function ReviewCard({
  title,
  rows,
  actionLabel,
  onEdit,
  children,
}: {
  title: string;
  rows?: [string, string][];
  actionLabel?: string;
  onEdit?: () => void;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
        {actionLabel && onEdit ? (
          <button
            type="button"
            onClick={onEdit}
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
      {children ?? (
        <dl className="mt-3 space-y-2">
          {rows?.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4 text-sm">
              <dt className="text-slate-500">{label}</dt>
              <dd className="font-medium text-slate-800">{value || "—"}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
