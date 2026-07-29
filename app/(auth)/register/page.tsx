import type { Metadata } from "next";

import {
  createRouteMetadata,
  RoutePlaceholder,
} from "@/components/common/route-placeholder";

export const metadata: Metadata = createRouteMetadata(
  "Register",
  "Create a seller account",
);

export default function RegisterPage() {
  return (
    <RoutePlaceholder title="Register" description="Create a seller account" />
  );
}
