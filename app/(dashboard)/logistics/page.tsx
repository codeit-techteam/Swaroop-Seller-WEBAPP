import { createRouteMetadata } from "@/components/common";
import { LogisticsHubView } from "@/modules/logistics";

export const metadata = createRouteMetadata(
  "Logistics",
  "Dispatch, tracking and reservation hub",
);

export default function LogisticsPage() {
  return <LogisticsHubView />;
}
