import { redirect } from "next/navigation";

import { ROUTES } from "@/lib/constants";

export default function AdminRedirectPage() {
  redirect(ROUTES.DASHBOARD);
}

export { AdminRedirectPage };
