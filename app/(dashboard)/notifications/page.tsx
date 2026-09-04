import { createRouteMetadata } from "@/components/common";
import { SellerNotificationsView } from "@/modules/seller-notifications/notifications-view";

export const metadata = createRouteMetadata(
  "Notifications",
  "Seller alerts for offers, orders and payments",
);

export default function NotificationsPage() {
  return <SellerNotificationsView />;
}
