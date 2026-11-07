"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ArrowLeft, Package } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { OtpInput } from "@/components/onboarding/otp-input";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { ROUTES } from "@/lib/constants";
import { type OtpFormValues, otpSchema } from "@/lib/schemas/onboarding";
import { useAuthStore } from "@/store/authStore";

const RESEND_SECONDS = 60;

function maskMobile(mobile: string): string {
  const digits = mobile.replace(/\D/g, "").slice(-10);
  if (digits.length !== 10) return "+91 ******XXXX";
  return `+91 ******${digits.slice(-4)}`;
}

export default function VerifyOtpPage() {
  const router = useRouter();
  const pendingMobile = useAuthStore((s) => s.pendingMobile);
  const verifyOtp = useAuthStore((s) => s.verifyOtp);
  const resendOtp = useAuthStore((s) => s.resendOtp);
  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  const [isVerifying, setIsVerifying] = useState(false);
  const verifyingRef = useRef(false);

  const form = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  const otpPurpose = useAuthStore((s) => s.otpPurpose);

  useEffect(() => {
    if (!pendingMobile) {
      router.replace(otpPurpose === "SIGNUP" ? ROUTES.REGISTER : ROUTES.LOGIN);
    }
  }, [otpPurpose, pendingMobile, router]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = window.setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => window.clearInterval(timer);
  }, [countdown]);

  const maskedMobile = maskMobile(pendingMobile);

  const submitOtp = useCallback(
    async (otp: string) => {
      if (otp.length !== 6 || verifyingRef.current) return;
      verifyingRef.current = true;
      setIsVerifying(true);
      const result = await verifyOtp(otp);
      if (!result.ok) {
        setIsVerifying(false);
        verifyingRef.current = false;
        form.setError("otp", { message: result.message });
        toast.error(result.message ?? "Invalid OTP");
        return;
      }
      toast.success(
        result.isSignup
          ? "Account created — complete onboarding for Admin review"
          : "Logged in successfully",
      );
      const done =
        result.onboardingComplete ?? useAuthStore.getState().onboardingComplete;
      router.push(
        done
          ? ROUTES.DASHBOARD
          : result.isSignup
            ? ROUTES.ONBOARDING_COMPANY
            : ROUTES.ONBOARDING,
      );
    },
    [form, router, verifyOtp],
  );

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-2/5 overflow-hidden bg-[#0B1F3A] lg:flex lg:flex-col">
        <div className="relative z-10 flex flex-1 flex-col p-10 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
              <Package className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold">PolyStoreX Seller</span>
          </div>
          <div className="my-auto">
            <h1 className="text-3xl font-bold">Verify your number</h1>
            <p className="mt-3 max-w-sm text-white/70">
              We use OTP login so your seller desk stays simple and secure. No
              passwords to remember.
            </p>
          </div>
        </div>
      </div>
      <div className="flex w-full flex-col justify-center px-8 py-12 lg:w-3/5 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto w-full max-w-md"
        >
          <Link
            href={otpPurpose === "SIGNUP" ? ROUTES.REGISTER : ROUTES.LOGIN}
            className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            {otpPurpose === "SIGNUP" ? "Back to Sign Up" : "Change Number"}
          </Link>
          <h2 className="text-2xl font-bold">Enter OTP</h2>
          <p className="mt-2 text-sm text-slate-500">
            Enter the 6-digit verification code sent to{" "}
            {maskedMobile || "+91 ******XXXX"}
          </p>
          {otpPurpose === "SIGNUP" ? (
            <p className="mt-2 text-xs text-slate-400">
              After verification, complete onboarding so Admin can review your
              seller application.
            </p>
          ) : null}
          <Form {...form}>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void form.handleSubmit((values) => submitOtp(values.otp))(
                  event,
                );
              }}
              className="mt-8 space-y-6"
            >
              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <OtpInput
                      value={field.value}
                      onChange={(value) => {
                        field.onChange(value);
                        if (value.length === 6) {
                          void submitOtp(value);
                        }
                      }}
                      disabled={isVerifying}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isVerifying}
              >
                {isVerifying
                  ? "Verifying…"
                  : otpPurpose === "SIGNUP"
                    ? "Verify & Continue"
                    : "Verify & Login"}
              </Button>
            </form>
          </Form>
          <button
            type="button"
            disabled={countdown > 0}
            onClick={async () => {
              const result = await resendOtp();
              setCountdown(result.resendCooldownSeconds ?? RESEND_SECONDS);
              if (!result.ok && result.message) {
                toast.error(result.message);
                return;
              }
              toast.success("OTP resent");
            }}
            className="mt-4 text-sm font-medium text-[#1B6EF3] disabled:text-slate-400"
          >
            {countdown > 0 ? `Resend OTP in ${countdown}s` : "Resend OTP"}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
