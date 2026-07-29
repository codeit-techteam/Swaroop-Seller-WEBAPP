import type {
  DocumentCategory,
  DocumentStatus,
  DocumentSummary,
  DocumentType,
  SellerDocument,
} from "@/types/documents";

const TYPE_TO_CATEGORY: Record<DocumentType, DocumentCategory> = {
  GST: "business_statutory",
  PAN: "business_statutory",
  MSME: "business_statutory",
  ISO: "business_statutory",
  TDS: "business_statutory",
  COA: "technical_quality",
  MSDS: "technical_quality",
  Invoice: "logistics",
  "E-Way": "logistics",
  POD: "logistics",
  "Loading Slip": "logistics",
  "Offer Approval": "marketplace",
  "Settlement Statement": "marketplace",
};

const DOCUMENT_NAMES: Record<DocumentType, string[]> = {
  GST: ["GST Certificate", "GST Registration Certificate"],
  PAN: ["PAN Card", "Company PAN Certificate"],
  MSME: ["MSME Registration", "Udyam Registration Certificate"],
  ISO: ["ISO 9001:2015 Certificate", "ISO 14001 Certificate"],
  TDS: ["TDS Certificate", "Form 16A Certificate"],
  COA: [
    "COA: Masterbatch-902",
    "COA: Polypropylene H110MA",
    "COA: HDPE Grade 5000S",
  ],
  MSDS: [
    "MSDS: Polypropylene H110MA",
    "MSDS: Masterbatch-902",
    "MSDS: HDPE Resin",
  ],
  Invoice: [
    "Invoice #INV-2023-9021",
    "Invoice #INV-2024-1145",
    "Invoice #INV-2024-2201",
  ],
  "E-Way": [
    "E-Way Bill: 291040592812",
    "E-Way Bill: 291040593045",
    "E-Way Bill: 291040594201",
  ],
  POD: [
    "POD: Batch B-9021",
    "POD: Delivery Ref DL-4412",
    "POD: Shipment SH-7781",
  ],
  "Loading Slip": [
    "Loading Slip: LS-9021",
    "Loading Slip: LS-4412",
    "Loading Slip: LS-7781",
  ],
  "Offer Approval": [
    "Offer Approval: PET-9022-A",
    "Offer Approval: PET-8841-B",
    "Offer Approval: PET-7712-C",
  ],
  "Settlement Statement": [
    "Settlement Statement: Q-3 2023",
    "Settlement Statement: Q-4 2023",
    "Settlement Statement: Q-1 2024",
  ],
};

const VERIFIERS = [
  "GSTN System",
  "Admin: Manish K.",
  "Admin: Priya S.",
  "Quality Control Team",
  "Logistics Ops",
  "Marketplace Compliance",
  "Finance Team",
];

const DEFAULT_PREVIEW_URL =
  "https://images.unsplash.com/photo-1554224315-beee415c201f?w=800&q=80";

const PREVIEW_URLS = [
  DEFAULT_PREVIEW_URL,
  "https://images.unsplash.com/photo-1586281380347-41845e1e3a70?w=800&q=80",
  "https://images.unsplash.com/photo-1568667256549-094345857637?w=800&q=80",
];

function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function buildVersionHistory(
  docId: string,
  version: string,
  fileName: string,
  uploadDate: string,
): SellerDocument["versionHistory"] {
  const major = parseFloat(version.replace("v", "")) || 1;
  const versions: SellerDocument["versionHistory"] = [];

  for (let i = Math.max(1, major - 2); i <= major; i += 0.1) {
    const vStr = `v${i.toFixed(1)}`;
    const isLatest = vStr === version;
    versions.push({
      id: `${docId}-v${i}`,
      version: vStr,
      label: isLatest ? "Active" : "Superseded",
      timestamp: isLatest
        ? uploadDate
        : daysAgo(Math.round((major - i) * 30 + 10)),
      uploadedBy: "Reliance Poly Industries",
      isLatest,
      fileName: isLatest
        ? fileName
        : `${fileName.replace(".pdf", "")}_v${i}.pdf`,
    });
  }

  return versions.reverse();
}

