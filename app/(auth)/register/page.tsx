"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
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
import { openPrivacyPolicy, openTermsOfService } from "@/lib/legal-links";
import {
  type RegisterFormValues,
  registerSchema,
} from "@/lib/schemas/onboarding";
import { useAuthStore } from "@/store/authStore";

export default function SellerRegisterPage() {
  const router = useRouter();
  const startSignup = useAuthStore((s) => s.startSignup);
  const isLoading = useAuthStore((s) => s.isLoading);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      companyName: "",
      mobileNumber: "",
      gstNumber: "",
    },
    mode: "onChange",
  });

  const onSubmit = async (values: RegisterFormValues) => {
    const result = await startSignup({
      fullName: values.fullName,
      companyName: values.companyName,
      gstNumber: values.gstNumber,
      mobile: values.mobileNumber,
    });
    if (!result.ok) {
      toast.error(result.message ?? "Unable to start registration");
      return;
    }
    toast.success("OTP sent — verify your mobile to continue");
    router.push(ROUTES.VERIFY_OTP);
  };

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 overflow-hidden lg:flex lg:flex-col">
        <div className="absolute inset-0 bg-[#0B1F3A]" />
        <div className="relative z-10 flex flex-1 flex-col p-10 text-white">
          <div className="flex items-center gap-3">
            <Image
              src="/brand/polystorex-logo.png"
              alt="PolyStoreX"
              width={40}
              height={40}
              className="h-10 w-10 rounded-lg bg-white object-contain p-0.5"
              priority
            />
            <p className="text-lg font-semibold">PolyStoreX</p>
          </div>
          <div className="my-auto max-w-md">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold leading-tight"
            >
              Join as an enterprise seller.
            </motion.h1>
            <p className="mt-4 text-white/70">
              Create your seller account, complete onboarding, and send your
              application to PolyStoreX Admin for approval before trading.
            </p>
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
            <div className="mb-2 flex justify-center lg:hidden">
              <Image
                src="/brand/polystorex-logo.png"
                alt="PolyStoreX"
                width={48}
                height={48}
                className="h-12 w-12 rounded-full object-contain"
                priority
              />
            </div>
            <h2 className="text-center text-2xl font-bold text-slate-900 lg:text-left">
              PolyStoreX
            </h2>
            <p className="mt-1 text-center text-sm text-slate-500 lg:text-left">
              Create a Seller Enterprise Account
            </p>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="mt-8 space-y-5"
                noValidate
              >
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Full Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your full name"
                          autoComplete="name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Company Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter legal entity name"
                          autoComplete="organization"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mobileNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Mobile Number
                      </FormLabel>
                      <div className="flex gap-2">
                        <div className="flex h-10 w-20 items-center justify-center rounded-md border bg-slate-50 text-sm font-medium">
                          +91
                        </div>
                        <FormControl>
                          <Input
                            placeholder="98765 43210"
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
                <FormField
                  control={form.control}
                  name="gstNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        GST Number
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="22AAAAA0000A1Z5"
                          autoCapitalize="characters"
                          {...field}
                          onChange={(event) =>
                            field.onChange(event.target.value.toUpperCase())
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={!form.formState.isValid || isLoading}
                >
                  {isLoading ? "Sending OTP…" : "Register & Continue"}
                </Button>
              </form>
            </Form>

            <div className="mt-5 flex items-center justify-center gap-2 text-sm text-emerald-600">
              <Lock className="h-4 w-4" />
              Secure 256-bit encrypted registration
            </div>
            <p className="mt-3 text-center text-xs text-slate-500">
              After OTP verification you complete seller onboarding. Your
              application is then sent to Admin for approval.
            </p>
            <p className="mt-6 text-center text-sm text-slate-600">
              Already have an account?{" "}
              <Link
                href={ROUTES.LOGIN}
                className="font-medium text-[#3B6EA8] hover:underline"
              >
                Login
              </Link>
            </p>
            <p className="mt-4 text-center text-xs text-slate-400">
              By registering, you agree to our{" "}
              <button
                type="button"
                className="text-[#3B6EA8] underline"
                onClick={() => void openTermsOfService()}
              >
                Terms of Service
              </button>{" "}
              and{" "}
              <button
                type="button"
                className="text-[#3B6EA8] underline"
                onClick={() => void openPrivacyPolicy()}
              >
                Privacy Policy
              </button>
              .
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
