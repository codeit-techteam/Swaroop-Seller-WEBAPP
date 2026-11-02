import { Suspense } from "react";

import { createRouteMetadata } from "@/components/common";
import { PageContainer } from "@/components/common/page-container";
import { NewGradeRequestForm } from "@/components/grade-requests/new-grade-request-form";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = createRouteMetadata(
  "Request New Grade",
  "Ask PolyStoreX to add a grade that is not in the Grade Master",
);

export default function NewGradeRequestPage() {
  return (
    <Suspense
      fallback={
        <PageContainer className="max-w-3xl space-y-4">
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-64 rounded-xl" />
        </PageContainer>
      }
    >
      <NewGradeRequestForm />
    </Suspense>
  );
}
