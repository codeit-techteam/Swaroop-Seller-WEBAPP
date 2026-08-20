import { createRouteMetadata } from "@/components/common";
import { CustomerNotificationsView } from "@/modules/customers";

export const metadata = createRouteMetadata(
  "Customer notifications",
  "Push, email, SMS and in-app messaging",
);

export default function CustomerNotificationsPage() {
  return <CustomerNotificationsView />;
}
