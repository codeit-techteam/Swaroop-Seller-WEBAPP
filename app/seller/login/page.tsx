"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

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
import { loginFeatures } from "@/mock/onboarding/onboardingMock";
import { useOnboardingStore } from "@/store/onboardingStore";

export default function SellerLoginPage() {
  const router = useRouter();
  const setMobileNumber = useOnboardingStore((s) => s.setMobileNumber);
  // const clearOnboardingProgress = useOnboardingStore(
  //   (s) => s.clearOnboardingProgress,
  // );
  // const setOtpVerified = useOnboardingStore((s) => s.setOtpVerified);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { mobileNumber: "" },
  });

  const onSubmit = (values: LoginFormValues) => {
    setMobileNumber(values.mobileNumber);
    router.push(ROUTES.SELLER_OTP);
  };

  // const handleRegister = () => {
  //   clearOnboardingProgress();
  //   setOtpVerified(true);
  //   router.push(ROUTES.ONBOARDING_COMPANY);
  // };

  return (
    <div className="flex min-h-screen min-w-[1024px]">
      <div className="relative hidden w-1/2 overflow-hidden lg:flex lg:flex-col">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(135deg, hsl(var(--sidebar)) 0%, hsl(var(--primary)) 100%)",
          }}
        />
        <div className="absolute inset-0 bg-sidebar/80" />
        <div className="relative z-10 flex flex-1 flex-col p-10 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
              <span className="text-xl font-bold">P</span>
            </div>
            <span className="text-lg font-semibold">PetroTrade ADMIN PANEL</span>
          </div>

          <div className="my-auto max-w-md">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold leading-tight"
            >
              Empowering Global Petrochemical Commerce
            </motion.h1>
            <p className="mt-4 text-white/70">
              Join the B2B marketplace trusted by industrial buyers and sellers
              worldwide.
            </p>

            <ul className="mt-10 space-y-5">
              {loginFeatures.map((feature, i) => (
                <motion.li
                  key={feature.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="flex gap-3"
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary-foreground/80" />
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

      <div className="flex w-full flex-col lg:w-1/2">
        <div className="flex flex-1 flex-col justify-center px-8 py-12 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto w-full max-w-md"
          >
            <h2 className="text-2xl font-bold text-foreground">
              ADMIN PANEL Login
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Access your ADMIN PANEL dashboard, inventory and orders.
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
                        <div className="flex h-10 w-20 items-center justify-center rounded-md border bg-muted text-sm font-medium">
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
                  GET OTP
                </Button>
              </form>
            </Form>

            {/* <p className="mt-8 text-center text-sm">
              New to PetroTrade?{" "}
              <button
                type="button"
                onClick={handleRegister}
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Register your business
              </button>
            </p> */}
          </motion.div>
        </div>

        <footer className="flex justify-center gap-6 border-t px-8 py-4 text-xs text-muted-foreground">
          <Link href="#" className="hover:text-foreground">
            Support
          </Link>
          <Link href="#" className="hover:text-foreground">
            Privacy Policy
          </Link>
          <Link href="#" className="hover:text-foreground">
            Terms & Conditions
          </Link>
        </footer>
      </div>
    </div>
  );
}
