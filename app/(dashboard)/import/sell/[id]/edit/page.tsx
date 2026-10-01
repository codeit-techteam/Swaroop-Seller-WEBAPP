import type { Metadata } from "next";

import { ImportEditPage } from "@/components/import";

export const metadata: Metadata = { title: "Edit import sell offer" };

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ImportEditPage id={id} />;
}
