"use client";

import { OnboardingLocationForm } from "@/components/onboarding/location-form";
import { ROUTES } from "@/lib/constants";

export default function OnboardingLocationsPage() {
  return (
    <OnboardingLocationForm
      title="Locations"
      subtitle="Add the registered address and any other stock points you sell from."
      nextRoute={ROUTES.ONBOARDING_BANK}
      nextStep="bank"
    />
  );
}
