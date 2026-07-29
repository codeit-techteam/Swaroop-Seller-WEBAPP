"use client";

import { motion } from "framer-motion";
import { CheckCircle2, FileText, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

import {
  EstimatedReviewBanner,
  FooterNavigation,
  InformationCard,
  ProgressHeader,
  ReviewCard,
  ReviewField,
  VerificationStatusBadge,
} from "@/components/onboarding";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/lib/constants";
import {
  annualTurnoverOptions,
  businessTypeOptions,
  industryOptions,
  reviewChecklist,
  yearsInBusinessOptions,
} from "@/mock/onboarding/onboardingMock";
import { useOnboardingStore } from "@/store/onboardingStore";

function getLabel(options: { label: string; value: string }[], value: string) {
  return options.find((o) => o.value === value)?.label ?? value;
}

export default function ReviewPage() {
  const router = useRouter();
  const company = useOnboardingStore((s) => s.company);
  const documents = useOnboardingStore((s) => s.documents);
  const gst = useOnboardingStore((s) => s.gst);
  const pan = useOnboardingStore((s) => s.pan);
  const bank = useOnboardingStore((s) => s.bank);
  const location = useOnboardingStore((s) => s.location);
  const review = useOnboardingStore((s) => s.review);
  const updateReview = useOnboardingStore((s) => s.updateReview);
  const submitOnboarding = useOnboardingStore((s) => s.submitOnboarding);
  const setCurrentStep = useOnboardingStore((s) => s.setCurrentStep);

  useEffect(() => {
    setCurrentStep("review");
  }, [setCurrentStep]);

  const uploadedDocs = documents.filter((d) => d.status !== "empty");

  const handleSubmit = () => {
    if (!review.termsAccepted) {
      toast.error("Please confirm that all information is correct");
      return;
    }
    submitOnboarding();
    toast.success("Application submitted for verification");
    router.push(ROUTES.ONBOARDING_SUBMITTED);
  };

  const maskAccount = (num: string) => {
    if (num.length < 4) return num;
    return `XXXX-XXXX-${num.slice(-4)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-6xl pb-24"
    >
      <ProgressHeader
        stepId="review"
        title="Review & Final Submission"
        description="Review all information before submitting for verification. You can edit any section if needed."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <ReviewCard
            title="Company Information"
            onEdit={() => router.push(ROUTES.ONBOARDING_COMPANY)}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <ReviewField
                label="Entity Legal Name"
                value={company.companyName}
              />
              <ReviewField
                label="Entity Type"
                value={getLabel(businessTypeOptions, company.businessType)}
              />
              <ReviewField label="Contact Person" value={company.contactName} />
              <ReviewField
                label="Business Category"
                value={getLabel(industryOptions, company.industry)}
              />
              <ReviewField label="Designation" value={company.designation} />
              <ReviewField label="Email" value={company.email} />
              <ReviewField
                label="Years in Business"
                value={getLabel(
                  yearsInBusinessOptions,
                  company.yearsInBusiness,
                )}
              />
              <ReviewField
                label="Annual Turnover"
                value={getLabel(annualTurnoverOptions, company.annualTurnover)}
              />
            </div>
          </ReviewCard>

          <ReviewCard
            title="GST & PAN Information"
            onEdit={() => router.push(ROUTES.ONBOARDING_GST_PAN)}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <InformationCard
                label="GSTIN"
                value={gst.gstNumber || company.gstNumber}
                verified={gst.status === "verified"}
              />
              <InformationCard
                label="PAN Number"
                value={pan.panNumber || company.panNumber}
                verified={pan.status === "verified"}
              />
            </div>
          </ReviewCard>

          <ReviewCard
            title="Documents Uploaded"
            onEdit={() => router.push(ROUTES.ONBOARDING_DOCUMENTS)}
          >
            <div className="space-y-3">
              {uploadedDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between rounded-lg border bg-muted/20 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-warning" />
                    <div>
                      <p className="text-sm font-medium">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {doc.fileName} •{" "}
                        {doc.fileSize
                          ? `${(doc.fileSize / (1024 * 1024)).toFixed(1)} MB`
                          : "—"}
                      </p>
                    </div>
                  </div>
                  <VerificationStatusBadge status="verified" label="Uploaded" />
                </div>
              ))}
            </div>
          </ReviewCard>

          <ReviewCard
            title="Bank Details"
            onEdit={() => router.push(ROUTES.ONBOARDING_BANK)}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <ReviewField
                label="Account Holder Name"
                value={bank.accountHolderName}
              />
              <ReviewField label="Bank Name" value={bank.bankName} />
              <ReviewField
                label="Account Number"
                value={maskAccount(bank.accountNumber)}
              />
              <ReviewField label="IFSC Code" value={bank.ifscCode} />
            </div>
          </ReviewCard>

          <ReviewCard
            title="Location Verification"
            onEdit={() => router.push(ROUTES.ONBOARDING_LOCATION)}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                  Registered Address
                </p>
                <p className="mb-3 text-sm">{location.registeredAddress}</p>
                <div className="h-32 rounded-lg bg-gradient-to-br from-slate-200 to-slate-300" />
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                  Warehouse Address
                </p>
                <p className="mb-3 text-sm">{location.warehouseAddress}</p>
                <div className="relative h-32 overflow-hidden rounded-lg bg-gradient-to-br from-slate-300 to-slate-400">
                  {location.warehousePhotoPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={location.warehousePhotoPreview}
                      alt="Warehouse"
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                  {location.locationVerified ? (
                    <div className="absolute bottom-2 right-2">
                      <VerificationStatusBadge status="verified" />
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </ReviewCard>
        </div>

        <div className="space-y-4">
          <section className="rounded-xl border bg-card p-5 shadow-card">
            <h4 className="mb-4 font-semibold">Verification Checklist</h4>
            <ul className="space-y-3">
              {reviewChecklist.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <EstimatedReviewBanner hours="24 - 48 business hours" />

          <section className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                All data is stored securely in accordance with enterprise
                security policies and regulatory compliance standards.
              </p>
            </div>
          </section>
        </div>
      </div>

      <FooterNavigation
        onPrevious={() => router.push(ROUTES.ONBOARDING_LOCATION)}
        showContinue={false}
        showSaveDraft={false}
      >
        <div className="flex items-center gap-2">
          <Checkbox
            id="terms"
            checked={review.termsAccepted}
            onCheckedChange={(checked) =>
              updateReview({ termsAccepted: checked === true })
            }
          />
          <Label htmlFor="terms" className="text-sm font-normal">
            I confirm that all information provided is correct and valid.
          </Label>
        </div>
        <button
          type="button"
          onClick={() => router.push(ROUTES.ONBOARDING_COMPANY)}
          className="text-sm font-medium text-primary hover:underline"
        >
          Edit Information
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!review.termsAccepted}
          className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50"
        >
          Submit For Verification
        </button>
      </FooterNavigation>
    </motion.div>
  );
}
