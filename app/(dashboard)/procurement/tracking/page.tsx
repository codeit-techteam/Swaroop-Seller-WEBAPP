import { createRouteMetadata } from "@/components/common";
import { ProcurementTrackingView } from "@/modules/procurement";

export const metadata = createRouteMetadata(
  "Procurement Tracking",
  "Track procurement lifecycle from request to dispatch",
);

export default function ProcurementTrackingPage() {
  return <ProcurementTrackingView />;
}
