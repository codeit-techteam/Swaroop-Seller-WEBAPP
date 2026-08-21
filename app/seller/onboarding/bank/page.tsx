"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  FooterNavigation,
  ProgressHeader,
  VerificationStatusBadge,
} from "@/components/onboarding";
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
import { type BankFormValues, bankSchema } from "@/lib/schemas/onboarding";
import { cn } from "@/lib/utils";
import { useOnboardingStore } from "@/store/onboardingStore";

export default function BankPage() {
  const router = useRouter();
  const bank = useOnboardingStore((s) => s.bank);
  const company = useOnboardingStore((s) => s.company);
  const updateBank = useOnboardingStore((s) => s.updateBank);
  const markStepComplete = useOnboardingStore((s) => s.markStepComplete);
  const setCurrentStep = useOnboardingStore((s) => s.setCurrentStep);
  const [showAccountNumber, setShowAccountNumber] = useState(false);

  useEffect(() => {
    setCurrentStep("bank");
  }, [setCurrentStep]);

  const form = useForm<BankFormValues>({
    resolver: zodResolver(bankSchema),
    defaultValues: {
      accountHolderName: bank.accountHolderName || company.companyName,
      bankName: bank.bankName,
      accountNumber: bank.accountNumber,
      confirmAccountNumber: bank.confirmAccountNumber,
      ifscCode: bank.ifscCode,
      branchName: bank.branchName,
    },
  });

  const onSubmit = (values: BankFormValues) => {
    updateBank({ ...values, isVerified: true });
    markStepComplete("bank");
    setCurrentStep("review");
    toast.success("Bank details saved");
    router.push(ROUTES.ONBOARDING_REVIEW);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-4xl pb-24"
    >
      <ProgressHeader
        stepId="bank"
        title="Bank Account Verification"
        description="Step 3 of 4: Provide your business bank account details for payment settlements."
        badge={
          bank.isVerified ? (
            <VerificationStatusBadge
              status="verified"
              label="Bank Account Verified"
            />
          ) : null
        }
      />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
          noValidate
        >
          <section className="rounded-xl border bg-card p-6 shadow-card">
            <h3 className="mb-4 text-lg font-semibold">Bank Account Details</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="accountHolderName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Holder Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bankName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter bank name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="accountNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Number</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="text"
                          inputMode="numeric"
                          autoComplete="off"
                          placeholder="Enter account number"
                          className={cn(
                            "pr-10",
                            !showAccountNumber &&
                              "[-webkit-text-security:disc]",
                          )}
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowAccountNumber((open) => !open)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          aria-label={
                            showAccountNumber
                              ? "Hide account number"
                              : "Show account number"
                          }
                        >
                          {showAccountNumber ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmAccountNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Account Number</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        placeholder="Re-enter account number"
                        {...field}
                        onPaste={(event) => {
                          const pasted = event.clipboardData
                            .getData("text")
                            .replace(/\s/g, "");
                          event.preventDefault();
                          field.onChange(pasted);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ifscCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IFSC Code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., HDFC0001234"
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
              <FormField
                control={form.control}
                name="branchName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Branch Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter branch name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </section>

          <FooterNavigation
            onPrevious={() => router.push(ROUTES.ONBOARDING_DOCUMENTS)}
            continueType="submit"
          />
        </form>
      </Form>
    </motion.div>
  );
}
