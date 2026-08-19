import { createRouteMetadata } from "@/components/common";
import { UsersView } from "@/modules/users";

export const metadata = createRouteMetadata(
  "Users",
  "Operations user directory",
);

export default function UsersPage() {
  return <UsersView />;
}
