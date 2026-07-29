import type {
  ComplianceAdminRemark,
  ComplianceDocument,
  ComplianceDocumentStatus,
  ComplianceDocumentType,
  ComplianceSummary,
  ComplianceTimelineStep,
  PreviewMimeType,
} from "@/types/compliance";
import { COMPLIANCE_DOCUMENT_TYPES } from "@/types/compliance";

const REFERENCE_DATE = new Date("2024-10-15T10:00:00.000Z");

const VERIFIERS = [
  "Admin_042",
  "Admin_011",
  "Admin_028",
  "Admin_056",
  "Compliance Desk",
  "Admin_019",
  null,
];

const UPLOADERS = [
  "Compliance Officer",
  "Plant Admin",
  "Finance Team",
  "Warehouse Manager",
  "Company Secretary",
];

const REMARKS: ComplianceAdminRemark[] = [
  {
    type: "renewal_required",
    title: "Renewal Required",
    message:
      "Renewal required before Oct 30 to maintain Tier 1 status. Update current floor plan in the new submission.",
  },
  {
    type: "missing_document",
    title: "Missing Document",
    message:
      "Annexure B (authorized signatory list) is missing. Please upload the complete set before resubmission.",
  },
  {
    type: "rejected_reason",
    title: "Rejected",
    message:
      "Document rejected due to illegible stamp and mismatched company name. Upload a clear scanned copy.",
  },
  {
    type: "compliance_notice",
    title: "Compliance Notice",
    message:
      "Keep this certificate current. Expired operational licenses may suspend marketplace trading eligibility.",
  },
  {
    type: "renewal_required",
    title: "Renew Before Expiry",
    message:
      "Certificate expires within the alert window. Submit renewal pack to avoid service interruption.",
  },
];

const PREVIEW_IMAGES = [
  "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=800&q=80",
];

/** Status mix for documents 6–40 (indices 5–39). Hero rows 1–5 use fixed Figma data. */
const STATUS_DISTRIBUTION: ComplianceDocumentStatus[] = [
  "verified",
  "verified",
  "verified",
  "verified",
  "verified",
  "verified",
  "verified",
  "verified",
  "verified",
  "verified",
  "expiring_soon",
  "pending_review",
  "uploaded",
  "verified",
  "verified",
  "rejected",
  "verified",
  "verified",
  "verified",
  "verified",
  "verified",
  "verified",
  "verified",
  "verified",
  "verified",
  "verified",
  "verified",
  "verified",
  "verified",
  "verified",
  "verified",
  "verified",
  "verified",
  "verified",
  "verified",
];

function pad(n: number, size = 2) {
  return String(n).padStart(size, "0");
}

function isoDate(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month - 1, day, 10, 0, 0)).toISOString();
}

function daysFromRef(days: number) {
  const d = new Date(REFERENCE_DATE);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString();
}

function daysUntil(iso: string | null) {
  if (!iso) return null;
  const target = new Date(iso).getTime();
  return Math.ceil((target - REFERENCE_DATE.getTime()) / (1000 * 60 * 60 * 24));
}

function buildTimeline(
  status: ComplianceDocumentStatus,
  uploadedAt: string,
  expiryDate: string | null,
): ComplianceTimelineStep[] {
  const base: ComplianceTimelineStep[] = [
    {
      id: "uploaded",
      type: "uploaded",
      title: "Document Uploaded",
      timestamp: uploadedAt,
      status: "completed",
    },
  ];

  if (status === "uploaded") {
    return [
      ...base,
      {
        id: "pending",
        type: "verification_started",
        title: "Verification Started",
        description: "AWAITING ASSIGNMENT",
        status: "pending",
      },
    ];
  }

  if (status === "pending_review") {
    return [
      ...base,
      {
        id: "started",
        type: "verification_started",
        title: "Verification Started",
        timestamp: daysFromRef(-20),
        status: "completed",
      },
      {
        id: "review",
        type: "under_review",
        title: "Under Review",
        description: "PENDING ADMIN REVIEW",
        status: "current",
      },
    ];
  }

  if (status === "rejected") {
    return [
      ...base,
      {
        id: "started",
        type: "verification_started",
        title: "Verification Started",
        timestamp: daysFromRef(-18),
        status: "completed",
      },
      {
        id: "review",
        type: "under_review",
        title: "Under Review",
        timestamp: daysFromRef(-12),
        status: "completed",
      },
      {
        id: "rejected",
        type: "rejected",
        title: "Rejected",
        description: "RESUBMISSION REQUIRED",
        timestamp: daysFromRef(-5),
        status: "danger",
      },
    ];
  }

  if (status === "expiring_soon") {
    return [
      ...base,
      {
        id: "review",
        type: "under_review",
        title: "Under Review",
        timestamp: daysFromRef(-40),
        status: "completed",
      },
      {
        id: "approved",
        type: "approved",
        title: "Verification Approved",
        timestamp: daysFromRef(-35),
        status: "completed",
      },
      {
        id: "renewal",
        type: "renewal_required",
        title: "Renewal Required",
        description: expiryDate
          ? `PENDING ${new Date(expiryDate).toLocaleDateString("en-US", { month: "short", day: "2-digit" }).toUpperCase()} EXPIRY`
          : "RENEWAL PENDING",
        status: "warning",
      },
    ];
  }

  if (status === "expired") {
    return [
      ...base,
      {
        id: "review",
        type: "under_review",
        title: "Under Review",
        timestamp: daysFromRef(-120),
        status: "completed",
      },
      {
        id: "approved",
        type: "approved",
        title: "Verification Approved",
        timestamp: daysFromRef(-100),
        status: "completed",
      },
      {
        id: "renewal",
        type: "renewal_required",
        title: "Renewal Required",
        description: "DOCUMENT EXPIRED",
        status: "danger",
      },
    ];
  }

  return [
    ...base,
    {
      id: "started",
      type: "verification_started",
      title: "Verification Started",
      timestamp: daysFromRef(-45),
      status: "completed",
    },
    {
      id: "review",
      type: "under_review",
      title: "Under Review",
      timestamp: daysFromRef(-40),
      status: "completed",
    },
    {
      id: "approved",
      type: "approved",
      title: "Verification Approved",
      timestamp: daysFromRef(-35),
      status: "completed",
    },
  ];
}

