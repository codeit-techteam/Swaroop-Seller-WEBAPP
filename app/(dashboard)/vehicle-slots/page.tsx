import { Suspense } from "react";

import { createRouteMetadata } from "@/components/common";
import { SellerVehicleSlotsView } from "@/modules/seller-vehicle-slots";
import { VehicleSlotSkeleton } from "@/modules/seller-vehicle-slots/skeleton";

export const metadata = createRouteMetadata(
  "Vehicle Slots",
  "Manage vehicle booking and loading appointments",
);

export default function VehicleSlotsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6">
          <VehicleSlotSkeleton />
        </div>
      }
    >
      <SellerVehicleSlotsView />
    </Suspense>
  );
}
