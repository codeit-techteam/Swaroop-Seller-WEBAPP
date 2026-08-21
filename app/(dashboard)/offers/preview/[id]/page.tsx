import type { Metadata } from "next";

import { PreviewOfferView } from "@/modules/offers";

export const metadata: Metadata = {
  title: "Preview Offer | PetroTrade ADMIN PANEL",
  description: "Preview trading offer as buyer would see it",
};

export default function PreviewOfferPage() {
  return <PreviewOfferView />;
}
