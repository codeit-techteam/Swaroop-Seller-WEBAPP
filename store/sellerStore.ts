import { create } from "zustand";
import { persist } from "zustand/middleware";

import { sellerActivityMock } from "@/lib/mock/notifications";
import {
  fetchSellerAccountProfile,
  type SellerAccountManager,
  type SellerAccountSummary,
} from "@/services/seller-profile";
import type {
  SellerActivity,
  SellerProfile,
  SellerType,
  VerificationStatus,
} from "@/types/seller";

interface SellerState {
  seller: SellerProfile;
  activity: SellerActivity[];
  /** Seller identity from GET /seller/profile — same source as the Seller app. */
  account: SellerAccountSummary | null;
  accountManagers: SellerAccountManager[];
  accountLoaded: boolean;
  updateSeller: (data: Partial<SellerProfile>) => void;
  addActivity: (activity: Omit<SellerActivity, "id" | "at">) => void;
  syncFromApi: () => Promise<SellerAccountSummary | null>;
  resetSeller: () => void;
}

const SELLER_TYPES: SellerType[] = [
  "manufacturer",
  "distributor",
  "trader",
  "stockist",
];

function toVerificationStatus(
  summary: SellerAccountSummary,
): VerificationStatus {
  if (summary.verified) return "verified";
  if (summary.status === "DRAFT") return "incomplete";
  return "verification_pending";
}

function mergeSummary(
  seller: SellerProfile,
  summary: SellerAccountSummary,
): SellerProfile {
  const sellerType = summary.sellerType?.toLowerCase() as
    SellerType | undefined;
  const address = summary.address;
  const registeredAddress =
    summary.registeredAddress ??
    (address
      ? [address.line1, address.city, address.state, address.postalCode]
          .filter(Boolean)
          .join(", ")
      : seller.registeredAddress);

  return {
    ...seller,
    id: summary.sellerProfileId,
    companyName: summary.companyName,
    legalName: summary.legalName,
    businessType: summary.businessType ?? "",
    sellerType:
      sellerType && SELLER_TYPES.includes(sellerType)
        ? sellerType
        : seller.sellerType,
    gst: summary.gstin ?? "",
    pan: summary.pan ?? "",
    contactPerson: summary.contactName,
    designation: summary.designation ?? "",
    mobile: summary.phone ?? "",
    email: summary.email ?? "",
    registeredAddress,
    yearsInBusiness: summary.yearsInBusiness ?? "",
    paymentTerms: summary.paymentTerms ?? "",
    verificationStatus: toVerificationStatus(summary),
    bankAccounts: summary.bank
      ? [
          {
            id: "primary",
            bankName: summary.bank.bankName,
            accountHolder: summary.bank.accountHolder,
            accountNumber: summary.bank.accountNumberMasked,
            ifsc: summary.bank.ifsc,
            branch: summary.bank.branch ?? "",
            poEmail: summary.email ?? "",
            isPrimary: true,
          },
        ]
      : [],
  };
}

let inflight: Promise<SellerAccountSummary | null> | null = null;

if (typeof window !== "undefined") {
  window.localStorage.removeItem("petrotrade-seller-profile");
}

/** Filled from GET /seller/profile; no business is shown until the backend answers. */
const EMPTY_SELLER_PROFILE: SellerProfile = {
  id: "",
  companyName: "",
  legalName: "",
  businessType: "",
  sellerType: "trader",
  gst: "",
  pan: "",
  contactPerson: "",
  designation: "",
  mobile: "",
  email: "",
  registeredAddress: "",
  yearsInBusiness: "",
  primaryCategories: [],
  operatingCapacityMt: 0,
  monthlyTradingCapacityMt: 0,
  paymentTerms: "",
  offerValidityHours: 24,
  volumeSoldLastMonthMt: 0,
  preferredContactMethod: "Mobile",
  verificationStatus: "incomplete",
  locations: [],
  bankAccounts: [],
  accountManager: { id: "", name: "", mobile: "", email: "", region: "" },
};

export const useSellerStore = create<SellerState>()(
  persist(
    (set, get) => ({
      seller: EMPTY_SELLER_PROFILE,
      activity: sellerActivityMock,
      account: null,
      accountManagers: [],
      accountLoaded: false,
      updateSeller: (data) =>
        set((state) => ({
          seller: { ...state.seller, ...data },
        })),
      addActivity: (activity) =>
        set((state) => ({
          activity: [
            {
              ...activity,
              id: `act-${Date.now()}`,
              at: new Date().toISOString(),
            },
            ...state.activity,
          ],
        })),
      syncFromApi: () => {
        if (inflight) return inflight;
        inflight = (async () => {
          try {
            const { summary, accountManagers } =
              await fetchSellerAccountProfile();
            set((state) => ({
              account: summary,
              accountManagers,
              accountLoaded: true,
              seller: mergeSummary(state.seller, summary),
            }));
            return summary;
          } catch {
            set({ accountLoaded: true });
            return get().account;
          } finally {
            inflight = null;
          }
        })();
        return inflight;
      },
      resetSeller: () =>
        set({
          seller: EMPTY_SELLER_PROFILE,
          account: null,
          accountManagers: [],
          accountLoaded: false,
        }),
    }),
    {
      // v2: v1 caches started from a demo company and must not be restored.
      name: "petrotrade-seller-profile.v2",
      partialize: (state) => ({ seller: state.seller, account: state.account }),
    },
  ),
);