function remarkFor(
  status: ComplianceDocumentStatus,
  index: number,
): ComplianceAdminRemark | null {
  if (status === "verified" && index % 4 !== 0) return null;
  if (status === "uploaded") return null;
  if (status === "rejected") return REMARKS[2]!;
  if (status === "expired") return REMARKS[3]!;
  if (status === "expiring_soon") return REMARKS[0]!;
  if (status === "pending_review") return REMARKS[1]!;
  return pick(REMARKS, index);
}

function pick<T>(items: readonly T[], index: number): T {
  return items[index % items.length] as T;
}

function mimeFor(index: number): PreviewMimeType {
  return pick(
    [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ] as const,
    index,
  );
}

function numberPrefix(type: ComplianceDocumentType) {
  switch (type) {
    case "GST Certificate":
      return "GST";
    case "Factory License":
      return "OPER";
    case "MSME Certificate":
      return "MSME";
    case "ISO 9001:2015":
      return "ISO";
    case "Pollution Control Certificate":
      return "PCB";
    case "Trade License":
      return "TRD";
    case "Import Export Code (IEC)":
      return "IEC";
    case "Company Registration":
      return "CIN";
    case "PAN":
      return "PAN";
    case "COA Approval":
      return "COA";
    case "Warehouse License":
      return "WH";
  }
}

function expiryFor(status: ComplianceDocumentStatus, index: number) {
  if (status === "pending_review" && index % 3 === 0) return null;
  if (status === "uploaded") return null;
  if (status === "expired") return daysFromRef(-(10 + (index % 40)));
  if (status === "expiring_soon") {
    return daysFromRef(pick([5, 7, 12, 18, 25, 28], index));
  }
  if (status === "rejected") return daysFromRef(40 + (index % 60));
  return daysFromRef(
    pick([45, 90, 120, 180, 240, 365, 20, 55 + (index % 100)], index),
  );
}

