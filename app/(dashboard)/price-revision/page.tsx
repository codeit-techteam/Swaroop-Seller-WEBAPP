import type { Metadata } from "next";

import { PriceRevisionView } from "@/modules/price-revision";

export const metadata: Metadata = {
  title: "Price Revision Requests | PetroTrade Seller",
  description:
    "Manage platform-initiated pricing adjustments and market-driven negotiations for your marketplace offers.",
};

export default function PriceRevisionPage() {
  return <PriceRevisionView />;
}
