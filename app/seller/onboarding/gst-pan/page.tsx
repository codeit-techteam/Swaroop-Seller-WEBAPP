"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { ROUTES } from "@/lib/constants";

export default function GstPanPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(ROUTES.ONBOARDING_COMPANY);
  }, [router]);

  return null;
}
