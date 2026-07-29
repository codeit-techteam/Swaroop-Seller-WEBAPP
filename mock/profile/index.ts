import type { SellerProfile } from "@/types/profile";

export const sellerProfileMock: SellerProfile = {
  id: "seller-bpc-001",
  companyName: "Bharat Petro-Chemicals Ltd.",
  logoInitials: "BP",
  kycStatus: "verified",
  sellerRating: 4.8,
  maxRating: 5.0,
  headquarters: "Mumbai, MH",
  partnerSince: "Oct 2018",
  email: "contact@bharatpetrochem.com",
  phone: "+91 98765 43210",
  address:
    "Plot 42, MIDC Industrial Area, Andheri East, Mumbai, Maharashtra 400093",
  website: "https://www.bharatpetrochem.com",
  description:
    "Leading manufacturer and distributor of petrochemical polymers, industrial chemicals, and solvents serving domestic and export markets across India.",
  businessType: "Manufacturer & Distributor",
  yearsInBusiness: 18,
  primaryCategories: ["Polymers", "Industrial Chemicals", "Solvents"],
  warehouses: [
    {
      id: "wh-1",
      label: "Bhiwandi, Maharashtra",
      isPrimary: true,
    },
    {
      id: "wh-2",
      label: "Dahej, Gujarat",
      isPrimary: false,
    },
  ],
  logisticsPartners: [
    {
      id: "lp-1",
      name: "FedEx Logistics",
      initials: "FX",
      color: "#4D148C",
    },
    {
      id: "lp-2",
      name: "BlueDart Express",
      initials: "BD",
      color: "#005CB9",
    },
  ],
  businessIdentity: {
    gstin: "27AAACB1234F1Z5",
    pan: "AAACB1234F",
    cin: "U12345MH2018PLC123456",
  },
  bankInformation: {
    beneficiaryName: "Bharat Petro-Chemicals Limited",
    accountNumber: "5020001234582",
    maskedAccountNumber: "**********4582",
    ifscCode: "HDFC0001234",
    branch: "Bandra Kurla Complex, Mumbai",
    verificationStatus: "verified",
  },
  documents: [
    {
      id: "doc-gst",
      type: "gst",
      title: "GST Certificate",
      fileName: "GST_BPC_2023.pdf",
      status: "active",
      expiryDate: "2024-12-31",
    },
    {
      id: "doc-msme",
      type: "msme",
      title: "MSME Certificate",
      fileName: "MSME_UDYAM_24.pdf",
      status: "expiring_soon",
      expiryDate: "2023-10-15",
      daysUntilExpiry: 12,
    },
    {
      id: "doc-coa",
      type: "coa",
      title: "COA Standards",
      fileName: "COA_POLY_CERT.pdf",
      status: "active",
      expiryDate: "2025-06-01",
    },
  ],
  lastUpdatedAt: "2023-09-24T14:32:00+05:30",
  lastUpdatedBy: "admin_user_01",
};

export function getExpiringDocument(profile: SellerProfile) {
  return (
    profile.documents.find((doc) => doc.status === "expiring_soon") ?? null
  );
}
