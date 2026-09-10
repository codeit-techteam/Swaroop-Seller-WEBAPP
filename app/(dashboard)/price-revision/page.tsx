import { redirect } from "next/navigation";

import { ROUTES } from "@/lib/constants";

export default function PriceRevisionAliasPage() {
  redirect(ROUTES.PRICE_REVISIONS);
}
