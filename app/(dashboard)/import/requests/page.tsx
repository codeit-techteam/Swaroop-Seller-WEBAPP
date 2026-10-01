import type { Metadata } from "next";

import { ImportMarketPage } from "@/components/import";

export const metadata: Metadata = { title: "Import buy requests" };

export default function Page() {
  return <ImportMarketPage />;
}
