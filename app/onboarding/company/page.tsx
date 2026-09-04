"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
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
  type CompanyDetailsFormValues,
  companyDetailsSchema,
} from "@/lib/schemas/onboarding";
import { useOnboardingStore } from "@/store/onboardingStore";

export default function OnboardingCompanyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const previewSuffix = searchParams.get("preview") === "1" ? "?preview=1" : "";
  const company = useOnboardingStore((s) => s.company);
  const updateCompany = useOnboardingStore((s) => s.updateCompany);
  const updateGst = useOnboardingStore((s) => s.updateGst);
  const updatePan = useOnboardingStore((s) => s.updatePan);
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

  const onSubmit = (values: CompanyDetailsFormValues) => {
    const companyName = values.companyName.trim();
    updateCompany({
      ...values,
      companyName,
      legalName: companyName,
      gstNumber: values.gstNumber.toUpperCase(),
      panNumber: values.panNumber?.toUpperCase() ?? "",
    });
    updateGst({
      gstNumber: values.gstNumber.toUpperCase(),
      status: "verified",
    });
    updatePan({
      panNumber: values.panNumber?.toUpperCase() ?? "",
      status: values.panNumber ? "verified" : "idle",
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
            Tell us about the business you will sell from.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
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
                <FormLabel>GST Number</FormLabel>
                <FormControl>
                  <Input
                    placeholder="33AABCR1234M1Z5"
                    className="uppercase"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
                <FormLabel>
                  PAN Number
                  <span className="font-normal text-slate-400">
                    {" "}
                    (Optional)
                  </span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="AABCR1234M"
                    className="uppercase"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end gap-3">
          <Button type="submit">Continue</Button>
        </div>
      </form>
    </Form>
  );
}
