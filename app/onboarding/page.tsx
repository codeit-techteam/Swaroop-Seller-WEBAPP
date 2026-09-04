import { redirect } from "next/navigation";

import { ROUTES } from "@/lib/constants";

export default async function OnboardingIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string }>;
}) {
  const params = await searchParams;
  const suffix = params.preview === "1" ? "?preview=1" : "";
  redirect(`${ROUTES.ONBOARDING_COMPANY}${suffix}`);
}
