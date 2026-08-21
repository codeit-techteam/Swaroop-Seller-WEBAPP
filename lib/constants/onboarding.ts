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
    route: "/seller/onboarding/company",
    step: 1,
  },
  {
    id: "documents",
    label: "Document Uploads",
    route: "/seller/onboarding/documents",
    step: 2,
  },
  {
    id: "bank",
    label: "Bank Information",
    route: "/seller/onboarding/bank",
    step: 3,
  },
  {
    id: "review",
    label: "Final Review",
    route: "/seller/onboarding/review",
    step: 4,
  },
];

export const STEP_PROGRESS: Record<OnboardingStepId, number> = {
  company: 25,
  documents: 50,
  "gst-pan": 50,
  bank: 75,
  location: 75,
  review: 90,
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
    locationVerified: false,
  },
  review: {
    termsAccepted: false,
  },
  isSubmitted: false,
  submittedAt: null,
};
