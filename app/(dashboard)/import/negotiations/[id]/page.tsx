import type { Metadata } from "next";

import { ImportNegotiationDetailPage } from "@/components/import";

export const metadata: Metadata = { title: "Import negotiation" };

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ImportNegotiationDetailPage id={id} />;
}
