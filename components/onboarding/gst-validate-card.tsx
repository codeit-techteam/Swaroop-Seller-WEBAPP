"use client";

import { Check } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  GST_BOOK_MEETING_URL,
  GST_KNOW_MORE_URL,
  type GstParseResult,
  normalizeGstin,
  parseGstin,
} from "@/lib/utils/gst";
import { cn } from "@/lib/utils";

const VALIDATE_DELAY_MS = 500;

type GstValidateCardProps = {
  value: string;
  verified: boolean;
  result?: GstParseResult | null;
  onChange: (gstNumber: string) => void;
  onVerified: (result: GstParseResult) => void;
  className?: string;
};

export function GstValidateCard({
  value,
  verified,
  result,
  onChange,
  onVerified,
  className,
}: GstValidateCardProps) {
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleValidate = () => {
    const parsed = parseGstin(value);
    if (!parsed.isValid) {
      setError(parsed.error ?? "Enter a valid GST number");
      return;
    }

    setError(null);
    setValidating(true);
    window.setTimeout(() => {
      onVerified(parsed);
      setValidating(false);
    }, VALIDATE_DELAY_MS);
  };

  const showResult = verified && result?.isValid;

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
          className="h-12 rounded-full border-slate-300 px-4 text-center font-medium uppercase tracking-wide"
          aria-label="GST number"
        />
        <Button
          type="button"
          onClick={handleValidate}
          disabled={validating || value.length !== 15}
          className="h-12 w-full rounded-full bg-[#4F6BFF] text-base font-semibold hover:bg-[#3F58E8]"
        >
          {validating ? "Validating…" : "Validate"}
        </Button>
      </div>

      {error ? (
        <p className="mt-3 text-left text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      {showResult ? (
        <div className="mt-5 space-y-2 text-left text-sm text-slate-800">
          <p className="flex items-center gap-2 font-semibold text-green-600">
            <Check className="h-4 w-4" aria-hidden="true" />
            Valid GST Number
          </p>
          <p>
            <span className="font-semibold">GST Number:</span> {result.gstNumber}
          </p>
          <p>
            <span className="font-semibold">State Code:</span> {result.stateCode}
          </p>
          <p>
            <span className="font-semibold">State:</span> {result.state}
          </p>
          <p>
            <span className="font-semibold">Company PAN:</span>{" "}
            <span className="rounded bg-sky-100 px-1.5 py-0.5 font-semibold tracking-wide">
              {result.pan}
            </span>
          </p>
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
      ) : null}
    </div>
  );
}
