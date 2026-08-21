export type OnboardingStepId =
  | "company"
  | "documents"
  | "gst-pan"
  | "bank"
  | "location"
  | "review"
  | "submitted";

export type DocumentStatus =
  | "empty"
  | "uploading"
  | "uploaded"
  | "verified"
  | "pending_review"
  | "rejected";

export type VerificationStatus =
  "idle" | "loading" | "verified" | "pending" | "rejected";

export interface OnboardingStep {
  id: OnboardingStepId;
  label: string;
  route: string;
  step: number;
}

export interface CompanyFormData {
  companyName: string;
  gstNumber: string;
  panNumber: string;
  businessType: string;
  contactName: string;
  designation: string;
  phone: string;
  email: string;
  industry: string;
  yearsInBusiness: string;
  annualTurnover: string;
}

export interface DocumentItem {
  id: string;
  name: string;
  description: string;
  required: boolean;
  status: DocumentStatus;
  fileName?: string;
  fileSize?: number;
  uploadProgress?: number;
  uploadedAt?: string;
  errorMessage?: string;
  previewUrl?: string;
}

export interface GstVerificationData {
  gstNumber: string;
  status: VerificationStatus;
  companyName?: string;
  gstStatus?: string;
  registeredAddress?: string;
  gstType?: string;
}

export interface PanVerificationData {
  panNumber: string;
  status: VerificationStatus;
  holderName?: string;
  panStatus?: string;
}

export interface BankFormData {
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  confirmAccountNumber: string;
  ifscCode: string;
  branchName: string;
  cancelledChequeFileName?: string;
  cancelledChequePreview?: string;
  cancelledChequeSize?: number;
  isVerified: boolean;
  manualReviewRequired: boolean;
  manualReviewMessage?: string;
}

export interface LocationFormData {
  warehouseAddress: string;
  city: string;
  state: string;
  pincode: string;
  registeredAddress: string;
  warehousePhotoFileName?: string;
  warehousePhotoPreview?: string;
  entrancePhotoFileName?: string;
  entrancePhotoPreview?: string;
  latitude?: number;
  longitude?: number;
  locationVerified: boolean;
  locationLabel?: string;
}

export interface ReviewData {
  termsAccepted: boolean;
}

export interface OnboardingState {
  mobileNumber: string;
  countryCode: string;
  isOtpVerified: boolean;
  currentStep: OnboardingStepId;
  completedSteps: OnboardingStepId[];
  lastSavedAt: string | null;
  isSaving: boolean;
  company: CompanyFormData;
  documents: DocumentItem[];
  gst: GstVerificationData;
  pan: PanVerificationData;
  bank: BankFormData;
  location: LocationFormData;
  review: ReviewData;
  isSubmitted: boolean;
  submittedAt: string | null;
}

export interface OnboardingActions {
  setMobileNumber: (mobile: string, countryCode?: string) => void;
  setOtpVerified: (verified: boolean) => void;
  setCurrentStep: (step: OnboardingStepId) => void;
  markStepComplete: (step: OnboardingStepId) => void;
  triggerAutoSave: () => void;
  updateCompany: (data: Partial<CompanyFormData>) => void;
  updateDocument: (id: string, data: Partial<DocumentItem>) => void;
  updateGst: (data: Partial<GstVerificationData>) => void;
  updatePan: (data: Partial<PanVerificationData>) => void;
  updateBank: (data: Partial<BankFormData>) => void;
  updateLocation: (data: Partial<LocationFormData>) => void;
  updateReview: (data: Partial<ReviewData>) => void;
  submitOnboarding: () => void;
  resetOnboarding: () => void;
  clearOnboardingProgress: () => void;
  getProgress: () => number;
  isStepAccessible: (step: OnboardingStepId) => boolean;
}

export type OnboardingStore = OnboardingState & OnboardingActions;
