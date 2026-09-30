"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/lib/constants";
import { apiClient } from "@/services/apiClient";

function AcceptInviteForm() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <h1 className="text-2xl font-semibold text-slate-900">
        Set your Seller Manager password
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        This link works once. Choose a password with at least 8 characters,
        including uppercase, lowercase, and a number.
      </p>
      <form
        className="mt-6 space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          if (password !== confirm) {
            toast.error("Passwords do not match");
            return;
          }
          setBusy(true);
          void apiClient
            .post("/auth/password/reset", { token, newPassword: password })
            .then(() => {
              toast.success("Password saved. Sign in with your Login ID.");
              router.push(ROUTES.LOGIN);
            })
            .catch((error: unknown) => {
              const message =
                error && typeof error === "object" && "message" in error
                  ? String((error as { message?: string }).message)
                  : "Unable to set password";
              toast.error(message);
            })
            .finally(() => setBusy(false));
        }}
      >
        <Input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="New password"
          autoComplete="new-password"
        />
        <Input
          type="password"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          placeholder="Confirm password"
          autoComplete="new-password"
        />
        <Button type="submit" className="w-full" disabled={busy || !token}>
          {token ? "Activate account" : "Invitation token missing"}
        </Button>
      </form>
    </main>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense>
      <AcceptInviteForm />
    </Suspense>
  );
}
