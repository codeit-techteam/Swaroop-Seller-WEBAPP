"use client";

import { Button } from "@/components/ui/button";

export default function ShipmentsError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-xl font-semibold">Unable to load shipments.</h1>
      <p className="max-w-md text-sm text-slate-500">
        Dispatch records for this location could not be loaded. Retry the
        request without leaving the Seller Portal.
      </p>
      <Button onClick={reset}>Retry</Button>
    </div>
  );
}
