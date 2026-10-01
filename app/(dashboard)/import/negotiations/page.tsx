import type { Metadata } from "next";

import { ImportNegotiationsPage } from "@/components/import";

export const metadata: Metadata = { title: "Import negotiations" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  return <ImportNegotiationsPage initialStatus={status} />;
}
