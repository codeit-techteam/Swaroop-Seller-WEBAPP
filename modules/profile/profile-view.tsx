"use client";

import { format, parseISO } from "date-fns";
import { motion } from "framer-motion";
import { Building2, Pencil, RefreshCw } from "lucide-react";
import { useEffect } from "react";
import toast from "react-hot-toast";

import { EmptyState } from "@/components/common/empty-state";
import { PageContainer } from "@/components/common/page-container";
import {
  AlertBanner,
  BankCard,
  BusinessIdentityCard,
  DocumentPreviewModal,
  DocumentsCenter,
  DocumentUploadModal,
  EditProfileModal,
  OperationsCard,
  PreviewModal,
  ProfileHeader,
  ProfileLoadingSkeleton,
  VerificationModal,
} from "@/components/profile";
import { Button } from "@/components/ui/button";
import { useProfileStore } from "@/store/profileStore";

export function ProfileView() {
  const seller = useProfileStore((s) => s.seller);
  const documents = useProfileStore((s) => s.documents);
  const isLoading = useProfileStore((s) => s.isLoading);
  const hasError = useProfileStore((s) => s.hasError);
  const activeModal = useProfileStore((s) => s.activeModal);
  const documentPreviewId = useProfileStore((s) => s.documentPreviewId);
  const editForm = useProfileStore((s) => s.editForm);
  const verificationForm = useProfileStore((s) => s.verificationForm);
  const isSaving = useProfileStore((s) => s.isSaving);
  const isUploading = useProfileStore((s) => s.isUploading);
  const uploadProgress = useProfileStore((s) => s.uploadProgress);
  const searchQuery = useProfileStore((s) => s.searchQuery);

  const loadProfile = useProfileStore((s) => s.loadProfile);
  const retryLoad = useProfileStore((s) => s.retryLoad);
  const openModal = useProfileStore((s) => s.openModal);
  const closeModal = useProfileStore((s) => s.closeModal);
  const setEditForm = useProfileStore((s) => s.setEditForm);
  const setVerificationForm = useProfileStore((s) => s.setVerificationForm);
  const saveProfile = useProfileStore((s) => s.saveProfile);
  const submitVerification = useProfileStore((s) => s.submitVerification);
  const copyIdentityField = useProfileStore((s) => s.copyIdentityField);
  const previewDocument = useProfileStore((s) => s.previewDocument);
  const uploadDocument = useProfileStore((s) => s.uploadDocument);
  const getExpiringAlert = useProfileStore((s) => s.getExpiringAlert);
  const resetEditForm = useProfileStore((s) => s.resetEditForm);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const expiringDoc = getExpiringAlert();
  const previewDocumentItem =
    documents.find((d) => d.id === documentPreviewId) ?? null;

  const filteredDocuments = searchQuery.trim()
    ? documents.filter(
        (doc) =>
          doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : documents;

  const handleViewIdentityDocument = (field: "gstin" | "pan" | "cin") => {
    toast.success(`Opening ${field.toUpperCase()} document (mock preview)`);
  };

  const handleSaveProfile = async () => {
    const ok = await saveProfile();
    if (ok) toast.success("Profile updated successfully");
  };

  const handleSubmitVerification = async () => {
    const ok = await submitVerification();
    if (ok) {
      toast.success(
        "Re-verification request submitted. Our team will review within 2–3 business days.",
      );
    } else {
      toast.error("Please provide a reason for re-verification");
    }
  };

  const handleUpload = async (fileName: string) => {
    const type =
      activeModal === "document_upload" ? ("iso" as const) : ("other" as const);
    const ok = await uploadDocument(type, fileName);
    if (ok) toast.success(`${fileName} uploaded successfully`);
  };

  if (isLoading) {
    return (
      <PageContainer>
        <ProfileLoadingSkeleton />
      </PageContainer>
    );
  }

  if (hasError || !seller) {
    return (
      <PageContainer>
        <EmptyState
          icon={Building2}
          title="No Profile Found"
          description="Unable to load seller profile. Please try again or contact support."
          action={
            <Button onClick={() => void retryLoad()}>Retry Loading</Button>
          }
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="pb-8">
      <ProfileHeader
        seller={seller}
        onEditProfile={() => openModal("edit")}
        onViewPublicProfile={() => openModal("preview")}
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <BusinessIdentityCard
            identity={seller.businessIdentity}
            onViewDocument={handleViewIdentityDocument}
            onCopy={copyIdentityField}
          />
          <OperationsCard seller={seller} />
        </div>

        <div className="space-y-6">
          <BankCard bank={seller.bankInformation} />
          <DocumentsCenter
            documents={filteredDocuments}
            onPreview={previewDocument}
            onUpload={() => openModal("document_upload")}
            onAddIso={() => openModal("document_upload")}
          />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="mt-6"
      >
        <AlertBanner
          document={expiringDoc}
          onUpdateNow={() => openModal("document_upload")}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8 flex flex-col gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between"
      >
        <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
          Identity Management | Last updated on{" "}
          {format(parseISO(seller.lastUpdatedAt), "dd MMM yyyy 'at' HH:mm")} by{" "}
          {seller.lastUpdatedBy}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="gap-2 border-slate-200 text-[#0B1F3A] hover:bg-slate-50"
            onClick={() => openModal("verification")}
          >
            <RefreshCw className="h-4 w-4" />
            Request Re-verification
          </Button>
          <Button
            className="gap-2 bg-[#0B1F3A] hover:bg-[#122846]"
            onClick={() => openModal("edit")}
          >
            <Pencil className="h-4 w-4" />
            Edit Profile Details
          </Button>
        </div>
      </motion.div>

      <EditProfileModal
        open={activeModal === "edit"}
        form={editForm}
        isSaving={isSaving}
        onOpenChange={(open) => !open && closeModal()}
        onChange={setEditForm}
        onSave={() => void handleSaveProfile()}
        onCancel={() => {
          resetEditForm();
          closeModal();
        }}
      />

      <PreviewModal
        open={activeModal === "preview"}
        seller={seller}
        onOpenChange={(open) => !open && closeModal()}
      />

      <VerificationModal
        open={activeModal === "verification"}
        form={verificationForm}
        isSaving={isSaving}
        onOpenChange={(open) => !open && closeModal()}
        onChange={setVerificationForm}
        onSubmit={() => void handleSubmitVerification()}
        onCancel={closeModal}
      />

      <DocumentPreviewModal
        open={activeModal === "document_preview"}
        document={previewDocumentItem}
        onClose={closeModal}
      />

      <DocumentUploadModal
        open={activeModal === "document_upload"}
        isUploading={isUploading}
        uploadProgress={uploadProgress}
        onClose={closeModal}
        onUpload={(fileName) => void handleUpload(fileName)}
      />
    </PageContainer>
  );
}
