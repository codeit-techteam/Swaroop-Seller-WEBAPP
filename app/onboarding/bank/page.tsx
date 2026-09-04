"use client";

import { zodResolver } from "@hookform/resolvers/zod";
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
import { type BankFormValues, bankSchema } from "@/lib/schemas/onboarding";
import { useOnboardingStore } from "@/store/onboardingStore";

export default function OnboardingBankPage() {
  const router = useRouter();
  const bank = useOnboardingStore((s) => s.bank);
  const updateBank = useOnboardingStore((s) => s.updateBank);
  const markStepComplete = useOnboardingStore((s) => s.markStepComplete);
  const setCurrentStep = useOnboardingStore((s) => s.setCurrentStep);

  const form = useForm<BankFormValues>({
    resolver: zodResolver(bankSchema),
    defaultValues: {
      accountHolderName: bank.accountHolderName,
      bankName: bank.bankName,
      accountNumber: bank.accountNumber,
      confirmAccountNumber: bank.confirmAccountNumber,
      ifscCode: bank.ifscCode,
      branchName: bank.branchName,
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => {
          updateBank({ ...values, isVerified: true });
          markStepComplete("bank");
          setCurrentStep("documents");
          toast.success("Bank details saved");
          router.push(ROUTES.ONBOARDING_DOCUMENTS);
        })}
        className="space-y-5"
      >
        <div>
          <h1 className="text-xl font-semibold">Bank Details</h1>
          <p className="mt-1 text-sm text-slate-500">
            Used for settlements. Account number stays masked in the portal.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {(
            [
              ["accountHolderName", "Account Holder Name"],
              ["bankName", "Bank Name"],
              ["accountNumber", "Account Number"],
              ["confirmAccountNumber", "Confirm Account Number"],
              ["ifscCode", "IFSC"],
              ["branchName", "Branch"],
            ] as const
          ).map(([name, label]) => (
            <FormField
              key={name}
              control={form.control}
              name={name}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{label}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type={
                        name.includes("accountNumber") ? "password" : "text"
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>
        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Back
          </Button>
          <Button type="submit">Continue</Button>
        </div>
      </form>
    </Form>
  );
}
