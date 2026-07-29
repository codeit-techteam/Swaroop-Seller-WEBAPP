import toast from "react-hot-toast";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { downloadFile } from "@/lib/utils/downloadFile";
import {
  computeDocumentSummary,
  documentsMock,
  documentSummaryMock,
} from "@/mock/documents";
import type {
  DocumentCategory,
  DocumentFilters,
  DocumentStatus,
  DocumentSummary,
  PreviewModalState,
  SellerDocument,
  UploadFormData,
  UploadModalState,
  VersionHistoryModalState,
} from "@/types/documents";

interface FilterDrawerState {
  open: boolean;
}

interface DocumentState {
  documents: SellerDocument[];
  selectedDocument: SellerDocument | null;
  filters: DocumentFilters;
  filterDrawer: FilterDrawerState;
  uploadModal: UploadModalState;
  previewModal: PreviewModalState;
  versionHistoryModal: VersionHistoryModalState;
  summary: DocumentSummary;
  loading: boolean;
  page: number;
  pageSize: number;
  setLoading: (loading: boolean) => void;
  setPage: (page: number) => void;
  setSearch: (search: string) => void;
  setSearchField: (field: DocumentFilters["searchField"]) => void;
  setFilter: <K extends keyof DocumentFilters>(
    key: K,
    value: DocumentFilters[K],
  ) => void;
  resetFilters: () => void;
  openFilterDrawer: () => void;
  closeFilterDrawer: () => void;
  applyFilters: () => void;
  selectDocument: (document: SellerDocument | null) => void;
  openUploadModal: (
    mode?: UploadModalState["mode"],
    documentId?: string,
  ) => void;
  closeUploadModal: () => void;
  setUploadFormField: <K extends keyof UploadFormData>(
    key: K,
    value: UploadFormData[K],
  ) => void;
  setUploadFile: (file: File | null) => void;
  validateUploadForm: () => boolean;
  submitUpload: () => Promise<void>;
  openPreview: (documentId: string) => void;
  closePreview: () => void;
  openVersionHistory: (documentId: string) => void;
  closeVersionHistory: () => void;
  downloadDocument: (documentId: string) => void;
  replaceDocument: (documentId: string) => void;
  renewDocument: (documentId: string) => void;
  archiveDocument: (documentId: string) => void;
  deleteDocument: (documentId: string) => void;
  getFilteredDocuments: () => SellerDocument[];
  getPaginatedDocuments: () => SellerDocument[];
  getDocumentsByCategory: (category: DocumentCategory) => SellerDocument[];
  getComputedSummary: () => DocumentSummary;
}

const defaultFilters: DocumentFilters = {
  search: "",
  searchField: "document_name",
  category: "all",
  status: "all",
  expiry: "all",
};

const emptyUploadForm: UploadFormData = {
  category: "",
  name: "",
  version: "v1.0",
  expiryDate: "",
  remarks: "",
};

const defaultUploadModal: UploadModalState = {
  open: false,
  mode: "new",
  documentId: null,
  form: emptyUploadForm,
  file: null,
  errors: {},
  isUploading: false,
  uploadProgress: 0,
};

function matchesExpiry(doc: SellerDocument, expiry: DocumentFilters["expiry"]) {
  if (expiry === "all") return true;
  if (expiry === "expired") {
    return doc.daysUntilExpiry !== null && doc.daysUntilExpiry < 0;
  }
  const limit = Number(expiry);
  return (
    doc.daysUntilExpiry !== null &&
    doc.daysUntilExpiry >= 0 &&
    doc.daysUntilExpiry <= limit
  );
}

function matchesSearch(
  doc: SellerDocument,
  query: string,
  field: DocumentFilters["searchField"],
) {
  if (!query) return true;
  const q = query.toLowerCase();

  switch (field) {
    case "document_name":
      return doc.name.toLowerCase().includes(q);
    case "reference":
      return (
        doc.reference.toLowerCase().includes(q) ||
        doc.id.toLowerCase().includes(q)
      );
    case "certificate":
      return (
        doc.type !== "Invoice" &&
        doc.type !== "E-Way" &&
        (doc.name.toLowerCase().includes(q) ||
          doc.type.toLowerCase().includes(q))
      );
    case "invoice":
      return (
        doc.type === "Invoice" &&
        (doc.name.toLowerCase().includes(q) ||
          doc.reference.toLowerCase().includes(q))
      );
    case "eway_bill":
      return (
        doc.type === "E-Way" &&
        (doc.name.toLowerCase().includes(q) ||
          doc.reference.toLowerCase().includes(q))
      );
    default:
      return true;
  }
}

