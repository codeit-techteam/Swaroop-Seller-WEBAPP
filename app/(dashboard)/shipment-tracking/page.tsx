import { redirect } from "next/navigation";

import { ROUTES } from "@/lib/constants";

export default function ShipmentTrackingRedirect() {
  redirect(ROUTES.SHIPMENTS);
}
