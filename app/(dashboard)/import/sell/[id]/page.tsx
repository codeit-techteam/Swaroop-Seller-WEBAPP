import type { Metadata } from "next";

import { ImportOwnerDetailPage } from "@/components/import";

export const metadata: Metadata = { title: "Import sell offer" };

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ImportOwnerDetailPage id={id} />;
}
