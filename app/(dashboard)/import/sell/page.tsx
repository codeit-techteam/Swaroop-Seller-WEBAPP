import type { Metadata } from "next";

import { ImportMyListingsPage } from "@/components/import";

export const metadata: Metadata = { title: "My import sell offers" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  return <ImportMyListingsPage initialTab={tab} />;
}
