"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/lib/constants";
import { apiClient } from "@/services/apiClient";
import { useAuthStore } from "@/store/authStore";

export default function ChangePasswordPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setSession = useAuthStore((s) => s.setSession);
  const tokens = useAuthStore((s) => s.tokens);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <h1 className="text-2xl font-semibold text-slate-900">
        Change your password
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        {user?.loginId ? `Login ID ${user.loginId}. ` : ""}
        This temporary password must be replaced before the seller panel opens.
      </p>
      <form
        className="mt-6 space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          setBusy(true);
          void apiClient
            .post("/auth/change-password", { currentPassword, newPassword })
            .then(() => {
              if (user) {
                setSession({ ...user, mustChangePassword: false }, tokens);
              }
              toast.success("Password updated. Sign in again.");
              useAuthStore.getState().logout();
              router.push(ROUTES.LOGIN);
            })
            .catch(() => {
              toast.error(
                "Could not change password. Check the current password.",
              );
            })
            .finally(() => setBusy(false));
        }}
      >
        <Input
          type="password"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          placeholder="Current password"
          autoComplete="current-password"
        />
        <Input
          type="password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          placeholder="New password"
          autoComplete="new-password"
        />
        <Button type="submit" className="w-full" disabled={busy}>
          Update password
        </Button>
      </form>
    </main>
  );
}
