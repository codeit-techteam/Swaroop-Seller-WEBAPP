import type { Metadata } from "next";

import { ImportDealsPage } from "@/components/import";

export const metadata: Metadata = { title: "Import deals" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  return <ImportDealsPage initialStatus={status} />;
}
