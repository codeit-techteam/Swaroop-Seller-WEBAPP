"use client";

import { motion } from "framer-motion";
import {
  Building2,
  CheckCircle2,
  CreditCard,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

import {
  EstimatedReviewBanner,
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
  const bank = useOnboardingStore((s) => s.bank);
  const review = useOnboardingStore((s) => s.review);
  const updateReview = useOnboardingStore((s) => s.updateReview);
  const submitOnboarding = useOnboardingStore((s) => s.submitOnboarding);
  const setCurrentStep = useOnboardingStore((s) => s.setCurrentStep);

  useEffect(() => {
    setCurrentStep("review");
  }, [setCurrentStep]);

  const uploadedDocs = documents.filter((d) => d.status !== "empty");
  const gstNumber = gst.gstNumber || company.gstNumber;

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
      className="mx-auto max-w-5xl pb-24"
    >
      <div className="mb-8">
        <p className="text-sm font-medium text-primary">Ready to submit</p>
        <h2 className="mt-1 text-3xl font-bold tracking-tight">
          Review & Final Submission
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Confirm your company details, documents, and bank information. You can
          edit any section before submitting for verification.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          <ReviewCard
            title="Company Details"
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
              {gstNumber ? (
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    GST Number
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold">{gstNumber}</p>
                    {gst.status === "verified" ? (
                      <VerificationStatusBadge status="verified" />
                    ) : null}
                  </div>
                </div>
              ) : null}
              {company.panNumber ? (
                <ReviewField label="PAN Number" value={company.panNumber} />
              ) : null}
            </div>
          </ReviewCard>

          <ReviewCard
            title="Document Uploads"
            onEdit={() => router.push(ROUTES.ONBOARDING_DOCUMENTS)}
          >
            {uploadedDocs.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No documents uploaded yet.
              </p>
            ) : (
              <div className="space-y-3">
                {uploadedDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between rounded-lg border bg-muted/20 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-primary" />
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
                    <VerificationStatusBadge
                      status="verified"
                      label="Uploaded"
                    />
                  </div>
                ))}
              </div>
            )}
          </ReviewCard>

          <ReviewCard
            title="Bank Information"
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
              {bank.branchName ? (
                <ReviewField label="Branch Name" value={bank.branchName} />
              ) : null}
            </div>
          </ReviewCard>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <section className="rounded-xl border bg-card p-5 shadow-card">
            <h4 className="mb-4 font-semibold">Completed steps</h4>
            <ul className="space-y-3">
              {reviewChecklist.map((item) => {
                const Icon =
                  item === "Company Details"
                    ? Building2
                    : item === "Document Uploads"
                      ? FileText
                      : CreditCard;

                return (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-sm font-medium"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-success/10 text-success">
                      <CheckCircle2 className="h-4 w-4" />
                    </span>
                    <span className="flex items-center gap-2">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                      {item}
                    </span>
                  </li>
                );
              })}
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
        </aside>
      </div>

      <footer className="sticky bottom-0 z-10 -mx-6 mt-8 border-t bg-card px-6 py-4 shadow-elevated lg:-mx-8 lg:px-8">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => router.push(ROUTES.ONBOARDING_BANK)}
            className="inline-flex h-9 items-center gap-2 rounded-md border bg-background px-4 text-sm font-medium shadow-sm hover:bg-accent"
          >
            Back
          </button>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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
              onClick={handleSubmit}
              disabled={!review.termsAccepted}
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50"
            >
              Submit For Verification
            </button>
          </div>
        </div>
      </footer>
    </motion.div>
  );
}
