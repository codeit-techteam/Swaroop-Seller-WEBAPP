import { redirect } from "next/navigation";

import { ROUTES } from "@/lib/constants";

export default function VehicleSlotBookingAliasPage() {
  redirect(ROUTES.VEHICLE_SLOTS);
}
