import type { Metadata } from "next";

import { ComplianceView } from "@/modules/compliance";

export const metadata: Metadata = {
  title: "Compliance Center | PetroTrade Seller",
  description:
    "Manage and track business certifications for trading eligibility.",
};

export default function CompliancePage() {
  return <ComplianceView />;
}
