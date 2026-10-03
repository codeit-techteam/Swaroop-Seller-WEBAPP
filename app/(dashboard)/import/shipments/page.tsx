import type { Metadata } from "next";

import { ImportShipmentsPage } from "@/components/import";

export const metadata: Metadata = { title: "Import shipments" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  return <ImportShipmentsPage initialStatus={status} />;
}
