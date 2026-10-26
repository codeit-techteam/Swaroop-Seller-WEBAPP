"use client";

import { Check, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  GST_BOOK_MEETING_URL,
  GST_KNOW_MORE_URL,
  normalizeGstin,
  parseGstin,
} from "@/lib/utils/gst";
import {
  formatKycDate,
  type KycVerificationDetails,
  type KycVerificationResult,
  verificationApiError,
  verifiedByLine,
  verifySellerGst,
} from "@/services/seller-kyc-verification";
import type { VerificationStatus } from "@/types/onboarding";

export const REVERIFY_NOTICE =
  "Changing this information requires re-verification.";

type GstValidateCardProps = {
  value: string;
  status: VerificationStatus;
  details?: KycVerificationDetails;
  message?: string;
  /** Last Surepass / provider result — used for “Verified via Surepass” copy. */
  verification?: KycVerificationResult | null;
  /** Onboarding is submitted / approved — identifiers cannot change. */
  locked?: boolean;
  /** Compact layout for dashboard verification (vs onboarding hero card). */
  compact?: boolean;
  onChange: (gstNumber: string) => void;
  onResult: (result: KycVerificationResult, gstin: string) => void;
  onEdit?: () => void;
  className?: string;
};

function buttonLabel(status: VerificationStatus) {
  if (status === "loading") return "Verifying…";
  if (status === "verified") return "✓ Verified";
  if (status === "rejected") return "✕ Failed";
  if (status === "pending") return "Sent for review";
  return "Verify";
}

export function GstValidateCard({
  value,
  status,
  details,
  message,
  verification = null,
  locked = false,
  compact = false,
  onChange,
  onResult,
  onEdit,
  className,
}: GstValidateCardProps) {
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const accepted = status === "verified" || status === "pending";
  const inputLocked = locked || accepted;
  const displayStatus: VerificationStatus = verifying ? "loading" : status;
  const providerLine =
    status === "verified" && verification ? verifiedByLine(verification) : null;

  const handleVerify = async () => {
    const parsed = parseGstin(value);
    if (!parsed.isValid) {
      setError(parsed.error ?? "Enter a valid GST number");
      return;
    }
    setError(null);
    setVerifying(true);
    try {
      const result = await verifySellerGst(parsed.gstNumber);
      if (result.status === "FAILED") setError(result.message);
      onResult(result, parsed.gstNumber);
    } catch (err) {
      setError(verificationApiError(err, "GST verification failed."));
    } finally {
      setVerifying(false);
    }
  };

  const rows: [string, string | null | undefined][] = details
    ? [
        ["Legal Name", details.legalName],
        ["Trade Name", details.tradeName],
        ["GST Status", details.gstStatus],
        ["State", details.state],
        ["State Code", details.stateCode],
        ["Company PAN", details.panMasked],
        ["Taxpayer Type", details.taxpayerType],
        ["Constitution", details.constitution],
        ["Registered On", formatKycDate(details.registrationDate)],
        ["Cancelled On", formatKycDate(details.cancellationDate)],
        ["Registered Address", details.address],
        ["PIN Code", details.pincode],
      ]
    : [];
  const visibleRows = rows.filter(([, v]) => Boolean(v));

  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 bg-white shadow-sm",
        compact ? "p-4 text-left" : "p-6 text-center",
        className,
      )}
    >
      <h2
        className={cn(
          "font-bold text-slate-800",
          compact ? "text-sm font-semibold" : "text-xl",
        )}
      >
        {compact ? "GSTIN" : "Validate GST"}
      </h2>
      {!compact ? (
        <a
          href={GST_KNOW_MORE_URL}
          target="_blank"
          rel="noreferrer"
          className="mt-1 inline-block text-sm text-slate-400 hover:text-slate-600"
        >
          Know more about GST
        </a>
      ) : (
        <p className="mt-0.5 text-xs text-slate-500">
          Verified with the GST registry via Surepass
        </p>
      )}

      <div className={cn("space-y-3 text-left", compact ? "mt-3" : "mt-5")}>
        <Input
          value={value}
          onChange={(event) => {
            onChange(normalizeGstin(event.target.value).slice(0, 15));
            setError(null);
          }}
          placeholder="19ABCCA6289R1ZP"
          maxLength={15}
          disabled={inputLocked || verifying}
          className={cn(
            "font-medium uppercase tracking-wide",
            compact
              ? "h-10 rounded-lg border-slate-300 px-3"
              : "h-12 rounded-full border-slate-300 px-4 text-center",
          )}
          aria-label="GST number"
        />
        <Button
          type="button"
          onClick={() => void handleVerify()}
          disabled={verifying || inputLocked || value.length !== 15}
          className={cn(
            compact
              ? "h-10 w-full rounded-lg text-sm font-semibold"
              : "h-12 w-full rounded-full text-base font-semibold",
            status === "verified"
              ? "bg-green-600 hover:bg-green-600 disabled:opacity-100"
              : status === "rejected" && !verifying
                ? "bg-red-600 hover:bg-red-700"
                : "bg-[#4F6BFF] hover:bg-[#3F58E8]",
          )}
        >
          {buttonLabel(displayStatus)}
        </Button>
        {inputLocked ? (
          <p className="flex items-center justify-between gap-2 text-xs text-slate-500">
            <span>{REVERIFY_NOTICE}</span>
            {!locked && onEdit ? (
              <button
                type="button"
                onClick={onEdit}
                className="font-semibold text-[#4F6BFF] hover:underline"
              >
                Change
              </button>
            ) : null}
          </p>
        ) : null}
      </div>

      {error ? (
        <p className="mt-3 text-left text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      {accepted ? (
        <div className="mt-4 space-y-2 text-left text-sm text-slate-800">
          {status === "verified" ? (
            <p className="flex items-center gap-2 font-semibold text-green-600">
              <Check className="h-4 w-4" aria-hidden="true" />
              GSTIN verified
            </p>
          ) : (
            <p className="text-amber-700">
              {message ||
                "GST verification is temporarily unavailable. Our team will verify it during review."}
            </p>
          )}
          {providerLine ? (
            <p className="text-xs text-slate-500">{providerLine}</p>
          ) : null}
          <p>
            <span className="font-semibold">GST Number:</span> {value}
          </p>
          {visibleRows.map(([label, rowValue]) => (
            <p key={label}>
              <span className="font-semibold">{label}:</span> {rowValue}
            </p>
          ))}
          {!compact ? (
            <div className="pt-3">
              <p className="font-semibold text-slate-900">For more details:</p>
              <a
                href={GST_BOOK_MEETING_URL}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-block text-base font-medium text-[#4F6BFF] hover:underline"
              >
                Let&apos;s Connect – Book a meeting
              </a>
            </div>
          ) : null}
        </div>
      ) : status === "rejected" && !error && message ? (
        <p className="mt-3 flex items-start gap-2 text-left text-sm text-red-600">
          <X className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {message}
        </p>
      ) : null}
    </div>
  );
}
