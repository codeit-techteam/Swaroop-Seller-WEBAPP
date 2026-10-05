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
  type KycVerificationDetails,
  type KycVerificationResult,
  verificationApiError,
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
  /** Onboarding is submitted / approved — identifiers cannot change. */
  locked?: boolean;
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
  locked = false,
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
        ["Registered On", details.registrationDate],
      ]
    : [];
  const visibleRows = rows.filter(([, v]) => Boolean(v));

  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm",
        className,
      )}
    >
      <h2 className="text-xl font-bold text-slate-800">Validate GST</h2>
      <a
        href={GST_KNOW_MORE_URL}
        target="_blank"
        rel="noreferrer"
        className="mt-1 inline-block text-sm text-slate-400 hover:text-slate-600"
      >
        Know more about GST
      </a>

      <div className="mt-5 space-y-3 text-left">
        <Input
          value={value}
          onChange={(event) => {
            onChange(normalizeGstin(event.target.value).slice(0, 15));
            setError(null);
          }}
          placeholder="19ABCCA6289R1ZP"
          maxLength={15}
          disabled={inputLocked || verifying}
          className="h-12 rounded-full border-slate-300 px-4 text-center font-medium uppercase tracking-wide"
          aria-label="GST number"
        />
        <Button
          type="button"
          onClick={() => void handleVerify()}
          disabled={verifying || inputLocked || value.length !== 15}
          className={cn(
            "h-12 w-full rounded-full text-base font-semibold",
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
        <div className="mt-5 space-y-2 text-left text-sm text-slate-800">
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
          <p>
            <span className="font-semibold">GST Number:</span> {value}
          </p>
          {visibleRows.map(([label, rowValue]) => (
            <p key={label}>
              <span className="font-semibold">{label}:</span> {rowValue}
            </p>
          ))}
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
