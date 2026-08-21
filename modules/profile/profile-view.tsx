"use client";

import { format, parseISO } from "date-fns";
import { motion } from "framer-motion";
import { Pencil, UserRound } from "lucide-react";
import { useEffect } from "react";
import toast from "react-hot-toast";

import { EmptyState } from "@/components/common/empty-state";
import { PageContainer } from "@/components/common/page-container";
import {
  ContactInfoCard,
  EditProfileModal,
  ProfileHeader,
  ProfileLoadingSkeleton,
  RoleAccessCard,
} from "@/components/profile";
import { Button } from "@/components/ui/button";
import { useProfileStore } from "@/store/profileStore";

export function ProfileView() {
  const profile = useProfileStore((s) => s.profile);
  const isLoading = useProfileStore((s) => s.isLoading);
  const hasError = useProfileStore((s) => s.hasError);
  const activeModal = useProfileStore((s) => s.activeModal);
  const editForm = useProfileStore((s) => s.editForm);
  const isSaving = useProfileStore((s) => s.isSaving);

  const loadProfile = useProfileStore((s) => s.loadProfile);
  const retryLoad = useProfileStore((s) => s.retryLoad);
  const openModal = useProfileStore((s) => s.openModal);
  const closeModal = useProfileStore((s) => s.closeModal);
  const setEditForm = useProfileStore((s) => s.setEditForm);
  const saveProfile = useProfileStore((s) => s.saveProfile);
  const resetEditForm = useProfileStore((s) => s.resetEditForm);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const handleSaveProfile = async () => {
    const ok = await saveProfile();
    if (ok) toast.success("Profile updated successfully");
  };

  if (isLoading) {
    return (
      <PageContainer>
        <ProfileLoadingSkeleton />
      </PageContainer>
    );
  }

  if (hasError || !profile) {
    return (
      <PageContainer>
        <EmptyState
          icon={UserRound}
          title="No Profile Found"
          description="Unable to load admin profile. Please try again or contact support."
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
        profile={profile}
        onEditProfile={() => openModal("edit")}
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <ContactInfoCard profile={profile} />
        <RoleAccessCard profile={profile} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mt-8 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-card sm:flex-row sm:items-center sm:justify-between"
      >
        <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
          Account · Last updated{" "}
          {format(parseISO(profile.lastUpdatedAt), "dd MMM yyyy 'at' HH:mm")} by{" "}
          {profile.lastUpdatedBy}
        </p>
        <Button
          className="gap-2 bg-[#0B1F3A] hover:bg-[#122846]"
          onClick={() => openModal("edit")}
        >
          <Pencil className="h-4 w-4" />
          Edit Profile Details
        </Button>
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
    </PageContainer>
  );
}
