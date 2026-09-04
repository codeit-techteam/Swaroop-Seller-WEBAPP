"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold">Unable to load this page.</h1>
      <p className="text-muted-foreground">
        An unexpected error occurred in the Seller Portal. Please try again.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
