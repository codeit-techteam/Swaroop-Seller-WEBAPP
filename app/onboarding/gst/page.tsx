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
import { type GstPanFormValues, gstPanSchema } from "@/lib/schemas/onboarding";
import { useOnboardingStore } from "@/store/onboardingStore";

export default function OnboardingGstPage() {
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

  const form = useForm<GstPanFormValues>({
    resolver: zodResolver(gstPanSchema),
    defaultValues: {
      gstNumber: gst.gstNumber || company.gstNumber,
      panNumber: pan.panNumber || company.panNumber,
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => {
          const panNumber = values.panNumber?.toUpperCase() ?? "";
          updateCompany({
            gstNumber: values.gstNumber.toUpperCase(),
            panNumber,
          });
          updateGst({
            gstNumber: values.gstNumber.toUpperCase(),
            status: "verified",
          });
          updatePan({
            panNumber,
            status: panNumber ? "verified" : "idle",
          });
          markStepComplete("gst-pan");
          setCurrentStep("bank");
          toast.success("GST and PAN saved");
          router.push(`${ROUTES.ONBOARDING_BANK}${previewSuffix}`);
        })}
        className="space-y-5"
      >
        <div>
          <h1 className="text-xl font-semibold">GST & PAN</h1>
          <p className="mt-1 text-sm text-slate-500">
            GST is required for invoices. PAN can be added now or later.
          </p>
        </div>
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
        <FormField
          control={form.control}
          name="panNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                PAN Number
                <span className="font-normal text-slate-400"> (Optional)</span>
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
