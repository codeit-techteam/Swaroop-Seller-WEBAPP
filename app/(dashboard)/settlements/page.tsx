import type { Metadata } from "next";

import { SettlementsView } from "@/modules/settlements";

export const metadata: Metadata = {
  title: "Settlement Dashboard | PetroTrade Seller",
  description:
    "Track revenue, settlements, and payment disbursements across all orders.",
};

export default function SettlementsPage() {
  return <SettlementsView />;
}
