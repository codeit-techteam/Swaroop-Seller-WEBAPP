"use client";

import { motion } from "framer-motion";
import { Loader2, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";

import { FormInput } from "@/components/forms/form-fields";
import { FormWrapper } from "@/components/forms/form-wrapper";
import {
  FooterNavigation,
  FormSelect,
  ProgressHeader,
  VerificationStatusBadge,
} from "@/components/onboarding";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useMockVerification } from "@/hooks/useMockUpload";
import { ROUTES } from "@/lib/constants";
import {
  type CompanyFormValues,
  companySchema,
} from "@/lib/schemas/onboarding";
import {
  annualTurnoverOptions,
  businessTypeOptions,
  industryOptions,
  yearsInBusinessOptions,
} from "@/mock/onboarding/onboardingMock";
import { useOnboardingStore } from "@/store/onboardingStore";

const GST_PATTERN =
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const PAN_PATTERN = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

function GstVerifyField() {
  const form = useFormContext<CompanyFormValues>();
  const gst = useOnboardingStore((s) => s.gst);
  const updateGst = useOnboardingStore((s) => s.updateGst);
  const updateCompany = useOnboardingStore((s) => s.updateCompany);
  const { verifyGst } = useMockVerification();

  const handleVerifyGst = async () => {
    const gstNumber = form.getValues("gstNumber").trim().toUpperCase();
    form.setValue("gstNumber", gstNumber);

    if (!gstNumber) {
      toast.error("Enter a GST number to verify");
      return;
    }

    if (!GST_PATTERN.test(gstNumber)) {
      form.setError("gstNumber", { message: "Enter a valid GST number" });
      toast.error("Enter a valid GST number");
      return;
    }

    await verifyGst(gstNumber);
    updateCompany({ gstNumber });
    toast.success("GST verified against the government registry");
  };

  return (
    <FormField
      control={form.control}
      name="gstNumber"
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            GST Number{" "}
            <span className="font-normal text-muted-foreground">(Optional)</span>
          </FormLabel>
          <div className="flex gap-3">
            <FormControl>
              <Input
                placeholder="e.g., 27AABCPI1234F1Z1"
                {...field}
                onChange={(event) => {
                  const value = event.target.value.toUpperCase();
                  field.onChange(value);
                  updateGst({ gstNumber: value, status: "idle" });
                  updateCompany({ gstNumber: value });
                }}
              />
            </FormControl>
            <Button
              type="button"
              onClick={handleVerifyGst}
              disabled={gst.status === "loading"}
              className="shrink-0"
            >
              {gst.status === "loading" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Verify GST
            </Button>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function PanVerifyField() {
  const form = useFormContext<CompanyFormValues>();
  const pan = useOnboardingStore((s) => s.pan);
  const updatePan = useOnboardingStore((s) => s.updatePan);
  const updateCompany = useOnboardingStore((s) => s.updateCompany);
  const { verifyPan } = useMockVerification();

  const handleVerifyPan = async () => {
    const panNumber = form.getValues("panNumber").trim().toUpperCase();
    form.setValue("panNumber", panNumber);

    if (!panNumber) {
      toast.error("Enter a PAN number to verify");
      return;
    }

    if (!PAN_PATTERN.test(panNumber)) {
      form.setError("panNumber", { message: "Enter a valid PAN number" });
      toast.error("Enter a valid PAN number");
      return;
    }

    await verifyPan(panNumber);
    updateCompany({ panNumber });
    toast.success("PAN verified against the income tax registry");
  };

  return (
    <FormField
      control={form.control}
      name="panNumber"
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            PAN Number{" "}
            <span className="font-normal text-muted-foreground">(Optional)</span>
          </FormLabel>
          <div className="flex gap-3">
            <FormControl>
              <Input
                placeholder="e.g., ABCDE1234F"
                {...field}
                onChange={(event) => {
                  const value = event.target.value.toUpperCase();
                  field.onChange(value);
                  updatePan({ panNumber: value, status: "idle" });
                  updateCompany({ panNumber: value });
                }}
              />
            </FormControl>
            <Button
              type="button"
              onClick={handleVerifyPan}
              disabled={pan.status === "loading"}
              className="shrink-0"
            >
              {pan.status === "loading" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Verify PAN
            </Button>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function GstVerificationResult() {
  const gst = useOnboardingStore((s) => s.gst);

  if (gst.status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-primary/30 bg-primary/5 py-8 md:col-span-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-3 text-sm text-muted-foreground">
          Connecting to GSTN registry for verification...
        </p>
      </div>
    );
  }

  if (gst.status !== "verified") return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="space-y-4 rounded-lg border border-success/30 bg-success/5 p-4 md:col-span-2"
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
  );
}

function PanVerificationResult() {
  const pan = useOnboardingStore((s) => s.pan);

  if (pan.status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-primary/30 bg-primary/5 py-8 md:col-span-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-3 text-sm text-muted-foreground">
          Connecting to income tax registry for PAN verification...
        </p>
      </div>
    );
  }

  if (pan.status !== "verified") return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="space-y-4 rounded-lg border border-success/30 bg-success/5 p-4 md:col-span-2"
    >
      <VerificationStatusBadge status="verified" label="PAN Verified" />
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
          <p className="flex items-center gap-2 font-bold text-success">
            <span className="h-2 w-2 rounded-full bg-success" />
            {pan.panStatus}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function CompanyPage() {
  const router = useRouter();
  const company = useOnboardingStore((s) => s.company);
  const gst = useOnboardingStore((s) => s.gst);
  const isOtpVerified = useOnboardingStore((s) => s.isOtpVerified);
  const updateCompany = useOnboardingStore((s) => s.updateCompany);
  const markStepComplete = useOnboardingStore((s) => s.markStepComplete);
  const setCurrentStep = useOnboardingStore((s) => s.setCurrentStep);
  const mobileNumber = useOnboardingStore((s) => s.mobileNumber);

  useEffect(() => {
    if (!isOtpVerified) {
      router.replace(ROUTES.SELLER_LOGIN);
    }
    setCurrentStep("company");
  }, [isOtpVerified, router, setCurrentStep]);

  const defaultValues: CompanyFormValues = {
    companyName: company.companyName,
    gstNumber: gst.gstNumber || company.gstNumber,
    panNumber: company.panNumber,
    businessType: company.businessType,
    contactName: company.contactName,
    designation: company.designation,
    phone: company.phone || mobileNumber,
    email: company.email,
    industry: company.industry,
    yearsInBusiness: company.yearsInBusiness,
    annualTurnover: company.annualTurnover,
  };

  const onSubmit = (values: CompanyFormValues) => {
    updateCompany(values);
    markStepComplete("company");
    setCurrentStep("documents");
    toast.success("Company information saved");
    router.push(ROUTES.ONBOARDING_DOCUMENTS);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-4xl pb-24"
    >
      <ProgressHeader
        stepId="company"
        title="Seller Onboarding — Company Information"
        description="Step 1 of 4: Provide your official business and contact details for verification."
      />

      <FormWrapper
        schema={companySchema}
        defaultValues={defaultValues}
        onSubmit={onSubmit}
        className="space-y-6"
      >
        <section className="rounded-xl border bg-card p-6 shadow-card">
          <h3 className="mb-4 text-lg font-semibold">Company Details</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <FormInput<CompanyFormValues>
              name="companyName"
              label="Company Name"
              placeholder="Enter registered company name"
            />
            <GstVerifyField />
            <PanVerifyField />
            <FormSelect<CompanyFormValues>
              name="businessType"
              label="Business Type"
              placeholder="Select business type"
              options={businessTypeOptions}
            />
            <GstVerificationResult />
            <PanVerificationResult />
          </div>
        </section>

        <section className="rounded-xl border bg-card p-6 shadow-card">
          <h3 className="mb-4 text-lg font-semibold">Contact Person</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <FormInput<CompanyFormValues>
              name="contactName"
              label="Full Name"
              placeholder="Authorized signatory name"
            />
            <FormInput<CompanyFormValues>
              name="designation"
              label="Designation"
              placeholder="e.g., Director"
            />
            <FormInput<CompanyFormValues>
              name="phone"
              label="Mobile Number"
              placeholder="10-digit mobile number"
            />
            <FormInput<CompanyFormValues>
              name="email"
              label="Email Address"
              type="email"
              placeholder="business@company.com"
            />
          </div>
        </section>

        <section className="rounded-xl border bg-card p-6 shadow-card">
          <h3 className="mb-4 text-lg font-semibold">Business Information</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <FormSelect<CompanyFormValues>
              name="industry"
              label="Industry"
              placeholder="Select industry"
              options={industryOptions}
            />
            <FormSelect<CompanyFormValues>
              name="yearsInBusiness"
              label="Years in Business"
              placeholder="Select years"
              options={yearsInBusinessOptions}
            />
            <FormSelect<CompanyFormValues>
              name="annualTurnover"
              label="Annual Turnover"
              placeholder="Select turnover"
              options={annualTurnoverOptions}
            />
          </div>
        </section>

        <FooterNavigation
          showPrevious={false}
          continueType="submit"
          continueLabel="Continue"
        />
      </FormWrapper>
    </motion.div>
  );
}
