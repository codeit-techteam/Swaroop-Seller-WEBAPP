import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { customerSegmentsMock, customersMock } from "@/mock/customers";
import { customerService } from "@/services/customerService";
import { auditService } from "@/services/cxOpsService";
import type {
  CustomerAccountStatus,
  CustomerDocumentType,
  CustomerDraft,
  CustomerKycStatus,
  CustomerProfile,
  CustomerSegment,
} from "@/types/customers";

interface CustomerState {
  customers: CustomerProfile[];
  segments: CustomerSegment[];
  loading: boolean;
  createCustomer: (draft: CustomerDraft) => Promise<CustomerProfile>;
  updateCustomer: (
    id: string,
    patch: Partial<CustomerProfile>,
  ) => Promise<void>;
  setAccountStatus: (
    id: string,
    status: CustomerAccountStatus,
  ) => Promise<void>;
  setKycStatus: (
    id: string,
    status: CustomerKycStatus,
    rejectionReason?: string,
  ) => Promise<void>;
  setDocumentStatus: (
    customerId: string,
    documentId: string,
    status: CustomerKycStatus,
    rejectionReason?: string,
  ) => Promise<void>;
  uploadDocument: (
    customerId: string,
    type: CustomerDocumentType,
    fileName: string,
    sizeLabel?: string,
  ) => Promise<void>;
  getCustomer: (id: string) => CustomerProfile | undefined;
}

export const useCustomerStore = create<CustomerState>()(
  devtools(
    (set, get) => ({
      customers: customersMock,
      segments: customerSegmentsMock,
      loading: false,
      getCustomer: (id) =>
        get().customers.find((row) => row.id === id || row.customerId === id),
      createCustomer: async (draft) => {
        const created = await customerService.create(draft);
        auditService.log({
          actor: "Amit Shah",
          role: "ADMIN",
          action: "CUSTOMER_CREATE",
          entity: "Customer",
          entityId: created.id,
          newValue: created.companyName,
        });
        const [customers, segments] = await Promise.all([
          customerService.list(),
          customerService.listSegments(),
        ]);
        set({ customers, segments });
        return created;
      },
      updateCustomer: async (id, patch) => {
        const previous = get().getCustomer(id);
        await customerService.update(id, patch);
        auditService.log({
          actor: "Amit Shah",
          role: "ADMIN",
          action: "CUSTOMER_UPDATE",
          entity: "Customer",
          entityId: id,
          oldValue: previous?.accountStatus,
          newValue: patch.accountStatus ?? patch.name,
        });
        set({ customers: await customerService.list() });
      },
      setAccountStatus: async (id, status) => {
        const previous = get().getCustomer(id);
        await customerService.setAccountStatus(id, status);
        auditService.log({
          actor: "Amit Shah",
          role: "ADMIN",
          action:
            status === "SUSPENDED" ? "CUSTOMER_SUSPEND" : "CUSTOMER_ACTIVATE",
          entity: "Customer",
          entityId: id,
          oldValue: previous?.accountStatus,
          newValue: status,
        });
        set({ customers: await customerService.list() });
      },
      setKycStatus: async (id, status, rejectionReason) => {
        const previous = get().getCustomer(id);
        await customerService.setKycStatus(id, status, rejectionReason);
        auditService.log({
          actor: "Amit Shah",
          role: "ADMIN",
          action:
            status === "VERIFIED"
              ? "KYC_APPROVE"
              : status === "REJECTED"
                ? "KYC_REJECT"
                : "KYC_UPDATE",
          entity: "Customer",
          entityId: id,
          oldValue: previous?.kycStatus,
          newValue: status,
        });
        set({ customers: await customerService.list() });
      },
      setDocumentStatus: async (
        customerId,
        documentId,
        status,
        rejectionReason,
      ) => {
        await customerService.setDocumentStatus(
          customerId,
          documentId,
          status,
          rejectionReason,
        );
        auditService.log({
          actor: "Amit Shah",
          role: "ADMIN",
          action:
            status === "VERIFIED"
              ? "KYC_APPROVE"
              : status === "REJECTED"
                ? "KYC_REJECT"
                : "KYC_UPDATE",
          entity: "CustomerDocument",
          entityId: documentId,
          newValue: status,
        });
        set({ customers: await customerService.list() });
      },
      uploadDocument: async (customerId, type, fileName, sizeLabel) => {
        await customerService.uploadDocument(
          customerId,
          type,
          fileName,
          sizeLabel,
        );
        auditService.log({
          actor: "Amit Shah",
          role: "ADMIN",
          action: "CUSTOMER_UPDATE",
          entity: "CustomerDocument",
          entityId: customerId,
          newValue: type,
        });
        set({ customers: await customerService.list() });
      },
    }),
    { name: "customer-store" },
  ),
);
