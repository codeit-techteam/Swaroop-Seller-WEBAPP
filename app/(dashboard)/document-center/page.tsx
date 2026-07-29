import type { Metadata } from "next";

import { DocumentCenterView } from "@/modules/document-center";

export const metadata: Metadata = {
  title: "Document Center | PetroTrade Seller",
  description:
    "Centralized management for compliance, quality and transactional records.",
};

export default function DocumentCenterPage() {
  return <DocumentCenterView />;
}
