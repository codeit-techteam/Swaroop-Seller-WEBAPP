"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { AlertTriangle, FileText, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  FooterNavigation,
  ProgressHeader,
  VerificationStatusBadge,
} from "@/components/onboarding";
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
import { mockIfscLookup } from "@/mock/onboarding/onboardingMock";
import { useOnboardingStore } from "@/store/onboardingStore";

export default function BankPage() {
  const router = useRouter();
  const bank = useOnboardingStore((s) => s.bank);
  const company = useOnboardingStore((s) => s.company);
  const updateBank = useOnboardingStore((s) => s.updateBank);
  const markStepComplete = useOnboardingStore((s) => s.markStepComplete);
  const setCurrentStep = useOnboardingStore((s) => s.setCurrentStep);
  const [isFetchingBranch, setIsFetchingBranch] = useState(false);

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

  const onDrop = useCallback(
    (files: File[]) => {
      const file = files[0];
      if (!file) return;
      const preview = file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : undefined;
      updateBank({
        cancelledChequeFileName: file.name,
        cancelledChequeSize: file.size,
        cancelledChequePreview: preview,
        manualReviewRequired: true,
        manualReviewMessage:
          "Manual Review Required. The name on the cheque slightly differs from the Business Name on record. Our team will verify within 24 hours.",
      });
      toast.success("Cancelled cheque uploaded");
    },
    [updateBank],
  );

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/png": [".png"],
      "image/jpeg": [".jpg"],
    },
    maxSize: 5 * 1024 * 1024,
    multiple: false,
    noClick: !!bank.cancelledChequeFileName,
  });

  const handleFetchBranch = async () => {
    const ifsc = form.getValues("ifscCode").toUpperCase();
    if (!ifsc.match(/^[A-Z]{4}0[A-Z0-9]{6}$/)) {
      toast.error("Enter a valid IFSC code");
      return;
    }
    setIsFetchingBranch(true);
    await new Promise((r) => setTimeout(r, 800));
    const branch =
      mockIfscLookup[ifsc] ?? `${ifsc.slice(0, 4)} Bank - Branch Office`;
    form.setValue("branchName", branch);
    if (!form.getValues("bankName")) {
      form.setValue("bankName", ifsc.slice(0, 4) + " Bank");
    }
    updateBank({ ifscCode: ifsc, branchName: branch });
    setIsFetchingBranch(false);
    toast.success("Branch details fetched");
  };

  const onSubmit = (values: BankFormValues) => {
    if (!bank.cancelledChequeFileName) {
      toast.error("Please upload cancelled cheque");
      return;
    }
    updateBank({ ...values, isVerified: true });
    markStepComplete("bank");
    setCurrentStep("location");
    toast.success("Bank details saved");
    router.push(ROUTES.ONBOARDING_LOCATION);
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
        description="Step 4 of 5: Provide your business bank account details for payment settlements."
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
                      <Input
                        type="password"
                        placeholder="Enter account number"
                        {...field}
                      />
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
                      <Input placeholder="Re-enter account number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="ifscCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>IFSC Code</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input
                            placeholder="e.g., HDFC0001234"
                            {...field}
                            onChange={(e) =>
                              field.onChange(e.target.value.toUpperCase())
                            }
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleFetchBranch}
                          disabled={isFetchingBranch}
                        >
                          <Search className="h-4 w-4" />
                          Fetch Branch
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="branchName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Branch Name</FormLabel>
                    <FormControl>
                      <Input readOnly className="bg-muted" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </section>

          <section className="rounded-xl border bg-card p-6 shadow-card">
            <h3 className="mb-4 text-lg font-semibold">
              Financial Document Upload
            </h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div
                {...getRootProps()}
                className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-10 hover:border-primary/50 hover:bg-muted/30"
              >
                <input {...getInputProps()} />
                <FileText className="mb-3 h-10 w-10 text-muted-foreground" />
                <p className="text-sm font-medium">
                  Drag & drop cancelled cheque
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  PDF, JPEG, PNG up to 5MB
                </p>
              </div>

              {bank.cancelledChequeFileName ? (
                <div className="rounded-lg border bg-muted/30 p-4">
                  {bank.cancelledChequePreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={bank.cancelledChequePreview}
                      alt="Cheque preview"
                      className="mb-3 h-32 w-full rounded object-cover"
                    />
                  ) : (
                    <div className="mb-3 flex h-32 items-center justify-center rounded bg-primary/10">
                      <FileText className="h-10 w-10 text-primary" />
                    </div>
                  )}
                  <p className="text-sm font-medium">
                    {bank.cancelledChequeFileName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {bank.cancelledChequeSize
                      ? `${(bank.cancelledChequeSize / 1024).toFixed(1)} KB`
                      : null}
                  </p>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={open}
                    type="button"
                    className="px-0"
                  >
                    Replace
                  </Button>
                </div>
              ) : null}
            </div>
          </section>

          {bank.manualReviewRequired && bank.manualReviewMessage ? (
            <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
              <AlertTriangle className="mt-0.5 h-5 w-5 text-destructive" />
              <p className="text-sm text-destructive">
                {bank.manualReviewMessage}
              </p>
            </div>
          ) : null}

          <FooterNavigation
            onPrevious={() => router.push(ROUTES.ONBOARDING_GST_PAN)}
            continueType="submit"
          />
        </form>
      </Form>
    </motion.div>
  );
}
