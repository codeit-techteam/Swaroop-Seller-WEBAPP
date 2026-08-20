import { redirect } from "next/navigation";

import { ROUTES } from "@/lib/constants";

export default function ProductsPage() {
  redirect(ROUTES.MARKETPLACE_CATALOG);
}
