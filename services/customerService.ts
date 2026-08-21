import { nextId, nowIso } from "@/lib/cx";
import { customerSegmentsMock, customersMock } from "@/mock/customers";
import type {
  CustomerAccountStatus,
  CustomerDocument,
  CustomerDocumentType,
  CustomerDraft,
  CustomerKycStatus,
  CustomerProfile,
  CustomerSegment,
} from "@/types/customers";
import {
  CUSTOMER_DOCUMENT_TYPE_LABELS,
  defaultCustomerDraft,
} from "@/types/customers";

let customers = [...customersMock];
const segments = [...customerSegmentsMock];

function syncDerived(customer: CustomerProfile): CustomerProfile {
  return {
    ...customer,
    availableCredit: customer.credit.available,
    creditLimit: customer.credit.limit,
    usedCredit: customer.credit.used,
    outstanding: customer.credit.outstanding,
    creditStatus: customer.credit.status,
  };
}

function todayLabel() {
  return new Date().toISOString().slice(0, 10);
}

export const customerService = {
  async list(): Promise<CustomerProfile[]> {
    return customers;
  },
  async get(id: string): Promise<CustomerProfile | undefined> {
    return customers.find((row) => row.id === id || row.customerId === id);
  },
  async create(draft: CustomerDraft): Promise<CustomerProfile> {
    const created: CustomerProfile = {
      id: nextId("cust"),
      customerId: `CUS-${10000 + customers.length + 1}`,
      ...draft,
      kycStatus: "PENDING",
      creditStatus: "PENDING",
      accountStatus: "PENDING",
      availableCredit: 0,
      creditLimit: 0,
      usedCredit: 0,
      outstanding: 0,
      totalOrders: 0,
      totalPurchaseValue: 0,
      activeOrders: 0,
      pendingPayments: 0,
      lastActive: "Never",
      lastLogin: "",
      lastOrder: "",
      createdAt: nowIso(),
      addresses: [
        {
          id: nextId("addr"),
          label: "Primary",
          kind: "BILLING",
          line1: "",
          city: draft.city,
          state: draft.state,
          pincode: "",
          isDefault: true,
        },
      ],
      documents: [],
      credit: {
        limit: 0,
        available: 0,
        used: 0,
        outstanding: 0,
        status: "PENDING",
        insuranceStatus: "NONE",
        expiry: "",
        utilizationPct: 0,
      },
      activity: [
        {
          id: nextId("act"),
          at: nowIso(),
          title: "Customer created",
          description: "Added from ADMIN PANEL",
          kind: "KYC",
        },
      ],
    };
    customers = [created, ...customers];
    return created;
  },
  async update(
    id: string,
    patch: Partial<CustomerProfile>,
  ): Promise<CustomerProfile | undefined> {
    customers = customers.map((row) =>
      row.id === id ? syncDerived({ ...row, ...patch }) : row,
    );
    return customers.find((row) => row.id === id);
  },
  async setAccountStatus(id: string, status: CustomerAccountStatus) {
    return this.update(id, { accountStatus: status });
  },
  async setKycStatus(
    id: string,
    status: CustomerKycStatus,
    rejectionReason?: string,
  ) {
    return this.update(id, {
      kycStatus: status,
      rejectionReason: status === "REJECTED" ? rejectionReason : undefined,
      accountStatus:
        status === "VERIFIED"
          ? "ACTIVE"
          : status === "SUSPENDED" || status === "REJECTED"
            ? "SUSPENDED"
            : undefined,
    });
  },
  async setDocumentStatus(
    customerId: string,
    documentId: string,
    status: CustomerKycStatus,
    rejectionReason?: string,
  ) {
    const customer = customers.find(
      (row) => row.id === customerId || row.customerId === customerId,
    );
    if (!customer) return undefined;

    const documents = customer.documents.map((doc) =>
      doc.id === documentId
        ? {
            ...doc,
            status,
            verifiedBy: status === "VERIFIED" ? "Compliance Desk" : undefined,
            rejectionReason:
              status === "REJECTED" ? rejectionReason || undefined : undefined,
          }
        : doc,
    );

    return this.update(customer.id, { documents });
  },
  async uploadDocument(
    customerId: string,
    type: CustomerDocumentType,
    fileName: string,
    sizeLabel = "1.0 MB",
  ) {
    const customer = customers.find(
      (row) => row.id === customerId || row.customerId === customerId,
    );
    if (!customer) return undefined;

    const name = CUSTOMER_DOCUMENT_TYPE_LABELS[type];
    const existing = customer.documents.find((doc) => doc.type === type);
    const nextDoc: CustomerDocument = {
      id: existing?.id ?? nextId("doc"),
      type,
      name,
      status: "UNDER_REVIEW",
      uploadedAt: todayLabel(),
      sizeLabel,
      fileName,
      previewUrl:
        "https://images.unsplash.com/photo-1554224315-beee415c201f?w=800&q=80",
      previewMimeType: "application/pdf",
      verifiedBy: undefined,
      rejectionReason: undefined,
    };

    const documents = existing
      ? customer.documents.map((doc) => (doc.type === type ? nextDoc : doc))
      : [...customer.documents, nextDoc];

    return this.update(customer.id, { documents });
  },
  async listSegments(): Promise<CustomerSegment[]> {
    return segments.map((segment) => ({
      ...segment,
      customerCount: segment.customerType
        ? customers.filter((row) => row.customerType === segment.customerType)
            .length
        : segment.customerCount,
    }));
  },
  emptyDraft: defaultCustomerDraft,
};
