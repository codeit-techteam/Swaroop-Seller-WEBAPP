"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { OtpInput } from "@/components/onboarding/otp-input";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { ROUTES } from "@/lib/constants";
import { type OtpFormValues, otpSchema } from "@/lib/schemas/onboarding";
import { MOCK_OTP } from "@/mock/onboarding/onboardingMock";
import { useOnboardingStore } from "@/store/onboardingStore";

const RESEND_SECONDS = 45;

export default function SellerOtpPage() {
  const router = useRouter();
  const mobileNumber = useOnboardingStore((s) => s.mobileNumber);
  const setOtpVerified = useOnboardingStore((s) => s.setOtpVerified);
  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  const [isVerifying, setIsVerifying] = useState(false);

  const form = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  const otp = form.watch("otp");

  useEffect(() => {
    if (!mobileNumber) {
      router.replace(ROUTES.SELLER_LOGIN);
    }
  }, [mobileNumber, router]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const formattedMobile = mobileNumber.replace(/(\d{5})(\d{5})/, "$1 $2");

  const onSubmit = useCallback(
    async (values: OtpFormValues) => {
      setIsVerifying(true);
      await new Promise((r) => setTimeout(r, 800));

      if (values.otp === MOCK_OTP || values.otp.length === 6) {
        setOtpVerified(true);
        toast.success("Mobile number verified successfully");
        router.push(ROUTES.ONBOARDING_COMPANY);
      } else {
        form.setError("otp", { message: "Invalid OTP. Try 123456 for demo." });
        toast.error("Invalid OTP");
      }
      setIsVerifying(false);
    },
    [form, router, setOtpVerified],
  );

  const handleResend = () => {
    if (countdown > 0) return;
    setCountdown(RESEND_SECONDS);
    toast.success("OTP resent successfully");
  };

  return (
    <div className="flex min-h-screen min-w-[1024px]">
      <div className="relative hidden w-2/5 overflow-hidden lg:flex lg:flex-col">
        <div className="absolute inset-0 bg-sidebar" />
        <div className="relative z-10 flex flex-1 flex-col p-10 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
              <span className="text-xl font-bold">P</span>
            </div>
            <span className="text-lg font-semibold">PetroTrade ADMIN PANEL</span>
          </div>

          <div className="my-auto max-w-sm">
            <h1 className="text-3xl font-bold">
              Secure Access to Industrial Commerce
            </h1>
            <p className="mt-4 text-white/60">
              A secondary verification code ensures only authorized personnel
              access your ADMIN PANEL.
            </p>
          </div>

          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full ${i === 0 ? "bg-white" : "bg-white/30"}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col justify-center px-8 py-12 lg:w-3/5 lg:px-16">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mx-auto w-full max-w-md"
        >
          <h2 className="text-2xl font-bold">Verify Mobile Number</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter the 6-digit code sent to +91 {formattedMobile}{" "}
            <Link
              href={ROUTES.SELLER_LOGIN}
              className="font-medium text-success hover:underline"
            >
              Change
            </Link>
          </p>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="mt-8 space-y-6"
              noValidate
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

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {countdown > 0 ? (
                    <span>
                      Resend OTP in 0:{countdown.toString().padStart(2, "0")}
                    </span>
                  ) : (
                    <span>OTP expired</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={countdown > 0}
                  className="font-medium text-primary disabled:opacity-40"
                >
                  Resend Code
                </button>
              </div>

              <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-primary" />
                <p className="text-sm text-muted-foreground">
                  Your account is protected using OTP verification.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={otp.length !== 6 || isVerifying}
              >
                {isVerifying ? "Verifying..." : "Verify OTP"}
              </Button>
            </form>
          </Form>

          <Link
            href={ROUTES.SELLER_LOGIN}
            className="mt-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Link>
        </motion.div>

        <p className="mx-auto mt-12 max-w-md text-center text-xs text-muted-foreground">
          © PetroTrade Enterprise Solutions. All rights reserved.
          Institutional Grade Security • ISO 27001 Certified
        </p>
      </div>
    </div>
  );
}
