import type { Metadata } from "next";

import {
  createRouteMetadata,
  RoutePlaceholder,
} from "@/components/common/route-placeholder";

export const metadata: Metadata = createRouteMetadata(
  "Login",
  "Sign in to your account",
);

export default function LoginPage() {
  return (
    <RoutePlaceholder title="Login" description="Sign in to your account" />
  );
}
