import type { Metadata } from "next";

import { ImportMarketDetailPage } from "@/components/import";

export const metadata: Metadata = { title: "Import buy request" };

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const [{ id }, { from }] = await Promise.all([params, searchParams]);
  return <ImportMarketDetailPage id={id} counterListingId={from} />;
}
