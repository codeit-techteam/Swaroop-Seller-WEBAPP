import type { Metadata } from "next";

import { VehicleSlotBookingView } from "@/modules/dispatch";

export const metadata: Metadata = {
  title: "Vehicle Slot Booking | PetroTrade ADMIN PANEL",
  description:
    "Manage warehouse loading appointments and transporter scheduling",
};

export default function VehicleSlotBookingPage() {
  return <VehicleSlotBookingView />;
}
