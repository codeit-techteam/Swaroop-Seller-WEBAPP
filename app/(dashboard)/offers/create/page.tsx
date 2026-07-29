import type { Metadata } from "next";

import { CreateOfferView } from "@/modules/offers";

export const metadata: Metadata = {
  title: "Create Trading Offer | PetroTrade Seller",
  description: "Create a new marketplace trading offer",
};

export default function CreateOfferPage() {
  return <CreateOfferView />;
}
