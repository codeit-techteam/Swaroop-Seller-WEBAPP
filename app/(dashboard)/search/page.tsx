import { Suspense } from "react";

import { createRouteMetadata } from "@/components/common";
import { GlobalSearchView } from "@/modules/search";

export const metadata = createRouteMetadata(
  "Search",
  "Global operations search",
);

export default function SearchPage() {
  return (
    <Suspense>
      <GlobalSearchView />
    </Suspense>
  );
}
