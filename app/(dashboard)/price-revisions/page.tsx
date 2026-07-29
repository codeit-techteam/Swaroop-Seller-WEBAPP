import { redirect } from "next/navigation";

import { ROUTES } from "@/lib/constants";

export default function PriceRevisionsRedirectPage() {
  redirect(ROUTES.PRICE_REVISIONS);
}
