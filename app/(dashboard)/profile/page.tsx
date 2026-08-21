import type { Metadata } from "next";

import { ProfileView } from "@/modules/profile";

export const metadata: Metadata = {
  title: "Admin Profile | PetroTrade ADMIN PANEL",
  description:
    "Manage your ADMIN PANEL profile, contact details, and role access",
};

export default function ProfilePage() {
  return <ProfileView />;
}