function generateDocument(index: number): SellerDocument {
  const types: DocumentType[] = [
    "GST",
    "PAN",
    "MSME",
    "ISO",
    "TDS",
    "COA",
    "MSDS",
    "Invoice",
    "E-Way",
    "POD",
    "Loading Slip",
    "Offer Approval",
    "Settlement Statement",
  ];

  const type = types[index % types.length] as DocumentType;
  const category = TYPE_TO_CATEGORY[type];
  const nameOptions = DOCUMENT_NAMES[type];
  const name = `${nameOptions[index % nameOptions.length]}${index > 12 ? ` (${index})` : ""}`;

  const statusPool: DocumentStatus[] = [
    "verified",
    "verified",
    "verified",
    "pending",
    "expiring",
    "expired",
    "archived",
  ];
  let status: DocumentStatus =
    statusPool[index % statusPool.length] ?? "verified";

  let daysUntilExpiry: number | null = null;
  let expiryDate: string | null = null;

  if (status === "verified") {
    daysUntilExpiry = 60 + (index % 300);
    expiryDate = daysFromNow(daysUntilExpiry);
  } else if (status === "expiring") {
    daysUntilExpiry = 5 + (index % 25);
    expiryDate = daysFromNow(daysUntilExpiry);
  } else if (status === "expired") {
    daysUntilExpiry = -(10 + (index % 60));
    expiryDate = daysFromNow(daysUntilExpiry);
  } else if (status === "pending") {
    expiryDate = daysFromNow(180 + index);
    daysUntilExpiry = 180 + index;
  }

  const versionNum = 1 + (index % 4);
  const version = `v${versionNum}.${index % 3}`;
  const uploadDate = daysAgo(5 + (index % 90));
  const fileName = `${type.toLowerCase().replace(/\s+/g, "-")}-${index + 1}.pdf`;
  const id = `doc-${String(index + 1).padStart(3, "0")}`;
  const reference =
    type === "Invoice"
      ? `INV-2024-${9000 + index}`
      : type === "E-Way"
        ? `${291040590000 + index}`
        : type === "Offer Approval"
          ? `PET-${9000 + index}-A`
          : `${type.toUpperCase()}-${2020 + (index % 5)}-${index + 1}`;

  let verifiedBy: string | null =
    status === "verified" || status === "expiring"
      ? (VERIFIERS[index % VERIFIERS.length] ?? null)
      : null;

  let verifiedAt: string | null = verifiedBy
    ? daysAgo(10 + (index % 30))
    : null;

  if (index === 0) {
    status = "verified";
    daysUntilExpiry = 150;
    expiryDate = daysFromNow(150);
  }
  if (index === 1) {
    status = "expiring";
    daysUntilExpiry = 12;
    expiryDate = daysFromNow(12);
  }
  if (index === 2) {
    status = "pending";
    verifiedBy = null;
    verifiedAt = null;
  }

  const metadata: Record<string, string> = {};
  if (category === "logistics") {
    metadata.batch = `B-${9000 + index}`;
    metadata.transporter = index % 2 === 0 ? "VRL Logistics" : "Gati Express";
    metadata.date = uploadDate.slice(0, 10);
  }
  if (category === "marketplace") {
    metadata.source =
      index % 2 === 0 ? "Marketplace Admin" : "Settlement Engine";
    metadata.cycle = `Q-${(index % 4) + 1} 2024`;
  }

  return {
    id,
    name,
    type,
    category,
    reference,
    status,
    version,
    expiryDate,
    uploadDate,
    verifiedBy,
    verifiedAt,
    remarks: index % 5 === 0 ? "Annual renewal document" : null,
    fileName,
    fileSizeLabel: `${(0.5 + (index % 5) * 0.3).toFixed(1)} MB`,
    previewUrl:
      PREVIEW_URLS[index % PREVIEW_URLS.length] ?? DEFAULT_PREVIEW_URL,
    previewMimeType: "application/pdf",
    daysUntilExpiry,
    archived: status === "archived",
    versionHistory: buildVersionHistory(id, version, fileName, uploadDate),
    metadata,
  };
}

export const documentsMock: SellerDocument[] = Array.from(
  { length: 50 },
  (_, i) => generateDocument(i),
);

export function computeDocumentSummary(
  documents: SellerDocument[],
): DocumentSummary {
  const active = documents.filter((d) => !d.archived);
  const verified = active.filter((d) => d.status === "verified").length;
  const total = active.length;
  const complianceScore =
    total === 0 ? 0 : Math.round((verified / total) * 100);

  return {
    complianceScore,
    pendingVerification: active.filter((d) => d.status === "pending").length,
    expiringSoon: active.filter(
      (d) =>
        d.status === "expiring" ||
        (d.daysUntilExpiry !== null &&
          d.daysUntilExpiry <= 30 &&
          d.daysUntilExpiry >= 0),
    ).length,
    totalDocuments: active.length,
  };
}

export const documentSummaryMock: DocumentSummary =
  computeDocumentSummary(documentsMock);