/** First five documents mirror the Figma table exactly. */
function buildHeroDocument(index: number): ComplianceDocument {
  const heroes: Array<
    Partial<ComplianceDocument> & { status: ComplianceDocumentStatus }
  > = [
    {
      name: "GST Certificate",
      documentNumber: "#PT-GST-99000",
      status: "verified",
      expiryDate: isoDate(2025, 2, 14),
      verifiedBy: "Admin_042",
      lastUpdated: daysFromRef(-1),
      uploadedAt: daysFromRef(-90),
      issueDate: isoDate(2020, 2, 14),
    },
    {
      name: "Factory License",
      documentNumber: "#PT-OPER-99211",
      status: "expiring_soon",
      expiryDate: isoDate(2024, 10, 30),
      verifiedBy: "Compliance Desk",
      lastUpdated: isoDate(2023, 10, 4),
      uploadedAt: isoDate(2023, 9, 28),
      issueDate: isoDate(2019, 10, 30),
      adminRemark: REMARKS[0]!,
    },
    {
      name: "MSME Certificate",
      documentNumber: "#PT-MSME-99002",
      status: "pending_review",
      expiryDate: null,
      verifiedBy: null,
      lastUpdated: isoDate(2023, 9, 28),
      uploadedAt: isoDate(2023, 9, 28),
      issueDate: null,
      adminRemark: REMARKS[1]!,
    },
    {
      name: "ISO 9001:2015",
      documentNumber: "#PT-ISO-99003",
      status: "verified",
      expiryDate: isoDate(2025, 8, 1),
      verifiedBy: "Admin_011",
      lastUpdated: isoDate(2024, 7, 15),
      uploadedAt: isoDate(2023, 6, 1),
      issueDate: isoDate(2022, 8, 1),
    },
    {
      name: "Pollution Control Certificate",
      documentNumber: "#PT-PCB-99004",
      status: "expired",
      expiryDate: isoDate(2023, 9, 10),
      verifiedBy: "Compliance Desk",
      lastUpdated: isoDate(2023, 3, 20),
      uploadedAt: isoDate(2022, 9, 10),
      issueDate: isoDate(2018, 9, 10),
      adminRemark: REMARKS[3]!,
    },
  ];

  const hero = heroes[index]!;
  const type = hero.name as ComplianceDocumentType;
  const mime = mimeFor(index);
  const ext =
    mime === "application/pdf"
      ? "pdf"
      : mime === "image/png"
        ? "png"
        : mime === "image/jpeg"
          ? "jpg"
          : "docx";
  const id = `DOC-${pad(index + 1, 3)}`;

  return {
    id,
    documentId: id,
    name: type,
    documentNumber: hero.documentNumber!,
    status: hero.status,
    issueDate: hero.issueDate ?? null,
    expiryDate: hero.expiryDate ?? null,
    verifiedBy: hero.verifiedBy ?? null,
    uploadedBy: pick(UPLOADERS, index),
    uploadedAt: hero.uploadedAt!,
    lastUpdated: hero.lastUpdated!,
    previewUrl: pick(PREVIEW_IMAGES, index),
    previewMimeType: mime,
    fileName: `${type.replace(/[^a-zA-Z0-9]+/g, "_").toLowerCase()}_v1.${ext}`,
    fileSizeLabel: `${(1.2 + index * 0.3).toFixed(1)} MB`,
    timeline: buildTimeline(
      hero.status,
      hero.uploadedAt!,
      hero.expiryDate ?? null,
    ),
    adminRemark: hero.adminRemark ?? remarkFor(hero.status, index),
    daysUntilExpiry: daysUntil(hero.expiryDate ?? null),
    version: 1,
  };
}

function buildDocument(index: number): ComplianceDocument {
  if (index < 5) return buildHeroDocument(index);

  const type = pick(COMPLIANCE_DOCUMENT_TYPES, index);
  const status = STATUS_DISTRIBUTION[index] ?? "verified";
  const uploadedAt = daysFromRef(-(60 + (index % 90)));
  const expiryDate = expiryFor(status, index);
  const issueDate =
    status === "uploaded" ? null : daysFromRef(-(200 + (index % 400)));
  const mime = mimeFor(index);
  const ext =
    mime === "application/pdf"
      ? "pdf"
      : mime === "image/png"
        ? "png"
        : mime === "image/jpeg"
          ? "jpg"
          : "docx";
  const id = `DOC-${pad(index + 1, 3)}`;
  const documentNumber = `#PT-${numberPrefix(type)}-${99000 + index}`;
  const activeVerifiers = VERIFIERS.filter(
    (v): v is string => typeof v === "string",
  );
  const verifiedBy =
    status === "verified" || status === "expiring_soon" || status === "expired"
      ? pick(activeVerifiers, index)
      : null;

  return {
    id,
    documentId: id,
    name: type,
    documentNumber,
    status,
    issueDate,
    expiryDate,
    verifiedBy,
    uploadedBy: pick(UPLOADERS, index),
    uploadedAt,
    lastUpdated: daysFromRef(-(index % 25)),
    previewUrl: pick(PREVIEW_IMAGES, index),
    previewMimeType: mime,
    fileName: `${type.replace(/[^a-zA-Z0-9]+/g, "_").toLowerCase()}_v${1 + (index % 4)}.${ext}`,
    fileSizeLabel: `${(0.8 + (index % 9) * 0.35).toFixed(1)} MB`,
    timeline: buildTimeline(status, uploadedAt, expiryDate),
    adminRemark: remarkFor(status, index),
    daysUntilExpiry: daysUntil(expiryDate),
    version: 1 + (index % 4),
  };
}

export const complianceDocumentsMock: ComplianceDocument[] = Array.from(
  { length: 40 },
  (_, i) => buildDocument(i),
);

export function computeComplianceSummary(
  documents: ComplianceDocument[],
): ComplianceSummary {
  return {
    verified: documents.filter((d) => d.status === "verified").length,
    expiringSoon: documents.filter((d) => d.status === "expiring_soon").length,
    expired: documents.filter((d) => d.status === "expired").length,
    pendingVerification: documents.filter(
      (d) =>
        d.status === "pending_review" ||
        d.status === "uploaded" ||
        d.status === "rejected",
    ).length,
  };
}

export const complianceSummaryMock = computeComplianceSummary(
  complianceDocumentsMock,
);

export const complianceStatusOptions = [
  "all",
  "verified",
  "pending_review",
  "expiring_soon",
  "expired",
  "rejected",
  "uploaded",
] as const;

export const complianceDocumentTypeOptions = [
  "all",
  ...COMPLIANCE_DOCUMENT_TYPES,
] as const;
