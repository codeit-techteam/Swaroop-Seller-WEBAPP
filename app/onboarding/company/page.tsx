"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { GstValidateCard } from "@/components/onboarding/gst-validate-card";
import { PanVerifyField } from "@/components/onboarding/pan-verify-field";
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
import { useSellerIdentityVerification } from "@/hooks/useSellerIdentityVerification";
import { ROUTES } from "@/lib/constants";
import {
  type CompanyDetailsFormValues,
  companyDetailsSchema,
} from "@/lib/schemas/onboarding";
import { extractPanFromGstin } from "@/lib/utils/gst";
import { isVerificationAccepted } from "@/services/seller-kyc-verification";
import { useOnboardingStore } from "@/store/onboardingStore";

export default function OnboardingCompanyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const previewSuffix = searchParams.get("preview") === "1" ? "?preview=1" : "";
  const company = useOnboardingStore((s) => s.company);
  const gst = useOnboardingStore((s) => s.gst);
  const pan = useOnboardingStore((s) => s.pan);
  const updateCompany = useOnboardingStore((s) => s.updateCompany);
  const updateGst = useOnboardingStore((s) => s.updateGst);
  const updatePan = useOnboardingStore((s) => s.updatePan);
  const markStepComplete = useOnboardingStore((s) => s.markStepComplete);
  const setCurrentStep = useOnboardingStore((s) => s.setCurrentStep);
  const identity = useSellerIdentityVerification();

  const form = useForm<CompanyDetailsFormValues>({
    resolver: zodResolver(companyDetailsSchema),
    defaultValues: {
      companyName: company.companyName || company.legalName,
      gstNumber: company.gstNumber,
      panNumber: company.panNumber,
      businessType: company.businessType,
      contactName: company.contactName,
      phone: company.phone,
      email: company.email,
    },
  });

  useEffect(() => {
    if (isVerificationAccepted(gst.status) && gst.gstNumber) {
      form.setValue("gstNumber", gst.gstNumber, { shouldValidate: true });
    }
    if (isVerificationAccepted(pan.status) && pan.panNumber) {
      form.setValue("panNumber", pan.panNumber, { shouldValidate: true });
    }
  }, [form, gst.gstNumber, gst.status, pan.panNumber, pan.status]);

  const gstNumber = form.watch("gstNumber");
  const panNumber = form.watch("panNumber");
  const gstStatus = gst.gstNumber === gstNumber ? gst.status : "idle";
  const panStatus = pan.panNumber === panNumber ? pan.status : "idle";
  const identityAccepted =
    isVerificationAccepted(gstStatus) &&
    isVerificationAccepted(panStatus) &&
    !identity.mismatch;

  const setPanValue = (next: string) => {
    form.setValue("panNumber", next, { shouldValidate: true });
    if (pan.panNumber !== next && pan.status !== "idle") {
      updatePan({ panNumber: next, status: "idle", details: undefined });
    }
  };

  const onSubmit = (values: CompanyDetailsFormValues) => {
    if (!identityAccepted) {
      toast.error(
        identity.mismatch
          ? "GST/PAN mismatch: verify the PAN that the GSTIN is registered to."
          : "Verify GST and PAN before continuing",
      );
      return;
    }

    const companyName = values.companyName.trim();
    const gstNumberValue = values.gstNumber.toUpperCase();
    const panNumber = values.panNumber.toUpperCase();
    updateCompany({
      ...values,
      companyName,
      legalName: companyName,
      gstNumber: gstNumberValue,
      panNumber,
    });
    updateGst({ pan: panNumber });
    markStepComplete("company");
    setCurrentStep("business");
    toast.success("Company details saved");
    router.push(`${ROUTES.ONBOARDING_BUSINESS}${previewSuffix}`);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <h1 className="text-xl font-semibold">Company Details</h1>
          <p className="mt-1 text-sm text-slate-500">
            Tell us about the business you will sell from. GST and PAN are
            verified with the government registry before you continue.
          </p>
        </div>
        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Registered / legal business name"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="gstNumber"
          render={({ field }) => (
            <FormItem>
              <GstValidateCard
                value={field.value}
                status={gstStatus}
                details={gst.details}
                message={gst.message}
                locked={identity.locked}
                onChange={(next) => {
                  field.onChange(next);
                  if (gst.gstNumber !== next && gst.status !== "idle") {
                    updateGst({
                      gstNumber: next,
                      status: "idle",
                      details: undefined,
                      stateCode: undefined,
                      state: undefined,
                      pan: undefined,
                    });
                  }
                }}
                onResult={(result, gstin) => {
                  form.setValue("gstNumber", gstin, { shouldValidate: true });
                  identity.applyGstResult(result, gstin);
                  if (
                    result.status !== "FAILED" &&
                    !form.getValues("panNumber")
                  ) {
                    setPanValue(extractPanFromGstin(gstin));
                  }
                }}
                onEdit={identity.editGst}
              />
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid gap-4 md:grid-cols-2">
          {(
            [
              ["businessType", "Business Type"],
              ["contactName", "Contact Person"],
              ["phone", "Mobile Number"],
              ["email", "Email"],
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
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
          <FormField
            control={form.control}
            name="panNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>PAN Number</FormLabel>
                <PanVerifyField
                  value={field.value}
                  status={panStatus}
                  details={pan.details}
                  message={pan.message}
                  locked={identity.locked}
                  onChange={setPanValue}
                  onResult={(result, value) => {
                    form.setValue("panNumber", value, { shouldValidate: true });
                    identity.applyPanResult(result, value);
                  }}
                  onEdit={identity.editPan}
                />
                {identity.mismatch ? (
                  <p className="text-xs text-red-600" role="alert">
                    GST/PAN mismatch: the PAN associated with the GSTIN does not
                    match the entered PAN.
                  </p>
                ) : null}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end gap-3">
          <Button type="submit" disabled={!identityAccepted}>
            Continue
          </Button>
        </div>
      </form>
    </Form>
  );
}
