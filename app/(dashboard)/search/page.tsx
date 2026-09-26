"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

import { PageContainer } from "@/components/common/page-container";
import { PageHeader } from "@/components/common/page-header";
import {
  searchSellerRecords,
  type SellerSearchCategory,
  type SellerSearchHit,
} from "@/lib/repositories/search";

function SearchResults() {
  const params = useSearchParams();
  const q = (params.get("q") ?? "").trim();
  const [searching, setSearching] = useState(false);
  const [resolved, setResolved] = useState<{
    query: string;
    hits: SellerSearchHit[];
  }>({ query: "", hits: [] });

  useEffect(() => {
    if (q.length < 2) return;
    let cancelled = false;
    // Async search — loading flag must sync when query changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetch
    setSearching(true);
    searchSellerRecords(q)
      .then((hits) => {
        if (!cancelled) setResolved({ query: q, hits });
      })
      .finally(() => {
        if (!cancelled) setSearching(false);
      });
    return () => {
      cancelled = true;
    };
  }, [q]);

  const results = useMemo(
    () => (q.length < 2 ? [] : resolved.query === q ? resolved.hits : []),
    [q, resolved],
  );

  const grouped = useMemo(() => {
    const map = new Map<SellerSearchCategory, SellerSearchHit[]>();
    results.forEach((hit) => {
      const list = map.get(hit.category) ?? [];
      list.push(hit);
      map.set(hit.category, list);
    });
    return map;
  }, [results]);

  return (
    <PageContainer>
      <PageHeader
        title="Universal Search"
        description={
          q
            ? `Results for “${q}” across Seller ERP modules`
            : "Search products, inventory, offers, orders, dispatch, finance, workbench and documents"
        }
      />
      {q.length < 2 ? (
        <p className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500">
          Type at least two characters in the top search bar.
        </p>
      ) : searching && results.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500">
          Searching across Seller ERP…
        </p>
      ) : results.length === 0 ? (
        <p className="text-sm text-slate-500">
          No matching products, inventory, offers, requests, orders, logistics,
          finance, workbench or documents.
        </p>
      ) : (
        <div className="space-y-5">
          {Array.from(grouped.entries()).map(([category, items]) => (
            <section
              key={category}
              className="rounded-xl border border-slate-200 bg-white p-4"
            >
              <h2 className="text-sm font-semibold text-slate-900">
                {category}
                <span className="ml-2 text-xs font-normal text-slate-400">
                  {items.length}
                </span>
              </h2>
              <div className="mt-2 divide-y divide-slate-100">
                {items.map((item) => (
                  <Link
                    key={`${item.category}-${item.id}`}
                    href={item.href}
                    className="block py-2 hover:bg-slate-50"
                  >
                    <p className="text-sm font-medium text-[#1B6EF3]">
                      {item.title}
                    </p>
                    <p className="text-xs text-slate-500">{item.subtitle}</p>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
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
