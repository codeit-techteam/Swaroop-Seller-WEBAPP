"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import { ROUTES } from "@/lib/constants";
import {
  searchSellerRecords,
  type SellerSearchHit,
} from "@/lib/repositories/search";
import { cn } from "@/lib/utils";

export function SellerGlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [resolved, setResolved] = useState<{
    query: string;
    hits: SellerSearchHit[];
  }>({ query: "", hits: [] });
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounced = useDebounce(query, 180);
  const hits =
    query.trim().length < 2 || resolved.query !== debounced
      ? []
      : resolved.hits;

  useEffect(() => {
    let cancelled = false;
    if (debounced.trim().length < 2) return;
    searchSellerRecords(debounced).then((results) => {
      if (cancelled) return;
      setResolved({ query: debounced, hits: results });
      setActiveIndex(0);
      setOpen(true);
    });
    return () => {
      cancelled = true;
    };
  }, [debounced]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const goTo = (hit: SellerSearchHit) => {
    setOpen(false);
    setQuery("");
    router.push(hit.href);
  };

  const submitSearchPage = () => {
    const value = query.trim();
    if (value.length < 2) return;
    setOpen(false);
    router.push(`${ROUTES.SEARCH}?q=${encodeURIComponent(value)}`);
  };

  return (
    <div ref={containerRef} className="relative mx-auto w-full max-w-xl flex-1">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <Input
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          if (hits.length > 0) setOpen(true);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setActiveIndex((index) =>
              hits.length === 0 ? 0 : (index + 1) % hits.length,
            );
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActiveIndex((index) =>
              hits.length === 0 ? 0 : (index - 1 + hits.length) % hits.length,
            );
          } else if (event.key === "Enter") {
            event.preventDefault();
            const hit = hits[activeIndex];
            if (open && hit) goTo(hit);
            else submitSearchPage();
          } else if (event.key === "Escape") {
            setOpen(false);
          }
        }}
        placeholder="Search grades, offers, orders..."
        className="h-10 border-slate-200 bg-slate-50 pl-9 text-sm shadow-none focus-visible:ring-[#1B6EF3]"
        aria-label="Global search"
        aria-autocomplete="list"
        aria-expanded={open}
        role="combobox"
      />
      {open && query.trim().length >= 2 ? (
        <div
          role="listbox"
          className="absolute z-50 mt-1 max-h-80 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-elevated"
        >
          {hits.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-slate-500">
              No matching grades, offers, orders, shipments or settlements.
            </p>
          ) : (
            hits.slice(0, 12).map((hit, index) => (
              <button
                key={`${hit.category}-${hit.id}`}
                type="button"
                role="option"
                aria-selected={index === activeIndex}
                className={cn(
                  "flex w-full items-start justify-between gap-3 px-3 py-2 text-left",
                  index === activeIndex ? "bg-[#E8F1FF]" : "hover:bg-slate-50",
                )}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => goTo(hit)}
              >
                <span>
                  <span className="block text-sm font-medium text-slate-800">
                    {hit.title}
                  </span>
                  <span className="block text-xs text-slate-500">
                    {hit.subtitle}
                  </span>
                </span>
                <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  {hit.category}
                </span>
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
