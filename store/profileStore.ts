import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { sellerProfileMock } from "@/mock/profile";
import type {
  EditProfileForm,
  ProfileDocument,
  ProfileDocumentType,
  ProfileModalType,
  SellerProfile,
  VerificationForm,
} from "@/types/profile";
import {
  defaultEditProfileForm,
  defaultVerificationForm,
} from "@/types/profile";

interface ProfileState {
  seller: SellerProfile | null;
  documents: ProfileDocument[];
  isLoading: boolean;
  hasError: boolean;
  searchQuery: string;
  activeModal: ProfileModalType;
  documentPreviewId: string | null;
  documentUploadType: ProfileDocumentType | null;
  editForm: EditProfileForm;
  verificationForm: VerificationForm;
  uploadProgress: number;
  isUploading: boolean;
  isSaving: boolean;

  loadProfile: () => Promise<void>;
  retryLoad: () => Promise<void>;
  setSearchQuery: (query: string) => void;
  openModal: (modal: ProfileModalType, documentId?: string) => void;
  closeModal: () => void;
  setEditForm: (data: Partial<EditProfileForm>) => void;
  setVerificationForm: (data: Partial<VerificationForm>) => void;
  saveProfile: () => Promise<boolean>;
  submitVerification: () => Promise<boolean>;
  copyIdentityField: (field: "gstin" | "pan" | "cin", value: string) => void;
  viewIdentityDocument: (field: "gstin" | "pan" | "cin") => void;
  previewDocument: (documentId: string) => void;
  uploadDocument: (
    type: ProfileDocumentType,
    fileName: string,
  ) => Promise<boolean>;
  getFilteredDocuments: () => ProfileDocument[];
  getExpiringAlert: () => ProfileDocument | null;
  resetEditForm: () => void;
}

function profileToEditForm(seller: SellerProfile): EditProfileForm {
  const primaryWarehouse =
    seller.warehouses.find((w) => w.isPrimary)?.label ??
    seller.warehouses[0]?.label ??
    "";

  return {
    companyName: seller.companyName,
    email: seller.email,
    phone: seller.phone,
    address: seller.address,
    website: seller.website,
    description: seller.description,
    warehouse: primaryWarehouse,
    businessCategory: seller.primaryCategories.join(", "),
    logoFileName: seller.logoUrl ? "company_logo.png" : undefined,
    logoPreview: seller.logoUrl,
  };
}

export const useProfileStore = create<ProfileState>()(
  devtools(
    (set, get) => ({
      seller: null,
      documents: [],
      isLoading: true,
      hasError: false,
      searchQuery: "",
      activeModal: null,
      documentPreviewId: null,
      documentUploadType: null,
      editForm: defaultEditProfileForm,
      verificationForm: defaultVerificationForm,
      uploadProgress: 0,
      isUploading: false,
      isSaving: false,

      loadProfile: async () => {
        set({ isLoading: true, hasError: false });
        await new Promise((resolve) => window.setTimeout(resolve, 600));
        set({
          seller: sellerProfileMock,
          documents: sellerProfileMock.documents,
          editForm: profileToEditForm(sellerProfileMock),
          isLoading: false,
        });
      },

      retryLoad: async () => {
        await get().loadProfile();
      },

      setSearchQuery: (query) => set({ searchQuery: query }),

      openModal: (modal, documentId) => {
        const { seller } = get();
        if (modal === "edit" && seller) {
          set({
            activeModal: modal,
            editForm: profileToEditForm(seller),
          });
          return;
        }
        if (modal === "document_preview" && documentId) {
          set({ activeModal: modal, documentPreviewId: documentId });
          return;
        }
        if (modal === "document_upload") {
          set({
            activeModal: modal,
            documentUploadType: "iso",
          });
          return;
        }
        set({ activeModal: modal });
      },

      closeModal: () =>
        set({
          activeModal: null,
          documentPreviewId: null,
          documentUploadType: null,
          verificationForm: defaultVerificationForm,
        }),

      setEditForm: (data) =>
        set((state) => ({ editForm: { ...state.editForm, ...data } })),

      setVerificationForm: (data) =>
        set((state) => ({
          verificationForm: { ...state.verificationForm, ...data },
        })),

      saveProfile: async () => {
        const { editForm, seller } = get();
        if (!seller) return false;

        set({ isSaving: true });
        await new Promise((resolve) => window.setTimeout(resolve, 800));

        const categories = editForm.businessCategory
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean);

        const updatedSeller: SellerProfile = {
          ...seller,
          companyName: editForm.companyName,
          email: editForm.email,
          phone: editForm.phone,
          address: editForm.address,
          website: editForm.website,
          description: editForm.description,
          logoUrl: editForm.logoPreview ?? seller.logoUrl,
          primaryCategories:
            categories.length > 0 ? categories : seller.primaryCategories,
          warehouses: seller.warehouses.map((wh) =>
            wh.isPrimary ? { ...wh, label: editForm.warehouse } : wh,
          ),
          lastUpdatedAt: new Date().toISOString(),
          lastUpdatedBy: "seller_admin",
        };

        set({
          seller: updatedSeller,
          isSaving: false,
          activeModal: null,
        });
        return true;
      },

      submitVerification: async () => {
        const { verificationForm } = get();
        if (!verificationForm.reason.trim()) return false;

        set({ isSaving: true });
        await new Promise((resolve) => window.setTimeout(resolve, 900));
        set({
          isSaving: false,
          activeModal: null,
          verificationForm: defaultVerificationForm,
        });
        return true;
      },

      copyIdentityField: (_field, value) => {
        void navigator.clipboard.writeText(value);
      },

      viewIdentityDocument: (_field) => {
        // Handled in UI with toast — backend-ready hook point
      },

      previewDocument: (documentId) => {
        set({ activeModal: "document_preview", documentPreviewId: documentId });
      },

      uploadDocument: async (type, fileName) => {
        set({ isUploading: true, uploadProgress: 0 });

        for (let progress = 10; progress <= 100; progress += 15) {
          await new Promise((resolve) => window.setTimeout(resolve, 120));
          set({ uploadProgress: Math.min(progress, 100) });
        }

        const newDoc: ProfileDocument = {
          id: `doc-${type}-${Date.now()}`,
          type,
          title:
            type === "iso"
              ? "ISO Certificate"
              : type === "gst"
                ? "GST Certificate"
                : type === "msme"
                  ? "MSME Certificate"
                  : "Certificate",
          fileName,
          status: "pending",
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
            .toISOString()
            .slice(0, 10),
        };

        set((state) => {
          if (!state.seller) {
            return { isUploading: false, uploadProgress: 0 };
          }
          const documents = [...state.documents, newDoc];
          return {
            documents,
            seller: { ...state.seller, documents },
            isUploading: false,
            uploadProgress: 0,
            activeModal: null,
            documentUploadType: null,
          };
        });

        return true;
      },

      getFilteredDocuments: () => {
        const { documents, searchQuery } = get();
        const q = searchQuery.trim().toLowerCase();
        if (!q) return documents;
        return documents.filter(
          (doc) =>
            doc.title.toLowerCase().includes(q) ||
            doc.fileName.toLowerCase().includes(q) ||
            doc.type.toLowerCase().includes(q),
        );
      },

      getExpiringAlert: () => {
        const { seller } = get();
        if (!seller) return null;
        return (
          seller.documents.find((doc) => doc.status === "expiring_soon") ?? null
        );
      },

      resetEditForm: () => {
        const { seller } = get();
        if (!seller) return;
        set({ editForm: profileToEditForm(seller) });
      },
    }),
    { name: "profile-store" },
  ),
);
