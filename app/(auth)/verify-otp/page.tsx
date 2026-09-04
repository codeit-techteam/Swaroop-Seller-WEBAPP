"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ArrowLeft, Package } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { OtpInput } from "@/components/onboarding/otp-input";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { ROUTES } from "@/lib/constants";
import { type OtpFormValues, otpSchema } from "@/lib/schemas/onboarding";
import { useAuthStore } from "@/store/authStore";

const RESEND_SECONDS = 45;

export default function VerifyOtpPage() {
  const router = useRouter();
  const pendingMobile = useAuthStore((s) => s.pendingMobile);
  const verifyOtp = useAuthStore((s) => s.verifyOtp);
  const onboardingComplete = useAuthStore((s) => s.onboardingComplete);
  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  const [isVerifying, setIsVerifying] = useState(false);

  const form = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  useEffect(() => {
    if (!pendingMobile) router.replace(ROUTES.LOGIN);
  }, [pendingMobile, router]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = window.setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => window.clearInterval(timer);
  }, [countdown]);

  const formattedMobile = pendingMobile.replace(/(\d{5})(\d{5})/, "$1 $2");

  const onSubmit = useCallback(
    async (values: OtpFormValues) => {
      setIsVerifying(true);
      const result = await verifyOtp(values.otp);
      setIsVerifying(false);
      if (!result.ok) {
        form.setError("otp", { message: result.message });
        toast.error(result.message ?? "Invalid OTP");
        return;
      }
      toast.success("Logged in successfully");
      router.push(onboardingComplete ? ROUTES.DASHBOARD : ROUTES.ONBOARDING);
    },
    [form, onboardingComplete, router, verifyOtp],
  );

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-2/5 overflow-hidden bg-[#0B1F3A] lg:flex lg:flex-col">
        <div className="relative z-10 flex flex-1 flex-col p-10 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
              <Package className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold">PetroTrade Seller</span>
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
            href={ROUTES.LOGIN}
            className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Change Number
          </Link>
          <h2 className="text-2xl font-bold">Enter OTP</h2>
          <p className="mt-2 text-sm text-slate-500">
            We&apos;ve sent an OTP to +91 {formattedMobile || "XXXXX XXXXX"}
          </p>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="mt-8 space-y-6"
            >
              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <OtpInput
                      value={field.value}
                      onChange={field.onChange}
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
                {isVerifying ? "Verifying…" : "Verify & Login"}
              </Button>
            </form>
          </Form>
          <button
            type="button"
            disabled={countdown > 0}
            onClick={() => {
              setCountdown(RESEND_SECONDS);
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
