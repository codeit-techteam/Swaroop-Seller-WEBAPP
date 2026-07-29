import { redirect } from "next/navigation";

import { ROUTES } from "@/lib/constants";

export default function AnalyticsPage() {
  redirect(ROUTES.PERFORMANCE_DASHBOARD);
}
