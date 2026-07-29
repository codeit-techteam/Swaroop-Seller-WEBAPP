import type { Metadata } from "next";

import { createRouteMetadata } from "@/components/common/route-placeholder";
import { NotificationsView } from "@/modules/notifications";

export const metadata: Metadata = createRouteMetadata(
  "Notifications Center",
  "Seller alerts and operational notifications",
);

export default function NotificationsPage() {
  return <NotificationsView />;
}
