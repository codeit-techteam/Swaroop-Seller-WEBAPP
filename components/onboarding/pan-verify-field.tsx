"use client";

import { useState } from "react";

import { REVERIFY_NOTICE } from "@/components/onboarding/gst-validate-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  type KycVerificationDetails,
  type KycVerificationResult,
  verificationApiError,
  verifySellerPan,
} from "@/services/seller-kyc-verification";
import type { VerificationStatus } from "@/types/onboarding";

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

type PanVerifyFieldProps = {
  value: string;
  status: VerificationStatus;
  details?: KycVerificationDetails;
  message?: string;
  locked?: boolean;
  onChange: (pan: string) => void;
  onResult: (result: KycVerificationResult, pan: string) => void;
  onEdit?: () => void;
};

function buttonLabel(status: VerificationStatus) {
  if (status === "loading") return "Verifying…";
  if (status === "verified") return "✓ Verified";
  if (status === "rejected") return "✕ Failed";
  if (status === "pending") return "In review";
  return "Verify";
}

export function PanVerifyField({
  value,
  status,
  details,
  message,
  locked = false,
  onChange,
  onResult,
  onEdit,
}: PanVerifyFieldProps) {
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const accepted = status === "verified" || status === "pending";
  const inputLocked = locked || accepted;
  const displayStatus: VerificationStatus = verifying ? "loading" : status;

  const handleVerify = async () => {
    const pan = value.trim().toUpperCase();
    if (!PAN_REGEX.test(pan)) {
      setError("Enter a valid 10-character PAN (for example ABCDE1234F).");
      return;
    }
    setError(null);
    setVerifying(true);
    try {
      const result = await verifySellerPan(pan);
      if (result.status === "FAILED") setError(result.message);
      onResult(result, pan);
    } catch (err) {
      setError(verificationApiError(err, "PAN verification failed."));
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(event) => {
            onChange(
              event.target.value.replace(/\s/g, "").toUpperCase().slice(0, 10),
            );
            setError(null);
          }}
          placeholder="ABCDE1234F"
          maxLength={10}
          disabled={inputLocked || verifying}
          className="uppercase"
          aria-label="PAN number"
        />
        <Button
          type="button"
          onClick={() => void handleVerify()}
          disabled={verifying || inputLocked || value.length !== 10}
          className={cn(
            "shrink-0",
            status === "verified" &&
              "bg-green-600 hover:bg-green-600 disabled:opacity-100",
            status === "rejected" &&
              !verifying &&
              "bg-red-600 hover:bg-red-700",
          )}
        >
          {buttonLabel(displayStatus)}
        </Button>
      </div>
      {status === "verified" && details?.nameOnPan ? (
        <p className="text-xs text-green-700">
          Name on PAN:{" "}
          <span className="font-semibold">{details.nameOnPan}</span>
        </p>
      ) : null}
      {status === "pending" ? (
        <p className="text-xs text-amber-700">
          {message ||
            "PAN verification is temporarily unavailable. Our team will verify it during review."}
        </p>
      ) : null}
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
      {error ? (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
