"use client";

import { MessageSquareWarning, XCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { ROUTES } from "@/lib/constants";
import {
  fetchSellerVerificationStatus,
  type SellerVerificationStatus,
} from "@/services/seller-verification";
import { useAuthStore } from "@/store/authStore";

/** Dashboard-wide prompt when the admin team sent verification back to the seller. */
export function VerificationBanner() {
  const pathname = usePathname();
  const authReady = useAuthStore((s) => s.hasHydrated && s.isAuthenticated);
  const [status, setStatus] = useState<SellerVerificationStatus | null>(null);

  useEffect(() => {
    if (!authReady) return;
    let cancelled = false;
    const refresh = () => {
      fetchSellerVerificationStatus()
        .then((next) => {
          if (!cancelled) setStatus(next);
        })
        .catch(() => undefined);
    };
    refresh();
    window.addEventListener("focus", refresh);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", refresh);
    };
  }, [authReady, pathname]);

  if (!status?.canResubmit || pathname.startsWith(ROUTES.VERIFICATION))
    return null;

  const rejected = !status.changeRequest;
  const reason = status.changeRequest?.reason ?? status.rejectedReason;

  return (
    <div
      className={
        rejected
          ? "flex flex-wrap items-center gap-3 border-b border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-900"
          : "flex flex-wrap items-center gap-3 border-b border-amber-300 bg-amber-50 px-4 py-2.5 text-sm text-amber-900"
      }
    >
      {rejected ? (
        <XCircle className="h-4 w-4 shrink-0" />
      ) : (
        <MessageSquareWarning className="h-4 w-4 shrink-0" />
      )}
      <p className="min-w-0 flex-1">
        <span className="font-semibold">
          {rejected
            ? "Verification rejected."
            : "PetroTrade requested changes to your verification."}
        </span>{" "}
        {reason ? <span className="line-clamp-1">{reason}</span> : null}
      </p>
      <Link
        href={ROUTES.VERIFICATION}
        className="shrink-0 rounded-md bg-[#0B1F3A] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0B1F3A]/90"
      >
        {rejected ? "Review & resubmit" : "Update documents"}
      </Link>
    </div>
  );
}
