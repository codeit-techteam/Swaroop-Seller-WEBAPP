"use client";

import { OperationsShell } from "@/components/operations";
import { CURRENT_USER } from "@/config";
import { useAuthStore } from "@/store/authStore";

export function SettingsView() {
  const user = useAuthStore((s) => s.user);

  return (
    <OperationsShell
      title="Seller settings"
      subtitle="Workspace preferences for the PetroTrade Seller Portal."
    >
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <p className="text-sm font-semibold text-slate-900">
          {user?.name ?? CURRENT_USER.name}
        </p>
        <p className="text-sm text-slate-500">Seller Account</p>
      </div>
    </OperationsShell>
  );
}
