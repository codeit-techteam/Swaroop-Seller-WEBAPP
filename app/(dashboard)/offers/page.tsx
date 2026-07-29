import type { Metadata } from "next";

import { OffersView } from "@/modules/offers";

export const metadata: Metadata = {
  title: "Active Offers | PetroTrade Seller",
  description: "Manage active marketplace offers",
};

export default function OffersPage() {
  return <OffersView />;
}
