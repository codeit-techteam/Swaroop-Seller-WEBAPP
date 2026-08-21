import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { getInitials } from "@/lib/utils";
import { adminProfileMock } from "@/mock/profile";
import type {
  AdminProfile,
  EditProfileForm,
  ProfileModalType,
} from "@/types/profile";
import { defaultEditProfileForm } from "@/types/profile";

interface ProfileState {
  profile: AdminProfile | null;
  isLoading: boolean;
  hasError: boolean;
  activeModal: ProfileModalType;
  editForm: EditProfileForm;
  isSaving: boolean;

  loadProfile: () => Promise<void>;
  retryLoad: () => Promise<void>;
  openModal: (modal: ProfileModalType) => void;
  closeModal: () => void;
  setEditForm: (data: Partial<EditProfileForm>) => void;
  saveProfile: () => Promise<boolean>;
  resetEditForm: () => void;
}

function profileToEditForm(profile: AdminProfile): EditProfileForm {
  return {
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    department: profile.department,
    officeLocation: profile.officeLocation,
    avatarPreview: profile.avatarUrl,
  };
}

export const useProfileStore = create<ProfileState>()(
  devtools(
    (set, get) => ({
      profile: null,
      isLoading: true,
      hasError: false,
      activeModal: null,
      editForm: defaultEditProfileForm,
      isSaving: false,

      loadProfile: async () => {
        set({ isLoading: true, hasError: false });
        await new Promise((resolve) => window.setTimeout(resolve, 500));
        set({
          profile: adminProfileMock,
          editForm: profileToEditForm(adminProfileMock),
          isLoading: false,
        });
      },

      retryLoad: async () => {
        await get().loadProfile();
      },

      openModal: (modal) => {
        const { profile } = get();
        if (modal === "edit" && profile) {
          set({
            activeModal: modal,
            editForm: profileToEditForm(profile),
          });
          return;
        }
        set({ activeModal: modal });
      },

      closeModal: () => set({ activeModal: null }),

      setEditForm: (data) =>
        set((state) => ({ editForm: { ...state.editForm, ...data } })),

      saveProfile: async () => {
        const { editForm, profile } = get();
        if (!profile) return false;

        set({ isSaving: true });
        await new Promise((resolve) => window.setTimeout(resolve, 700));

        const updated: AdminProfile = {
          ...profile,
          name: editForm.name.trim(),
          email: editForm.email.trim(),
          phone: editForm.phone.trim(),
          department: editForm.department.trim(),
          officeLocation: editForm.officeLocation.trim(),
          initials: getInitials(editForm.name.trim(), profile.initials),
          avatarUrl: editForm.avatarPreview ?? profile.avatarUrl,
          lastUpdatedAt: new Date().toISOString(),
          lastUpdatedBy: profile.email.split("@")[0] || "admin",
        };

        set({
          profile: updated,
          isSaving: false,
          activeModal: null,
        });
        return true;
      },

      resetEditForm: () => {
        const { profile } = get();
        if (!profile) return;
        set({ editForm: profileToEditForm(profile) });
      },
    }),
    { name: "profile-store" },
  ),
);
