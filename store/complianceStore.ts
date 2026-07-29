import { create } from "zustand";
import { devtools } from "zustand/middleware";

import {
  complianceDocumentsMock,
  complianceSummaryMock,
  computeComplianceSummary,
} from "@/mock/compliance";
import type {
  ComplianceDialogType,
  ComplianceDocument,
  ComplianceFilters,
  ComplianceSort,
  ComplianceSortKey,
  ComplianceSummary,
  FastTrackReason,
} from "@/types/compliance";

interface ComplianceState {
  documents: ComplianceDocument[];
  selectedDocument: ComplianceDocument | null;
  drawerOpen: boolean;
  filters: ComplianceFilters;
  sort: ComplianceSort;
  page: number;
  pageSize: number;
  summary: ComplianceSummary;
  uploadProgress: number;
  isUploading: boolean;
  previewOpen: boolean;
  loading: boolean;
  dialogType: ComplianceDialogType;
  dialogDocumentId: string | null;
  setSearch: (search: string) => void;
  setFilter: <K extends keyof ComplianceFilters>(
    key: K,
    value: ComplianceFilters[K],
  ) => void;
  resetFilters: () => void;
  setPage: (page: number) => void;
  setSort: (key: ComplianceSortKey) => void;
  openDrawer: (document: ComplianceDocument) => void;
  openDrawerById: (documentId: string) => boolean;
  closeDrawer: () => void;
  openDialog: (
    type: Exclude<ComplianceDialogType, null>,
    documentId?: string,
  ) => void;
  closeDialog: () => void;
  setPreviewOpen: (open: boolean) => void;
  setLoading: (loading: boolean) => void;
  uploadNewVersion: (documentId: string, file: File) => Promise<void>;
  requestFastTrack: (
    documentId: string,
    reason: FastTrackReason,
    comment: string,
  ) => void;
  downloadDocument: (documentId: string) => ComplianceDocument | null;
  exportCsv: () => void;
  getFilteredDocuments: () => ComplianceDocument[];
  getPaginatedDocuments: () => ComplianceDocument[];
  getComputedSummary: () => ComplianceSummary;
  getWarningFlags: () => {
    hasExpired: boolean;
    hasPending: boolean;
    hasRejected: boolean;
    hasRenewalRequired: boolean;
  };
}

const defaultFilters: ComplianceFilters = {
  search: "",
  status: "all",
  documentType: "all",
  expiryWindow: "all",
};

function matchesExpiryWindow(
  doc: ComplianceDocument,
  window: ComplianceFilters["expiryWindow"],
) {
  if (window === "all") return true;
  if (doc.daysUntilExpiry === null) return false;
  const limit = Number(window);
  return doc.daysUntilExpiry >= 0 && doc.daysUntilExpiry <= limit;
}

