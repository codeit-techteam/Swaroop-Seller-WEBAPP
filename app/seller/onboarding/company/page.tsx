"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

import { FormInput } from "@/components/forms/form-fields";
import { FormWrapper } from "@/components/forms/form-wrapper";
import {
  FooterNavigation,
  FormSelect,
  ProgressHeader,
  VerificationStatusBadge,
} from "@/components/onboarding";
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

export default function CompanyPage() {
  const router = useRouter();
  const company = useOnboardingStore((s) => s.company);
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
    gstNumber: company.gstNumber,
    panNumber: company.panNumber,
    businessType: company.businessType || "private_limited",
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
        description="Step 1 of 5: Provide your official business and contact details for verification."
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
            <div className="space-y-2">
              <FormInput<CompanyFormValues>
                name="gstNumber"
                label="GST Number"
                placeholder="e.g., 27AABCPI1234F1Z1"
              />
              {company.gstNumber ? (
                <VerificationStatusBadge status="verified" />
              ) : null}
            </div>
            <FormInput<CompanyFormValues>
              name="panNumber"
              label="PAN Number"
              placeholder="e.g., ABCDE1234F"
            />
            <FormSelect<CompanyFormValues>
              name="businessType"
              label="Business Type"
              options={businessTypeOptions}
            />
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
              options={industryOptions}
            />
            <FormSelect<CompanyFormValues>
              name="yearsInBusiness"
              label="Years in Business"
              options={yearsInBusinessOptions}
            />
            <FormSelect<CompanyFormValues>
              name="annualTurnover"
              label="Annual Turnover"
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
