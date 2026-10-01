import type { Metadata } from "next";

import { ImportDealDetailPage } from "@/components/import";

export const metadata: Metadata = { title: "Import deal" };

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ImportDealDetailPage id={id} />;
}
