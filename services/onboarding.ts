import { isAxiosError } from "axios";

import { apiClient } from "@/services/apiClient";
import { onboardingApiError } from "@/services/onboarding-documents";
import type { OnboardingState } from "@/types/onboarding";

type Envelope<T> = {
  success: boolean;
  data: T;
  message?: string | string[];
};

export type SellerOnboardingRecord = {
  id: string;
  status: string;
  currentStep?: string | null;
  completedSteps?: string[] | null;
  submittedAt?: string | null;
  locationData?: Record<string, unknown> | null;
  addressData?: Record<string, unknown> | null;
};

function documentIdMap(state: OnboardingState) {
  const documents: Record<string, string> = {};
  for (const doc of state.documents) {
    if (doc.storageDocumentId) documents[doc.id] = doc.storageDocumentId;
  }
  return documents;
}

/** Map local seller onboarding form state into the backend draft payload. */
export function buildOnboardingDraftPayload(
  state: OnboardingState,
  currentStep?: string,
) {
  const companyName = state.company.companyName || state.company.legalName;
  const gstin = state.company.gstNumber || state.gst.gstNumber;
  const pan = state.company.panNumber || state.pan.panNumber || state.gst.pan;

  return {
    companyName: companyName || undefined,
    email: state.company.email || undefined,
    phone: state.company.phone || undefined,
    currentStep: currentStep ?? state.currentStep,
    completedSteps: state.completedSteps,
    companyData: {
      name: companyName,
      legalName: state.company.legalName || companyName,
      businessType: state.company.businessType,
      contactName: state.company.contactName,
      designation: state.company.designation,
      phone: state.company.phone,
      email: state.company.email,
      industry: state.company.industry,
      yearsInBusiness: state.company.yearsInBusiness,
      annualTurnover: state.company.annualTurnover,
      registeredAddress:
        state.location.registeredAddress || state.company.registeredAddress,
    },
    businessData: { ...state.business },
    gstData: {
      gstin,
      status: state.gst.status,
      companyName: state.gst.companyName,
      gstStatus: state.gst.gstStatus,
      state: state.gst.state,
      stateCode: state.gst.stateCode,
      pan: state.gst.pan || pan,
    },
    panData: {
      pan,
      status: state.pan.status,
      holderName: state.pan.holderName,
      panStatus: state.pan.panStatus,
    },
    bankData: {
      accountHolder: state.bank.accountHolderName,
      bankName: state.bank.bankName,
      accountNumber: state.bank.accountNumber,
      ifsc: state.bank.ifscCode,
      branch: state.bank.branchName,
    },
    addressData: {
      line1:
        state.location.registeredAddress || state.location.warehouseAddress,
      city: state.location.city,
      state: state.location.state,
      postalCode: state.location.pincode,
      country: "IN",
    },
    locationData: {
      warehouseAddress: state.location.warehouseAddress,
      registeredAddress: state.location.registeredAddress,
      city: state.location.city,
      state: state.location.state,
      pincode: state.location.pincode,
      additionalAddresses: state.location.additionalAddresses,
      latitude: state.location.latitude,
      longitude: state.location.longitude,
    },
    metadata: {
      documents: documentIdMap(state),
      review: state.review,
    },
  };
}

function isNotFound(error: unknown) {
  return isAxiosError(error) && error.response?.status === 404;
}

export async function fetchSellerOnboarding(): Promise<SellerOnboardingRecord> {
  const response = await apiClient.get<Envelope<SellerOnboardingRecord>>(
    "/seller/onboarding",
    { timeout: 10_000 },
  );
  return response.data.data;
}

export async function ensureSellerOnboardingDraft(
  state: OnboardingState,
): Promise<SellerOnboardingRecord> {
  const payload = buildOnboardingDraftPayload(state, state.currentStep);
  try {
    await fetchSellerOnboarding();
    const updated = await apiClient.patch<Envelope<SellerOnboardingRecord>>(
      "/seller/onboarding",
      payload,
    );
    return updated.data.data;
  } catch (error) {
    // Missing draft → create. Locked/validation errors bubble up via create or throw.
    if (isAxiosError(error) && error.response?.status === 401) throw error;
    if (isAxiosError(error) && error.response?.status === 403) throw error;
    const created = await apiClient.post<Envelope<SellerOnboardingRecord>>(
      "/seller/onboarding",
      payload,
    );
    return created.data.data;
  }
}

export async function saveSellerOnboardingDraft(
  state: OnboardingState,
  currentStep?: string,
): Promise<SellerOnboardingRecord> {
  const payload = buildOnboardingDraftPayload(state, currentStep);
  try {
    const updated = await apiClient.patch<Envelope<SellerOnboardingRecord>>(
      "/seller/onboarding",
      payload,
    );
    return updated.data.data;
  } catch (error) {
    if (!isNotFound(error)) throw error;
    const created = await apiClient.post<Envelope<SellerOnboardingRecord>>(
      "/seller/onboarding",
      payload,
    );
    return created.data.data;
  }
}

export async function submitSellerOnboarding(
  state: OnboardingState,
): Promise<SellerOnboardingRecord> {
  await saveSellerOnboardingDraft(state, "review");
  const response = await apiClient.post<Envelope<SellerOnboardingRecord>>(
    "/seller/onboarding/submit",
  );
  return response.data.data;
}

export { onboardingApiError };
