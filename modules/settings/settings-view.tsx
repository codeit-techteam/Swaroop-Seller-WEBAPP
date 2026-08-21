"use client";

import { OperationsShell } from "@/components/operations";
import { CURRENT_USER, ROLE_LABELS } from "@/config";
import { ROLE_PERMISSIONS } from "@/config/permissions";
import { useAuthStore } from "@/store/authStore";

export function SettingsView() {
  const role = useAuthStore((s) => s.user?.role ?? CURRENT_USER.role);
  const permissions = ROLE_PERMISSIONS[role];

  return (
    <OperationsShell
      title="System settings"
      subtitle="Role-based access for the ADMIN PANEL control center. Customer APP/WEB only receive published data."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Current session
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-900">
            {CURRENT_USER.name}
          </p>
          <p className="text-sm text-slate-500">{ROLE_LABELS[role]}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Publishing rule
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Catalog, banners, offers and homepage sections stay hidden from
            customers until status is LIVE. Internal cost, margin and seller
            comparison never leave this panel.
          </p>
        </div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <p className="text-sm font-semibold text-slate-900">
          Permissions for {ROLE_LABELS[role]}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {permissions.map((permission) => (
            <span
              key={permission}
              className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600"
            >
              {permission}
            </span>
          ))}
        </div>
      </div>
    </OperationsShell>
  );
}
