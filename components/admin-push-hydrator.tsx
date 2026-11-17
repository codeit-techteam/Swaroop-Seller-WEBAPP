"use client";

import { useEffect } from "react";
import toast from "react-hot-toast";

import { hydrateAdminPushInbox } from "@/lib/admin-push";
import { useAuthStore } from "@/store/authStore";

const POLL_MS = 20_000;

export function AdminPushHydrator() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;

    const pull = async (announce: boolean) => {
      const added = await hydrateAdminPushInbox();
      if (!cancelled && announce && added > 0) {
        toast.success(
          added === 1
            ? "New notification from PolyStoreX Admin"
            : `${added} new notifications from PolyStoreX Admin`,
        );
      }
    };

    void pull(false);
    const timer = window.setInterval(() => {
      void pull(true);
    }, POLL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [isAuthenticated]);

  return null;
}
