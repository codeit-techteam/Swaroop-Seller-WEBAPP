import type { DocumentItem } from "@/types/onboarding";

export const MOCK_OTP = "123456";

export const businessTypeOptions = [
  { label: "Private Limited", value: "private_limited" },
  { label: "Public Limited", value: "public_limited" },
  { label: "Partnership", value: "partnership" },
  { label: "Sole Proprietorship", value: "sole_proprietorship" },
  { label: "LLP", value: "llp" },
];

export const industryOptions = [
  { label: "Petrochemical Refineries & Logistics", value: "petrochemical" },
  { label: "Oil & Gas Trading", value: "oil_gas" },
  { label: "Industrial Chemicals", value: "industrial_chemicals" },
  { label: "Energy & Power", value: "energy_power" },
  { label: "Manufacturing", value: "manufacturing" },
];

export const yearsInBusinessOptions = [
  { label: "Less than 1 year", value: "0-1" },
  { label: "1-3 years", value: "1-3" },
  { label: "3-5 years", value: "3-5" },
  { label: "5-10 years", value: "5-10" },
  { label: "10+ years", value: "10+" },
];

export const annualTurnoverOptions = [
  { label: "Below ₹1 Crore", value: "below_1cr" },
  { label: "₹1 - ₹5 Crore", value: "1-5cr" },
  { label: "₹5 - ₹25 Crore", value: "5-25cr" },
  { label: "₹25 - ₹100 Crore", value: "25-100cr" },
  { label: "Above ₹100 Crore", value: "above_100cr" },
];

export const indianStates = [
  { label: "Maharashtra", value: "maharashtra" },
  { label: "Gujarat", value: "gujarat" },
  { label: "Rajasthan", value: "rajasthan" },
  { label: "Karnataka", value: "karnataka" },
  { label: "Tamil Nadu", value: "tamil_nadu" },
  { label: "Delhi", value: "delhi" },
  { label: "West Bengal", value: "west_bengal" },
  { label: "Uttar Pradesh", value: "uttar_pradesh" },
];

export const defaultDocuments: DocumentItem[] = [
  {
    id: "gst_certificate",
    name: "GST Certificate",
    description:
      "Official GST registration certificate issued by the government.",
    required: true,
    status: "empty",
  },
  {
    id: "pan_card",
    name: "PAN Card",
    description: "Permanent Account Number card of the business entity.",
    required: false,
    status: "empty",
  },
  {
    id: "aadhaar_card",
    name: "Aadhaar Card",
    description: "Aadhaar card of the authorized signatory.",
    required: false,
    status: "empty",
  },
  {
    id: "cancelled_cheque",
    name: "Cancelled Cheque",
    description: "Cancelled cheque for bank account verification.",
    required: true,
    status: "empty",
  },
  {
    id: "registration_certificate",
    name: "Registration Certificate",
    description: "Certificate of incorporation or business registration.",
    required: true,
    status: "empty",
  },
  {
    id: "address_proof",
    name: "Address Proof",
    description: "Utility bill or rental agreement as address proof.",
    required: false,
    status: "empty",
  },
];

export const mockGstVerification = {
  companyName: "PetroCorp International Private Limited",
  gstStatus: "ACTIVE",
  registeredAddress:
    "Floor 12, Energy Plaza, BKC G Block, Mumbai, Maharashtra 400051",
  gstType: "Regular",
};

export const mockPanVerification = {
  holderName: "PetroCorp International Private Limited",
  panStatus: "VALID",
};

export const mockIfscLookup: Record<string, string> = {
  HDFC0001234: "HDFC Bank - BKC Branch, Mumbai",
  ICIC0001234: "ICICI Bank - Andheri East, Mumbai",
  SBIN0001234: "State Bank of India - Fort Branch, Mumbai",
  AXIS0001234: "Axis Bank - Bandra West, Mumbai",
};

export const mockLocationData = {
  latitude: 19.076,
  longitude: 72.8777,
  locationLabel: "VERIFIED LOCATION: Primary Warehouse Terminal A",
};

export const loginFeatures = [
  {
    title: "Sell Industrial Materials",
    description:
      "List and sell petrochemical products to verified buyers globally.",
  },
  {
    title: "Manage Inventory",
    description:
      "Track stock levels, batches, and warehouse allocations in real time.",
  },
  {
    title: "Receive Orders",
    description: "Accept and process B2B orders with automated workflows.",
  },
  {
    title: "Track Payments",
    description:
      "Monitor settlements, invoices, and payment status seamlessly.",
  },
];

export const verificationStatusCards = [
  {
    status: "verified" as const,
    title: "VERIFIED",
    description:
      "Identifier validated against central registry. High trust score assigned.",
  },
  {
    status: "pending" as const,
    title: "PENDING",
    description:
      "Manual review required for address verification mismatch. ETA: 4 hours.",
  },
  {
    status: "rejected" as const,
    title: "REJECTED",
    description:
      "Document expired or mismatch in entity legal name. Re-upload necessary.",
  },
];

export const reviewChecklist = [
  "Company Details",
  "Document Uploads",
  "Bank Information",
];

export const submissionSummary = {
  businessName: "PetroLink Industrial Solutions Ltd.",
  documentsCount: 6,
  bankName: "HDFC Bank",
  location: "Mumbai, Maharashtra",
  estimatedReviewTime: "24 - 48 business hours",
};
