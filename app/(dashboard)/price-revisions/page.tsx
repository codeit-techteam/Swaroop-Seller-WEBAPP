import { redirect } from "next/navigation";

import { ROUTES } from "@/lib/constants";

/** Price Revisions is temporarily hidden from the frontend. */
export default function PriceRevisionsRedirectPage() {
  redirect(ROUTES.DASHBOARD);
}
