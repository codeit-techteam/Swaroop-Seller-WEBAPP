import { redirect } from "next/navigation";

import { ROUTES } from "@/lib/constants";

/** Seller auth is mobile OTP only — password change is retired. */
export default function ChangePasswordPage() {
  redirect(ROUTES.LOGIN);
}
