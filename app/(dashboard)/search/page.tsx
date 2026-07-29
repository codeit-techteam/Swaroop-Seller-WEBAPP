import type { Metadata } from "next";

import {
  createRouteMetadata,
  RoutePlaceholder,
} from "@/components/common/route-placeholder";

export const metadata: Metadata = createRouteMetadata(
  "Search",
  "Global search",
);

export default function SearchPage() {
  return <RoutePlaceholder title="Search" description="Global search" />;
}
