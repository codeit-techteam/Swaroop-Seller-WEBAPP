import { defaultDocuments } from "@/mock/onboarding/onboardingMock";
import type {
  OnboardingState,
  OnboardingStep,
  OnboardingStepId,
} from "@/types/onboarding";

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "company",
    label: "Company Details",
    route: "/onboarding/company",
    step: 1,
  },
  {
    id: "business",
    label: "Business Details",
    route: "/onboarding/business",
    step: 2,
  },
  {
    id: "locations",
    label: "Locations",
    route: "/onboarding/locations",
    step: 3,
  },
  {
    id: "bank",
    label: "Bank Details",
    route: "/onboarding/bank",
    step: 4,
  },
  {
    id: "documents",
    label: "Documents",
    route: "/onboarding/documents",
    step: 5,
  },
  {
    id: "review",
    label: "Review & Submit",
    route: "/onboarding/review",
    step: 6,
  },
];

export const STEP_PROGRESS: Record<OnboardingStepId, number> = {
  company: 16,
  business: 32,
  locations: 48,
  location: 48,
  bank: 64,
  documents: 80,
  "gst-pan": 16,
  review: 92,
  submitted: 100,
};

export const initialOnboardingState: OnboardingState = {
  mobileNumber: "",
  countryCode: "+91",
  isOtpVerified: false,
  currentStep: "company",
  completedSteps: [],
  lastSavedAt: null,
  isSaving: false,
  company: {
    companyName: "",
    legalName: "",
    gstNumber: "",
    panNumber: "",
    businessType: "",
    contactName: "",
    designation: "",
    phone: "",
    email: "",
    industry: "",
    yearsInBusiness: "",
    annualTurnover: "",
    registeredAddress: "",
  },
  business: {
    sellerType: "",
    yearsInBusiness: "",
    primaryCategories: "",
    operatingCapacity: "",
    monthlyTradingCapacity: "",
    paymentTerms: "",
    preferredContactMethod: "",
  },
  documents: defaultDocuments,
  gst: {
    gstNumber: "",
    status: "idle",
  },
  pan: {
    panNumber: "",
    status: "idle",
  },
  bank: {
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    confirmAccountNumber: "",
    ifscCode: "",
    branchName: "",
    isVerified: false,
    manualReviewRequired: false,
  },
  location: {
    warehouseAddress: "",
    city: "",
    state: "",
    pincode: "",
    registeredAddress: "",
    additionalAddresses: [],
    locationVerified: false,
  },
  review: {
    termsAccepted: false,
  },
  isSubmitted: false,
  submittedAt: null,
};
