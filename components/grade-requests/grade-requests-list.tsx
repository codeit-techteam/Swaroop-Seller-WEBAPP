"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { AlertCircle, ClipboardList, FilePlus2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { PageContainer } from "@/components/common/page-container";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/lib/constants";
import {
  GRADE_REQUESTS_QUERY_KEY,
  gradeRequestPath,
  isAwaitingSellerResponse,
  listGradeRequests,
} from "@/services/grade-requests";

import { GradeRequestStatusBadge } from "./status-badge";

const PAGE_SIZE = 20;

export function GradeRequestsList() {
  const query = useInfiniteQuery({
    queryKey: [...GRADE_REQUESTS_QUERY_KEY, "list"],
    staleTime: 0,
    queryFn: ({ pageParam }) => listGradeRequests(pageParam, PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.meta.page < last.meta.totalPages ? last.meta.page + 1 : undefined,
  });

  const items = useMemo(
    () => query.data?.pages.flatMap((p) => p.items) ?? [],
    [query.data],
  );
  const loading = query.isPending;
  const loadingMore = query.isFetchingNextPage;
  const error = query.isError
    ? query.error instanceof Error
      ? query.error.message
      : "Unable to load grade requests."
    : null;

  const requestAction = (
    <Button asChild>
      <Link href={ROUTES.GRADE_REQUESTS_NEW}>
        <FilePlus2 className="h-4 w-4" aria-hidden />
        Request new grade
      </Link>
    </Button>
  );

  return (
    <PageContainer className="max-w-4xl">
      <PageHeader
        title="Grade Requests"
        description="Track grades you asked us to add to the Grade Master so you can list and offer them."
        breadcrumbs={[
          { label: "My Products", href: ROUTES.PRODUCTS },
          { label: "Grade Requests" },
        ]}
        actions={requestAction}
      />

      {loading ? (
        <div className="space-y-3" aria-busy="true" aria-label="Loading">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : error && items.length === 0 ? (
        <ErrorState
          icon={AlertCircle}
          title="Unable to load grade requests"
          description={error}
          onRetry={() => void query.refetch()}
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No grade requests yet"
          description="If a grade you sell isn't in the Grade Master, request it. Once it's added you can list it from Add Grade."
          action={requestAction}
        />
      ) : (
        <>
          <ul className="space-y-3">
            {items.map((r) => (
              <li key={r.id}>
                <Link
                  href={gradeRequestPath(r.id)}
                  className="block rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold text-slate-900">
                        {r.gradeName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {r.referenceNumber}
                        {r.manufacturer ? ` · ${r.manufacturer}` : ""} ·{" "}
                        {r.quantity} {r.unit}
                      </p>
                    </div>
                    <GradeRequestStatusBadge
                      status={r.status}
                      label={r.statusLabel}
                    />
                  </div>
                  {isAwaitingSellerResponse(r) ? (
                    <p className="mt-2 rounded-md bg-orange-50 px-3 py-1.5 text-xs font-medium text-orange-800">
                      We need more information from you.
                    </p>
                  ) : null}
                  <p className="mt-2 text-xs text-slate-400">
                    Submitted{" "}
                    {new Date(r.submittedAt).toLocaleDateString("en-IN")}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
          {error ? (
            <p role="alert" className="mt-3 text-center text-sm text-red-600">
              {error}
            </p>
          ) : null}
          {query.hasNextPage ? (
            <div className="mt-4 text-center">
              <Button
                variant="outline"
                disabled={loadingMore}
                onClick={() => void query.fetchNextPage()}
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    Loading…
                  </>
                ) : (
                  "Load more"
                )}
              </Button>
            </div>
          ) : null}
        </>
      )}
    </PageContainer>
  );
}
