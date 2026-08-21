import type { Metadata } from "next";

import { DispatchOperationsView } from "@/modules/dispatch";

export const metadata: Metadata = {
  title: "Dispatch Operations | PetroTrade ADMIN PANEL",
  description:
    "Manage dispatch workflow from payment approval to shipment release",
};

export default function DispatchPage() {
  return <DispatchOperationsView />;
}
