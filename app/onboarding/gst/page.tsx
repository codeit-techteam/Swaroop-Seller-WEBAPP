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
import { type GstPanFormValues, gstPanSchema } from "@/lib/schemas/onboarding";
import { type GstParseResult, parseGstin } from "@/lib/utils/gst";
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
  const updateLocation = useOnboardingStore((s) => s.updateLocation);
  const markStepComplete = useOnboardingStore((s) => s.markStepComplete);
  const setCurrentStep = useOnboardingStore((s) => s.setCurrentStep);

  const form = useForm<GstPanFormValues>({
    resolver: zodResolver(gstPanSchema),
    defaultValues: {
      gstNumber: gst.gstNumber || company.gstNumber,
      panNumber: pan.panNumber || company.panNumber,
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

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => {
          if (!gstVerified) {
            toast.error("Validate GST before continuing");
            return;
          }
          const panNumber = values.panNumber.toUpperCase();
          updateCompany({
            gstNumber: values.gstNumber.toUpperCase(),
            panNumber,
          });
          updateGst({
            gstNumber: values.gstNumber.toUpperCase(),
            status: "verified",
            pan: panNumber,
          });
          updatePan({
            panNumber,
            status: "verified",
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
            Validate GST to confirm state and auto-fill company PAN, same as
            Seller Panel onboarding.
          </p>
        </div>
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
        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Back
          </Button>
          <Button type="submit" disabled={!gstVerified}>
            Continue
          </Button>
        </div>
      </form>
    </Form>
  );
}
