"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { PageContainer } from "@/components/common/page-container";
import { PageHeader } from "@/components/common/page-header";
import {
  searchSellerRecords,
  type SellerSearchHit,
} from "@/lib/repositories/search";

function SearchResults() {
  const params = useSearchParams();
  const q = (params.get("q") ?? "").trim();
  const [resolved, setResolved] = useState<{
    query: string;
    hits: SellerSearchHit[];
  }>({ query: "", hits: [] });

  useEffect(() => {
    if (q.length < 2) return;
    let cancelled = false;
    searchSellerRecords(q).then((hits) => {
      if (!cancelled) setResolved({ query: q, hits });
    });
    return () => {
      cancelled = true;
    };
  }, [q]);

  const results = q.length < 2 ? [] : resolved.query === q ? resolved.hits : [];

  return (
    <PageContainer>
      <PageHeader
        title="Search"
        description={q ? `Results for “${q}”` : "Type at least 2 characters"}
      />
      <div className="space-y-2">
        {results.map((item) => (
          <Link
            key={`${item.category}-${item.id}`}
            href={item.href}
            className="flex items-center justify-between rounded-lg border bg-white px-4 py-3 hover:border-[#1B6EF3]"
          >
            <span>
              <span className="block font-medium">{item.title}</span>
              <span className="block text-xs text-slate-500">
                {item.subtitle}
              </span>
            </span>
            <span className="text-xs text-slate-400">{item.category}</span>
          </Link>
        ))}
        {q.length >= 2 && results.length === 0 ? (
          <p className="text-sm text-slate-500">
            No matching grades, offers, orders, requests, shipments or
            settlements.
          </p>
        ) : null}
      </div>
    </PageContainer>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchResults />
    </Suspense>
  );
}
