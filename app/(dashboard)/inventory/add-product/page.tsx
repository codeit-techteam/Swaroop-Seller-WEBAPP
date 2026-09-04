import { redirect } from "next/navigation";

import { ROUTES } from "@/lib/constants";

export default function InventoryAddRedirect() {
  redirect(ROUTES.PRODUCTS_NEW);
}
