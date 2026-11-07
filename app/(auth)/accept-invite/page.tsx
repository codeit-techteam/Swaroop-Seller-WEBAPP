import { redirect } from "next/navigation";

import { ROUTES } from "@/lib/constants";

/** Seller auth is mobile OTP only — invite password setup is retired. */
export default function AcceptInvitePage() {
  redirect(ROUTES.LOGIN);
}
