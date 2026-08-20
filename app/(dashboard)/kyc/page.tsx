import { Suspense } from "react";

import { createRouteMetadata } from "@/components/common";
import { KycView } from "@/modules/kyc";

export const metadata = createRouteMetadata("KYC", "KYC verification desk");

export default function KycPage() {
  return (
    <Suspense>
      <KycView />
    </Suspense>
  );
}
