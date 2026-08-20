import { createRouteMetadata } from "@/components/common";
import { UsersView } from "@/modules/users";

export const metadata = createRouteMetadata(
  "Customer",
  "Operations customer directory",
);

export default function UsersPage() {
  return <UsersView />;
}
