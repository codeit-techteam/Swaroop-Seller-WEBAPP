"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/lib/constants";
import {
  openContactSupport,
  openPrivacyPolicy,
  openTermsOfService,
} from "@/lib/legal-links";
import { type LoginFormValues, loginSchema } from "@/lib/schemas/onboarding";
import { useAuthStore } from "@/store/authStore";

/** Local dev only — never enable in production. */
const SHOW_DEMO_OTP = process.env.NEXT_PUBLIC_DEMO_OTP === "true";

const features = [
  {
    title: "Publish live offers",
    description: "Set grade prices, bulk slabs and remarks in minutes.",
  },
  {
    title: "Respond to buyer requests",
    description:
      "Accept, reject or counter without exposing buyer identity early.",
  },
  {
    title: "Track dispatch and settlements",
    description:
      "Stay on top of loading, transit and receivables from one desk.",
  },
];

export default function SellerLoginPage() {
  const router = useRouter();
  const sendOtp = useAuthStore((s) => s.sendOtp);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { mobileNumber: SHOW_DEMO_OTP ? "8240890242" : "" },
  });

  const onSubmit = async (values: LoginFormValues) => {
    const result = await sendOtp(values.mobileNumber);
    if (!result.ok) {
      toast.error(result.message ?? "Unable to send OTP");
      return;
    }
    if (result.message) {
      toast(result.message, { icon: "⚠️" });
    } else {
      toast.success(
        SHOW_DEMO_OTP ? "OTP sent — use 123456 in development" : "OTP sent",
      );
    }
    router.push(ROUTES.VERIFY_OTP);
  };

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 overflow-hidden lg:flex lg:flex-col">
        <div className="absolute inset-0 bg-[#0B1F3A]" />
        <div className="relative z-10 flex flex-1 flex-col p-10 text-white">
          <Image
            src="/brand/polystorex-logo-transparent.png"
            alt="PolyStoreX"
            width={848}
            height={372}
            className="h-16 w-auto max-w-full self-start"
            priority
          />
          <div className="my-auto max-w-md">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold leading-tight"
            >
              Sell polymers with a clearer operating desk.
            </motion.h1>
            <p className="mt-4 text-white/70">
              Manage locations, grades, offers and orders from one seller
              workspace built for industrial trade.
            </p>
            <ul className="mt-10 space-y-5">
              {features.map((feature, index) => (
                <motion.li
                  key={feature.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex gap-3"
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#7DB4FF]" />
                  <div>
                    <p className="font-semibold">{feature.title}</p>
                    <p className="text-sm text-white/60">
                      {feature.description}
                    </p>
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col bg-white lg:w-1/2">
        <div className="flex flex-1 flex-col justify-center px-8 py-12 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto w-full max-w-md"
          >
            <Image
              src="/brand/polystorex-logo-light-bg.png"
              alt="PolyStoreX"
              width={928}
              height={436}
              className="mb-6 h-14 w-auto max-w-full self-start lg:hidden"
              priority
            />
            <h2 className="text-2xl font-bold text-slate-900">Seller Login</h2>
            <p className="mt-2 text-sm text-slate-500">
              Mobile OTP only — enter your registered number to receive a
              one-time code. No email or password login.
            </p>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="mt-8 space-y-6"
                noValidate
              >
                <FormField
                  control={form.control}
                  name="mobileNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold uppercase tracking-wider">
                        Mobile Number
                      </FormLabel>
                      <div className="flex gap-2">
                        <div className="flex h-10 w-20 items-center justify-center rounded-md border bg-slate-50 text-sm font-medium">
                          +91
                        </div>
                        <FormControl>
                          <Input
                            placeholder="Enter 10-digit mobile number"
                            inputMode="numeric"
                            maxLength={10}
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" size="lg">
                  Send OTP
                </Button>
              </form>
            </Form>
            {SHOW_DEMO_OTP ? (
              <p className="mt-4 text-xs text-slate-400">
                Dev login:{" "}
                <span className="font-semibold text-slate-600">Karan Veer</span>{" "}
                ·{" "}
                <span className="font-semibold text-slate-600">8240890242</span>{" "}
                · OTP{" "}
                <span className="font-semibold text-slate-600">123456</span>
              </p>
            ) : null}
            <div className="mt-6 border-t pt-6 text-center">
              <p className="text-sm text-slate-500">
                New to PolyStoreX Seller?
              </p>
              <Link
                href={ROUTES.REGISTER}
                className="mt-2 inline-flex h-11 w-full items-center justify-center rounded-md bg-slate-800 text-sm font-semibold text-white hover:bg-slate-700"
              >
                Sign Up
              </Link>
              <p className="mt-3 text-xs text-slate-400">
                Fill your details, verify OTP, complete onboarding, then Admin
                approves your seller account.
              </p>
            </div>
          </motion.div>
        </div>
        <footer className="flex justify-center gap-6 border-t px-8 py-4 text-xs text-slate-500">
          <button
            type="button"
            className="hover:text-slate-800"
            onClick={() => void openContactSupport({ topic: "SELL_MATERIALS" })}
          >
            Support
          </button>
          <button
            type="button"
            className="hover:text-slate-800"
            onClick={() => void openPrivacyPolicy()}
          >
            Privacy Policy
          </button>
          <button
            type="button"
            className="hover:text-slate-800"
            onClick={() => void openTermsOfService()}
          >
            Terms
          </button>
        </footer>
      </div>
    </div>
  );
}
