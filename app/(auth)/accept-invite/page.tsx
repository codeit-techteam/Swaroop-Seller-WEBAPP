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
          if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,128}$/.test(password)) {
            toast.error(
              "Use 8+ characters with uppercase, lowercase, and a number",
            );
            return;
          }
          if (password !== confirm) {
            toast.error("Passwords do not match");
            return;
          }
          setBusy(true);
          void apiClient
            .post("/auth/password/reset", { token, newPassword: password })
            .then((response: unknown) => {
              const message = serverMessage(response);
              if (message && /not active/i.test(message)) {
                toast.error(message);
                return;
              }
              toast.success("Password saved. Sign in with your Login ID.");
              router.push(ROUTES.LOGIN);
            })
            .catch((error: unknown) => {
              toast.error(
                serverMessage((error as { response?: unknown })?.response) ??
                  "This invitation link is invalid or has expired. Ask your administrator for a new one.",
              );
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

function serverMessage(response: unknown): string | null {
  const body = (response as { data?: unknown })?.data ?? response;
  const nested = (body as { data?: { message?: unknown } })?.data?.message;
  const message = nested ?? (body as { message?: unknown })?.message;
  if (Array.isArray(message)) return message.join(". ");
  return typeof message === "string" && message.trim() ? message : null;
}

export default function AcceptInvitePage() {
  return (
    <Suspense>
      <AcceptInviteForm />
    </Suspense>
  );
}
