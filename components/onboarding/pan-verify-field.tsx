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
const PAN_NAME_REGEX = /^[A-Za-z0-9][A-Za-z0-9 .&'()/,-]*$/;
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function todayIso() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

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
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const accepted = status === "verified" || status === "pending";
  const inputLocked = locked || accepted;
  const displayStatus: VerificationStatus = verifying ? "loading" : status;

  const handleVerify = async () => {
    const pan = value.trim().toUpperCase();
    if (!PAN_REGEX.test(pan)) {
      setError("Enter a valid 10-character PAN (for example ABCDE1234F).");
      return;
    }
    const name = fullName.trim().replace(/\s+/g, " ");
    if (name.length < 2 || !PAN_NAME_REGEX.test(name)) {
      setError("Enter the name exactly as printed on the PAN card.");
      return;
    }
    if (!ISO_DATE_REGEX.test(dob) || dob > todayIso()) {
      setError(
        "Enter the date of birth / incorporation shown on the PAN card.",
      );
      return;
    }
    setError(null);
    setVerifying(true);
    try {
      const result = await verifySellerPan(pan, { fullName: name, dob });
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
          disabled={
            verifying ||
            inputLocked ||
            value.length !== 10 ||
            fullName.trim().length < 2 ||
            !dob
          }
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
      {!inputLocked ? (
        <div className="grid gap-2 sm:grid-cols-2">
          <Input
            value={fullName}
            onChange={(event) => {
              setFullName(event.target.value.slice(0, 150));
              setError(null);
            }}
            placeholder="Name as per PAN"
            maxLength={150}
            disabled={verifying}
            autoComplete="off"
            aria-label="Name as per PAN"
          />
          <Input
            type="date"
            value={dob}
            onChange={(event) => {
              setDob(event.target.value);
              setError(null);
            }}
            max={todayIso()}
            disabled={verifying}
            aria-label="Date of birth or incorporation as per PAN"
            title="Date of birth (individual) or incorporation (company/firm) as per PAN"
          />
        </div>
      ) : null}
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
