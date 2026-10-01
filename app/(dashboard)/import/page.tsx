import type { Metadata } from "next";

import { ImportOverviewPage } from "@/components/import";

export const metadata: Metadata = { title: "Import trading" };

export default function Page() {
  return <ImportOverviewPage />;
}
