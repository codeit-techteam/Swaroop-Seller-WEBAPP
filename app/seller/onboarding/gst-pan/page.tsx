"use client";

import { motion } from "framer-motion";
import { CreditCard, Loader2, RefreshCw, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  FooterNavigation,
  ProgressHeader,
  VerificationStatusBadge,
  VerificationStatusCard,
} from "@/components/onboarding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMockVerification } from "@/hooks/useMockUpload";
import { ROUTES } from "@/lib/constants";
import { verificationStatusCards } from "@/mock/onboarding/onboardingMock";
import { useOnboardingStore } from "@/store/onboardingStore";

export default function GstPanPage() {
  const router = useRouter();
  const company = useOnboardingStore((s) => s.company);
  const gst = useOnboardingStore((s) => s.gst);
  const pan = useOnboardingStore((s) => s.pan);
  const updateGst = useOnboardingStore((s) => s.updateGst);
  const updatePan = useOnboardingStore((s) => s.updatePan);
  const markStepComplete = useOnboardingStore((s) => s.markStepComplete);
  const setCurrentStep = useOnboardingStore((s) => s.setCurrentStep);
  const { verifyGst, verifyPan } = useMockVerification();

  const [gstInput, setGstInput] = useState(
    gst.gstNumber || company.gstNumber || "27AABCPI1234F1Z1",
  );
  const [panInput, setPanInput] = useState(
    pan.panNumber || company.panNumber || "",
  );

  useEffect(() => {
    setCurrentStep("gst-pan");
  }, [setCurrentStep]);

  const handleVerifyGst = async () => {
    if (
      !gstInput.match(
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
      )
    ) {
      toast.error("Enter a valid GST number");
      return;
    }
    await verifyGst(gstInput);
    toast.success("GST verified successfully");
  };

  const handleVerifyPan = async () => {
    if (!panInput.match(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)) {
      toast.error("Enter a valid PAN number");
      return;
    }
    await verifyPan(panInput);
    toast.success("PAN verified successfully");
  };

  const handleContinue = () => {
    if (gst.status !== "verified" || pan.status !== "verified") {
      toast.error("Please verify both GST and PAN before continuing");
      return;
    }
    markStepComplete("gst-pan");
    setCurrentStep("bank");
    router.push(ROUTES.ONBOARDING_BANK);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-4xl pb-24"
    >
      <ProgressHeader
        stepId="gst-pan"
        title="GST and PAN Verification"
        description="Verify your business tax identifiers against central government registries for instant validation."
      />

      <div className="space-y-6">
        <section className="rounded-xl border bg-card p-6 shadow-card">
          <div className="mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">GST Verification</h3>
          </div>

          <div className="flex gap-3">
            <div className="flex-1 space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider">
                GST Number
              </Label>
              <Input
                value={gstInput}
                onChange={(e) => {
                  setGstInput(e.target.value.toUpperCase());
                  updateGst({
                    gstNumber: e.target.value.toUpperCase(),
                    status: "idle",
                  });
                }}
                placeholder="27AABCPI1234F1Z1"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleVerifyGst}
                disabled={gst.status === "loading"}
                type="button"
              >
                {gst.status === "loading" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Verify GST
              </Button>
            </div>
          </div>

          {gst.status === "verified" ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-6 space-y-4 rounded-lg border border-success/30 bg-success/5 p-4"
            >
              <VerificationStatusBadge status="verified" />
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    Company Name
                  </p>
                  <p className="font-bold">{gst.companyName}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    GST Status
                  </p>
                  <p className="flex items-center gap-2 font-bold text-success">
                    <span className="h-2 w-2 rounded-full bg-success" />
                    {gst.gstStatus}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    Registered Address
                  </p>
                  <p className="font-medium">{gst.registeredAddress}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    GST Type
                  </p>
                  <p className="font-medium">{gst.gstType}</p>
                </div>
              </div>
            </motion.div>
          ) : null}
        </section>

        <section className="rounded-xl border bg-card p-6 shadow-card">
          <div className="mb-4 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">PAN Verification</h3>
          </div>

          <div className="flex gap-3">
            <div className="flex-1 space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider">
                PAN Number
              </Label>
              <Input
                value={panInput}
                onChange={(e) => {
                  setPanInput(e.target.value.toUpperCase());
                  updatePan({
                    panNumber: e.target.value.toUpperCase(),
                    status: "idle",
                  });
                }}
                placeholder="e.g., ABCDE1234F"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleVerifyPan}
                disabled={pan.status === "loading"}
                type="button"
              >
                {pan.status === "loading" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Verify PAN
              </Button>
            </div>
          </div>

          {pan.status === "loading" ? (
            <div className="mt-6 flex flex-col items-center justify-center rounded-lg border border-dashed border-primary/30 bg-primary/5 py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-4 text-sm text-muted-foreground">
                Connecting to income tax department nodes for verification...
              </p>
            </div>
          ) : null}

          {pan.status === "verified" ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-6 space-y-3 rounded-lg border border-success/30 bg-success/5 p-4"
            >
              <VerificationStatusBadge status="verified" />
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    Holder Name
                  </p>
                  <p className="font-bold">{pan.holderName}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    PAN Status
                  </p>
                  <p className="font-bold text-success">{pan.panStatus}</p>
                </div>
              </div>
            </motion.div>
          ) : null}
        </section>

        <div className="grid gap-4 md:grid-cols-3">
          {verificationStatusCards.map((card) => (
            <VerificationStatusCard
              key={card.status}
              status={card.status}
              title={card.title}
              description={card.description}
            />
          ))}
        </div>
      </div>

      <FooterNavigation
        onPrevious={() => router.push(ROUTES.ONBOARDING_DOCUMENTS)}
        onContinue={handleContinue}
      />
    </motion.div>
  );
}
