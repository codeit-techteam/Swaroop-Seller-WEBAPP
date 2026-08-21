import type { Metadata } from "next";

import { OfferReviewView } from "@/modules/offer-review";

export const metadata: Metadata = {
  title: "Offer Review Status | PetroTrade ADMIN PANEL",
  description:
    "Track the approval lifecycle of all submitted marketplace offers.",
};

export default function OfferReviewStatusPage() {
  return <OfferReviewView />;
}
