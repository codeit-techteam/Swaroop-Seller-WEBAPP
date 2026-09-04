import { createRouteMetadata } from "@/components/common";
import { SellerProfileView } from "@/modules/seller-profile/profile-view";

export const metadata = createRouteMetadata(
  "Profile",
  "Company, locations, bank and account manager",
);

export default function ProfilePage() {
  return <SellerProfileView />;
}
