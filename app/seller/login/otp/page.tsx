import { redirect } from "next/navigation";

import { ROUTES } from "@/lib/constants";

export default function LegacySellerOtpPage() {
  redirect(ROUTES.VERIFY_OTP);
}
