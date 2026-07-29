import type { Metadata } from "next";

import {
  createRouteMetadata,
  RoutePlaceholder,
} from "@/components/common/route-placeholder";

export const metadata: Metadata = createRouteMetadata(
  "Forgot Password",
  "Reset your password",
);

export default function ForgotPasswordPage() {
  return (
    <RoutePlaceholder
      title="Forgot Password"
      description="Reset your password"
    />
  );
}
