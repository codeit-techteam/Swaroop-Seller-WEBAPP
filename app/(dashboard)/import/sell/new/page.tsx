import type { Metadata } from "next";

import { ImportCreatePage } from "@/components/import";

export const metadata: Metadata = { title: "New import sell offer" };

export default function Page() {
  return <ImportCreatePage />;
}
