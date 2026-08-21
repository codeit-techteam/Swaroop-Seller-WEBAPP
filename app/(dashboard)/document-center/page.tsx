import type { Metadata } from "next";

import { DocumentCenterView } from "@/modules/document-center";

export const metadata: Metadata = {
  title: "Customer Documents | PetroTrade ADMIN PANEL",
  description:
    "Customer onboarding documents from APP/WEB — review, verify and manage uploads.",
};

export default function DocumentCenterPage() {
  return <DocumentCenterView />;
}
