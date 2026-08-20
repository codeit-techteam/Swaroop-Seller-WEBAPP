import { redirect } from "next/navigation";

import { ROUTES } from "@/lib/constants";

/** Procurement Workbench is temporarily hidden from the frontend. */
export default function ProcurementPage() {
  redirect(ROUTES.DASHBOARD);
}
