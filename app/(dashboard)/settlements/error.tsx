"use client";

import { Button } from "@/components/ui/button";

export default function SettlementsError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-xl font-semibold">Unable to load settlements.</h1>
      <p className="max-w-md text-sm text-slate-500">
        Receivables against your invoices could not be loaded. Retry to fetch
        the latest settlement records.
      </p>
      <Button onClick={reset}>Retry</Button>
    </div>
  );
}
