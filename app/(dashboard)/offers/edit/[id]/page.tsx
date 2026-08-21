import type { Metadata } from "next";

import { CreateOfferView } from "@/modules/offers";

export const metadata: Metadata = {
  title: "Edit Trading Offer | PetroTrade ADMIN PANEL",
  description: "Edit an existing marketplace trading offer",
};

interface EditOfferPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditOfferPage({ params }: EditOfferPageProps) {
  const { id } = await params;
  return <CreateOfferView editId={id} />;
}
