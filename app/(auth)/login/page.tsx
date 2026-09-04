"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { CheckCircle2, Package } from "lucide-react";
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
import { type LoginFormValues, loginSchema } from "@/lib/schemas/onboarding";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";

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
  const setPendingMobile = useAuthStore((s) => s.setPendingMobile);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { mobileNumber: "" },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setPendingMobile(values.mobileNumber);
    await authService.sendOtp(values.mobileNumber);
    toast.success("OTP sent to your mobile number");
    router.push(ROUTES.VERIFY_OTP);
  };

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 overflow-hidden lg:flex lg:flex-col">
        <div className="absolute inset-0 bg-[#0B1F3A]" />
        <div className="relative z-10 flex flex-1 flex-col p-10 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-semibold">PetroTrade</p>
            </div>
          </div>
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
            <h2 className="text-2xl font-bold text-slate-900">Seller Login</h2>
            <p className="mt-2 text-sm text-slate-500">
              Enter your registered mobile number to receive an OTP.
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
            <p className="mt-4 text-xs text-slate-400">
              Demo OTP is{" "}
              <span className="font-semibold text-slate-600">123456</span>
            </p>
          </motion.div>
        </div>
        <footer className="flex justify-center gap-6 border-t px-8 py-4 text-xs text-slate-500">
          <Link href={ROUTES.SUPPORT} className="hover:text-slate-800">
            Support
          </Link>
          <Link href="#" className="hover:text-slate-800">
            Privacy Policy
          </Link>
          <Link href="#" className="hover:text-slate-800">
            Terms
          </Link>
        </footer>
      </div>
    </div>
  );
}
