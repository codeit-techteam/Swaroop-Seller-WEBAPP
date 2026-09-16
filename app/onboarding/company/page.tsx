"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { GstValidateCard } from "@/components/onboarding/gst-validate-card";
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
  type CompanyDetailsFormValues,
  companyDetailsSchema,
} from "@/lib/schemas/onboarding";
import { type GstParseResult, parseGstin } from "@/lib/utils/gst";
import { useOnboardingStore } from "@/store/onboardingStore";

export default function OnboardingCompanyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const previewSuffix = searchParams.get("preview") === "1" ? "?preview=1" : "";
  const company = useOnboardingStore((s) => s.company);
  const gst = useOnboardingStore((s) => s.gst);
  const updateCompany = useOnboardingStore((s) => s.updateCompany);
  const updateGst = useOnboardingStore((s) => s.updateGst);
  const updatePan = useOnboardingStore((s) => s.updatePan);
  const updateLocation = useOnboardingStore((s) => s.updateLocation);
  const markStepComplete = useOnboardingStore((s) => s.markStepComplete);
  const setCurrentStep = useOnboardingStore((s) => s.setCurrentStep);

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

  const gstNumber = form.watch("gstNumber");
  const gstResult = parseGstin(gst.gstNumber || gstNumber);
  const gstVerified =
    gst.status === "verified" &&
    gst.gstNumber === gstNumber &&
    gstResult.isValid;

  const applyGstResult = (result: GstParseResult) => {
    form.setValue("gstNumber", result.gstNumber, { shouldValidate: true });
    form.setValue("panNumber", result.pan, { shouldValidate: true });
    updateCompany({
      gstNumber: result.gstNumber,
      panNumber: result.pan,
    });
    updateGst({
      gstNumber: result.gstNumber,
      status: "verified",
      gstStatus: "ACTIVE",
      gstType: "Regular",
      stateCode: result.stateCode,
      state: result.state,
      pan: result.pan,
    });
    updatePan({
      panNumber: result.pan,
      status: "verified",
      panStatus: "VALID",
    });
    updateLocation({ state: result.state });
  };

  const onSubmit = (values: CompanyDetailsFormValues) => {
    if (!gstVerified) {
      toast.error("Validate GST before continuing");
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
    updateGst({
      gstNumber: gstNumberValue,
      status: "verified",
      pan: panNumber,
    });
    updatePan({
      panNumber,
      status: "verified",
    });
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
            Tell us about the business you will sell from. Validate GST to
            auto-fill company PAN, matching Seller Panel onboarding.
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
                verified={gstVerified}
                result={gstVerified ? gstResult : null}
                onChange={(next) => {
                  field.onChange(next);
                  if (gst.status === "verified" && gst.gstNumber !== next) {
                    updateGst({
                      gstNumber: next,
                      status: "idle",
                      stateCode: undefined,
                      state: undefined,
                      pan: undefined,
                    });
                  }
                }}
                onVerified={applyGstResult}
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
                <FormControl>
                  <Input
                    placeholder="Validate GST to auto-fill PAN"
                    className="uppercase"
                    {...field}
                  />
                </FormControl>
                <p className="text-xs text-slate-500">
                  Company PAN is extracted from GSTIN after validation.
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end gap-3">
          <Button type="submit" disabled={!gstVerified}>
            Continue
          </Button>
        </div>
      </form>
    </Form>
  );
}
