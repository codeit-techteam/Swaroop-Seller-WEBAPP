import type { Metadata } from "next";

import { ProfileView } from "@/modules/profile";

export const metadata: Metadata = {
  title: "Profile & Verification | PetroTrade Seller",
  description:
    "Manage seller profile, business identity, bank details, and verification documents",
};

export default function ProfilePage() {
  return <ProfileView />;
}
