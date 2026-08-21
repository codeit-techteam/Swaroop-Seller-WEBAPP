"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { ROUTES } from "@/lib/constants";

export default function LocationPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(ROUTES.ONBOARDING_REVIEW);
  }, [router]);

  return null;
}