export const useDocumentStore = create<DocumentState>()(
  devtools(
    (set, get) => ({
      documents: documentsMock,
      selectedDocument: null,
      filters: defaultFilters,
      filterDrawer: { open: false },
      uploadModal: defaultUploadModal,
      previewModal: { open: false, documentId: null },
      versionHistoryModal: { open: false, documentId: null },
      summary: documentSummaryMock,
      loading: false,
      page: 1,
      pageSize: 12,

      setLoading: (loading) => set({ loading }),

      setPage: (page) => set({ page }),

      setSearch: (search) =>
        set((state) => ({
          filters: { ...state.filters, search },
          page: 1,
        })),

      setSearchField: (searchField) =>
        set((state) => ({
          filters: { ...state.filters, searchField },
          page: 1,
        })),

      setFilter: (key, value) =>
        set((state) => ({
          filters: { ...state.filters, [key]: value },
          page: 1,
        })),

      resetFilters: () => set({ filters: defaultFilters, page: 1 }),

      openFilterDrawer: () =>
        set((state) => ({
          filterDrawer: { open: true },
          filters: state.filters,
        })),

      closeFilterDrawer: () => set({ filterDrawer: { open: false } }),

      applyFilters: () => {
        set({ filterDrawer: { open: false }, page: 1 });
        toast.success("Filters applied");
      },

      selectDocument: (document) => set({ selectedDocument: document }),

      openUploadModal: (mode = "new", documentId) => {
        const doc = documentId
          ? get().documents.find((d) => d.id === documentId)
          : null;

        set({
          uploadModal: {
            open: true,
            mode,
            documentId: documentId ?? null,
            form: doc
              ? {
                  category: doc.category,
                  name: doc.name,
                  version: doc.version,
                  expiryDate: doc.expiryDate ?? "",
                  remarks: doc.remarks ?? "",
                }
              : { ...emptyUploadForm },
            file: null,
            errors: {},
            isUploading: false,
            uploadProgress: 0,
          },
        });
      },

      closeUploadModal: () => set({ uploadModal: { ...defaultUploadModal } }),

      setUploadFormField: (key, value) =>
        set((state) => ({
          uploadModal: {
            ...state.uploadModal,
            form: { ...state.uploadModal.form, [key]: value },
            errors: { ...state.uploadModal.errors, [key]: undefined },
          },
        })),

      setUploadFile: (file) =>
        set((state) => ({
          uploadModal: {
            ...state.uploadModal,
            file,
            errors: { ...state.uploadModal.errors, file: undefined },
          },
        })),

      validateUploadForm: () => {
        const { uploadModal } = get();
        const errors: UploadModalState["errors"] = {};
        const { form, file, mode } = uploadModal;

        if (mode === "new") {
          if (!form.category) errors.category = "Category is required";
          if (!form.name.trim()) errors.name = "Document name is required";
        }
        if (!form.version.trim()) errors.version = "Version is required";
        if (!file) errors.file = "Please upload a file";
        if (form.expiryDate && new Date(form.expiryDate) < new Date()) {
          errors.expiryDate = "Expiry date must be in the future";
        }

        set((state) => ({
          uploadModal: { ...state.uploadModal, errors },
        }));

        return Object.keys(errors).length === 0;
      },

      submitUpload: async () => {
        if (!get().validateUploadForm()) return;

        const { uploadModal, documents } = get();
        const { form, file, mode, documentId } = uploadModal;
        if (!file) return;

        set((state) => ({
          uploadModal: {
            ...state.uploadModal,
            isUploading: true,
            uploadProgress: 0,
          },
        }));

        for (let progress = 10; progress <= 100; progress += 10) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          set((state) => ({
            uploadModal: { ...state.uploadModal, uploadProgress: progress },
          }));
        }

        const now = new Date().toISOString();
        const isImage = file.type.startsWith("image/");
        const previewUrl = isImage
          ? URL.createObjectURL(file)
          : (documents[0]?.previewUrl ?? "");

        if (mode === "new") {
          const newDoc: SellerDocument = {
            id: `doc-${Date.now()}`,
            name: form.name.trim(),
            type: "GST",
            category: form.category as DocumentCategory,
            reference: `REF-${Date.now().toString().slice(-6)}`,
            status: "pending",
            version: form.version,
            expiryDate: form.expiryDate || null,
            uploadDate: now,
            verifiedBy: null,
            verifiedAt: null,
            remarks: form.remarks || null,
            fileName: file.name,
            fileSizeLabel:
              file.size < 1024 * 1024
                ? `${(file.size / 1024).toFixed(1)} KB`
                : `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
            previewUrl,
            previewMimeType: (file.type ||
              "application/pdf") as SellerDocument["previewMimeType"],
            daysUntilExpiry: form.expiryDate
              ? Math.ceil(
                  (new Date(form.expiryDate).getTime() - Date.now()) /
                    (1000 * 60 * 60 * 24),
                )
              : null,
            archived: false,
            versionHistory: [
              {
                id: `v-${Date.now()}`,
                version: form.version,
                label: "Active",
                timestamp: now,
                uploadedBy: "Reliance Poly Industries",
                isLatest: true,
                fileName: file.name,
              },
            ],
          };

          const updated = [...documents, newDoc];
          set({
            documents: updated,
            summary: computeDocumentSummary(updated),
            uploadModal: { ...defaultUploadModal },
          });
          toast.success("Document uploaded successfully");
          return;
        }

        const updated = documents.map((doc) => {
          if (doc.id !== documentId) return doc;

          const newVersion: SellerDocument["versionHistory"][0] = {
            id: `v-${Date.now()}`,
            version: form.version,
            label: mode === "renew" ? "Renewed" : "Active",
            timestamp: now,
            uploadedBy: "Reliance Poly Industries",
            isLatest: true,
            fileName: file.name,
          };

          const history = doc.versionHistory.map((v) => ({
            ...v,
            isLatest: false,
            label: "Superseded",
          }));

          return {
            ...doc,
            version: form.version,
            expiryDate: form.expiryDate || doc.expiryDate,
            uploadDate: now,
            remarks: form.remarks || doc.remarks,
            fileName: file.name,
            fileSizeLabel:
              file.size < 1024 * 1024
                ? `${(file.size / 1024).toFixed(1)} KB`
                : `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
            previewUrl: previewUrl || doc.previewUrl,
            status: "pending" as DocumentStatus,
            daysUntilExpiry: form.expiryDate
              ? Math.ceil(
                  (new Date(form.expiryDate).getTime() - Date.now()) /
                    (1000 * 60 * 60 * 24),
                )
              : doc.daysUntilExpiry,
            versionHistory: [newVersion, ...history],
          };
        });

        set({
          documents: updated,
          summary: computeDocumentSummary(updated),
          uploadModal: { ...defaultUploadModal },
        });
        toast.success(
          mode === "renew"
            ? "Document renewed successfully"
            : "Document replaced successfully",
        );
      },

      openPreview: (documentId) => {
        const doc = get().documents.find((d) => d.id === documentId);
        set({
          previewModal: { open: true, documentId },
          selectedDocument: doc ?? null,
        });
      },

      closePreview: () =>
        set({ previewModal: { open: false, documentId: null } }),

      openVersionHistory: (documentId) =>
        set({ versionHistoryModal: { open: true, documentId } }),

      closeVersionHistory: () =>
        set({ versionHistoryModal: { open: false, documentId: null } }),

      downloadDocument: (documentId) => {
        const doc = get().documents.find((d) => d.id === documentId);
        if (!doc) return;
        downloadFile(
          `Mock content for ${doc.name}`,
          doc.fileName,
          doc.previewMimeType,
        );
        toast.success(`Downloading ${doc.fileName}`);
      },

      replaceDocument: (documentId) => {
        get().openUploadModal("replace", documentId);
      },

      renewDocument: (documentId) => {
        get().openUploadModal("renew", documentId);
      },

      archiveDocument: (documentId) => {
        set((state) => {
          const documents = state.documents.map((doc) =>
            doc.id === documentId
              ? { ...doc, archived: true, status: "archived" as DocumentStatus }
              : doc,
          );
          return {
            documents,
            summary: computeDocumentSummary(documents),
          };
        });
        toast.success("Document archived");
      },

      deleteDocument: (documentId) => {
        set((state) => {
          const documents = state.documents.filter((d) => d.id !== documentId);
          return {
            documents,
            summary: computeDocumentSummary(documents),
            selectedDocument:
              state.selectedDocument?.id === documentId
                ? null
                : state.selectedDocument,
          };
        });
        toast.success("Document deleted");
      },

      getFilteredDocuments: () => {
        const { documents, filters } = get();
        const query = filters.search.trim();

        return documents.filter((doc) => {
          if (doc.archived && filters.status !== "archived") return false;

          const matchesCategory =
            filters.category === "all" || doc.category === filters.category;
          const matchesStatus =
            filters.status === "all" || doc.status === filters.status;
          const matchesExpiryFilter = matchesExpiry(doc, filters.expiry);
          const matchesSearchQuery = matchesSearch(
            doc,
            query,
            filters.searchField,
          );

          return (
            matchesCategory &&
            matchesStatus &&
            matchesExpiryFilter &&
            matchesSearchQuery
          );
        });
      },

      getPaginatedDocuments: () => {
        const { page, pageSize } = get();
        const filtered = get().getFilteredDocuments();
        const start = (page - 1) * pageSize;
        return filtered.slice(start, start + pageSize);
      },

      getDocumentsByCategory: (category) => {
        return get()
          .getPaginatedDocuments()
          .filter((doc) => doc.category === category);
      },

      getComputedSummary: () =>
        computeDocumentSummary(get().getFilteredDocuments()),
    }),
    { name: "document-store" },
  ),
);
