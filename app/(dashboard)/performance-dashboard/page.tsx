import type { Metadata } from "next";

import { PerformanceDashboardView } from "@/modules/performance";

export const metadata: Metadata = {
  title: "Seller Performance Dashboard | PetroTrade Seller",
  description:
    "Operational oversight and strategic trade metrics for seller performance analytics.",
};

export default function PerformanceDashboardPage() {
  return <PerformanceDashboardView />;
}
