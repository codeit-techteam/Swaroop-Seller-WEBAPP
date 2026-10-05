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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useSellerIdentityVerification } from "@/hooks/useSellerIdentityVerification";
import { ROUTES } from "@/lib/constants";
import { type GstPanFormValues, gstPanSchema } from "@/lib/schemas/onboarding";
import { extractPanFromGstin } from "@/lib/utils/gst";
import { isVerificationAccepted } from "@/services/seller-kyc-verification";
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
  const identity = useSellerIdentityVerification();

  const form = useForm<GstPanFormValues>({
    resolver: zodResolver(gstPanSchema),
    defaultValues: {
      gstNumber: gst.gstNumber || company.gstNumber,
      panNumber: pan.panNumber || company.panNumber,
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

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => {
          if (!identityAccepted) {
            toast.error(
              identity.mismatch
                ? "GST/PAN mismatch: verify the PAN that the GSTIN is registered to."
                : "Verify GST and PAN before continuing",
            );
            return;
          }
          const panValue = values.panNumber.toUpperCase();
          updateCompany({
            gstNumber: values.gstNumber.toUpperCase(),
            panNumber: panValue,
          });
          updateGst({ pan: panValue });
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
            GST and PAN are verified with the government registry before you
            continue.
          </p>
        </div>
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
        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Back
          </Button>
          <Button type="submit" disabled={!identityAccepted}>
            Continue
          </Button>
        </div>
      </form>
    </Form>
  );
}
