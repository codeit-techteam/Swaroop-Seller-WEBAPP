"use client";

import { OnboardingLocationForm } from "@/components/onboarding/location-form";
import { ROUTES } from "@/lib/constants";

export default function OnboardingLocationPage() {
  return (
    <OnboardingLocationForm
      title="Location"
      subtitle="Add the registered address and any other stock points you sell from."
      nextRoute={ROUTES.ONBOARDING_REVIEW}
      nextStep="review"
    />
  );
}