export const useComplianceStore = create<ComplianceState>()(
  devtools(
    (set, get) => ({
      documents: complianceDocumentsMock,
      selectedDocument: null,
      drawerOpen: false,
      filters: defaultFilters,
      sort: { key: "lastUpdated", direction: "desc" },
      page: 1,
      pageSize: 8,
      summary: complianceSummaryMock,
      uploadProgress: 0,
      isUploading: false,
      previewOpen: false,
      loading: false,
      dialogType: null,
      dialogDocumentId: null,

      setSearch: (search) =>
        set((state) => ({
          filters: { ...state.filters, search },
          page: 1,
        })),

      setFilter: (key, value) =>
        set((state) => ({
          filters: { ...state.filters, [key]: value },
          page: 1,
        })),

      resetFilters: () => set({ filters: defaultFilters, page: 1 }),

      setPage: (page) => set({ page }),

      setSort: (key) => {
        const current = get().sort;
        set({
          sort: {
            key,
            direction:
              current.key === key && current.direction === "asc"
                ? "desc"
                : "asc",
          },
        });
      },

      openDrawer: (document) =>
        set({ selectedDocument: document, drawerOpen: true }),

      openDrawerById: (documentId) => {
        const document = get().documents.find(
          (item) => item.id === documentId || item.documentId === documentId,
        );
        if (!document) return false;
        set({ selectedDocument: document, drawerOpen: true });
        return true;
      },

      closeDrawer: () => set({ selectedDocument: null, drawerOpen: false }),

      openDialog: (type, documentId) =>
        set({
          dialogType: type,
          dialogDocumentId: documentId ?? get().selectedDocument?.id ?? null,
        }),

      closeDialog: () =>
        set({
          dialogType: null,
          dialogDocumentId: null,
          uploadProgress: 0,
          isUploading: false,
        }),

      setPreviewOpen: (open) => set({ previewOpen: open }),

      setLoading: (loading) => set({ loading }),

      uploadNewVersion: async (documentId, file) => {
        set({ isUploading: true, uploadProgress: 0 });

        for (let progress = 10; progress <= 100; progress += 10) {
          await new Promise((resolve) => setTimeout(resolve, 120));
          set({ uploadProgress: progress });
        }

        const now = new Date().toISOString();
        const isImage = file.type.startsWith("image/");
        const previewUrl = isImage
          ? URL.createObjectURL(file)
          : (get().documents.find((d) => d.id === documentId)?.previewUrl ??
            "");

        set((state) => {
          const documents = state.documents.map((doc) => {
            if (doc.id !== documentId) return doc;
            const updated: ComplianceDocument = {
              ...doc,
              status: "uploaded",
              version: doc.version + 1,
              fileName: file.name,
              fileSizeLabel:
                file.size < 1024 * 1024
                  ? `${(file.size / 1024).toFixed(1)} KB`
                  : `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
              previewMimeType: (file.type ||
                "application/pdf") as ComplianceDocument["previewMimeType"],
              previewUrl: previewUrl || doc.previewUrl,
              uploadedAt: now,
              lastUpdated: now,
              verifiedBy: null,
              adminRemark: {
                type: "compliance_notice",
                title: "Compliance Notice",
                message:
                  "New version uploaded. Awaiting admin verification before trading eligibility is restored.",
              },
              timeline: [
                {
                  id: `upload-${Date.now()}`,
                  type: "uploaded",
                  title: "Document Uploaded",
                  timestamp: now,
                  status: "completed",
                },
                {
                  id: `pending-${Date.now()}`,
                  type: "verification_started",
                  title: "Verification Started",
                  description: "AWAITING ASSIGNMENT",
                  status: "pending",
                },
              ],
            };
            return updated;
          });

          const selected = documents.find((d) => d.id === documentId) ?? null;

          return {
            documents,
            selectedDocument: selected,
            summary: computeComplianceSummary(documents),
            isUploading: false,
            uploadProgress: 100,
            dialogType: null,
            dialogDocumentId: null,
          };
        });
      },

      requestFastTrack: (documentId, reason, comment) => {
        const now = new Date().toISOString();
        set((state) => {
          const documents = state.documents.map((doc) => {
            if (doc.id !== documentId) return doc;
            return {
              ...doc,
              lastUpdated: now,
              adminRemark: {
                type: "compliance_notice" as const,
                title: "Fast-Track Requested",
                message: `Seller requested fast-track verification (${reason.replace(/_/g, " ")}). ${comment}`,
              },
              timeline: [
                ...doc.timeline,
                {
                  id: `fast-track-${Date.now()}`,
                  type: "under_review" as const,
                  title: "Under Review",
                  description: "FAST-TRACK REQUESTED",
                  timestamp: now,
                  status: "current" as const,
                },
              ],
            };
          });
          const selected =
            documents.find((d) => d.id === documentId) ??
            state.selectedDocument;
          return {
            documents,
            selectedDocument: selected,
            dialogType: null,
            dialogDocumentId: null,
          };
        });
      },

      downloadDocument: (documentId) => {
        const document = get().documents.find((d) => d.id === documentId);
        if (!document) return null;
        set({
          previewOpen: true,
          selectedDocument: document,
          dialogType: "download_preview",
          dialogDocumentId: documentId,
        });
        return document;
      },

      exportCsv: () => {
        const rows = get().getFilteredDocuments();
        const header =
          "Document ID,Name,Certificate Number,Status,Expiry Date,Verified By,Uploaded By,Last Updated,Version";
        const lines = rows.map(
          (doc) =>
            `${doc.documentId},"${doc.name}",${doc.documentNumber},${doc.status},${doc.expiryDate ?? "N/A"},${doc.verifiedBy ?? "—"},${doc.uploadedBy},${doc.lastUpdated},v${doc.version}`,
        );
        const blob = new Blob([[header, ...lines].join("\n")], {
          type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `compliance-export-${Date.now()}.csv`;
        link.click();
        URL.revokeObjectURL(url);
      },

      getFilteredDocuments: () => {
        const { documents, filters, sort } = get();
        const query = filters.search.trim().toLowerCase();

        const filtered = documents.filter((doc) => {
          const matchesSearch =
            !query ||
            doc.name.toLowerCase().includes(query) ||
            doc.documentNumber.toLowerCase().includes(query) ||
            doc.documentId.toLowerCase().includes(query) ||
            doc.id.toLowerCase().includes(query);

          const matchesStatus =
            filters.status === "all" || doc.status === filters.status;

          const matchesType =
            filters.documentType === "all" || doc.name === filters.documentType;

          const matchesExpiry = matchesExpiryWindow(doc, filters.expiryWindow);

          return matchesSearch && matchesStatus && matchesType && matchesExpiry;
        });

        return [...filtered].sort((a, b) => {
          const dir = sort.direction === "asc" ? 1 : -1;
          const left = a[sort.key];
          const right = b[sort.key];

          if (sort.key === "expiryDate" || sort.key === "lastUpdated") {
            const leftTime = left ? new Date(String(left)).getTime() : 0;
            const rightTime = right ? new Date(String(right)).getTime() : 0;
            return (leftTime - rightTime) * dir;
          }

          return String(left ?? "").localeCompare(String(right ?? "")) * dir;
        });
      },

      getPaginatedDocuments: () => {
        const { page, pageSize } = get();
        const filtered = get().getFilteredDocuments();
        const start = (page - 1) * pageSize;
        return filtered.slice(start, start + pageSize);
      },

      getComputedSummary: () =>
        computeComplianceSummary(get().getFilteredDocuments()),

      getWarningFlags: () => {
        const documents = get().documents;
        return {
          hasExpired: documents.some((d) => d.status === "expired"),
          hasPending: documents.some(
            (d) => d.status === "pending_review" || d.status === "uploaded",
          ),
          hasRejected: documents.some((d) => d.status === "rejected"),
          hasRenewalRequired: documents.some(
            (d) =>
              d.status === "expiring_soon" ||
              d.adminRemark?.type === "renewal_required",
          ),
        };
      },
    }),
    { name: "compliance-store" },
  ),
);
