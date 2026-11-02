"use client";

import { canAccess } from "@/config";
import { useAuthStore } from "@/store/authStore";

/**
 * Creating a grade request is a write to /seller/grade-requests, which the
 * backend gates with `procurement.manage` (reads need `procurement.view`).
 * Entry-point CTAs are hidden for seller managers who lack it.
 */
export function useCanRequestGrade(): boolean {
  const user = useAuthStore((s) => s.user);
  if (Array.isArray(user?.permissions)) {
    return user.permissions.includes("procurement.manage");
  }
  return canAccess(user?.role ?? "SELLER", "procurement.manage");
}
