"use client";

import { useCallback, useRef } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  className?: string;
}

export function OtpInput({
  value,
  onChange,
  length = 6,
  disabled = false,
  className,
}: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(length, " ").split("").slice(0, length);

  const focusInput = (index: number) => {
    inputRefs.current[index]?.focus();
  };

  const handleChange = (index: number, digit: string) => {
    if (!/^\d?$/.test(digit)) return;
    const newDigits = [...digits];
    newDigits[index] = digit || " ";
    const newValue = newDigits.join("").replace(/\s/g, "").slice(0, length);
    onChange(newValue);
    if (digit && index < length - 1) focusInput(index + 1);
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !digits[index]?.trim() && index > 0) {
      focusInput(index - 1);
    }
    if (e.key === "ArrowLeft" && index > 0) focusInput(index - 1);
    if (e.key === "ArrowRight" && index < length - 1) focusInput(index + 1);
  };

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      const pasted = e.clipboardData
        .getData("text")
        .replace(/\D/g, "")
        .slice(0, length);
      onChange(pasted);
      focusInput(Math.min(pasted.length, length - 1));
    },
    [length, onChange],
  );

  return (
    <div className={cn("flex gap-3", className)}>
      {Array.from({ length }).map((_, index) => (
        <Input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          disabled={disabled}
          value={digits[index]?.trim() ?? ""}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className={cn(
            "h-14 w-14 text-center text-xl font-semibold",
            index === value.length && "ring-2 ring-primary",
          )}
          autoFocus={index === 0}
        />
      ))}
    </div>
  );
}
