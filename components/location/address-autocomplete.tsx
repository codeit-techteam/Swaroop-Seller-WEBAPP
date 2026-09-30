"use client";

import { Loader2, MapPin, Search, X } from "lucide-react";
import { useEffect, useId, useState } from "react";

import { useAddressAutocomplete } from "@/hooks/use-address-autocomplete";
import { cn } from "@/lib/utils";
import {
  formatDistance,
  type LocationServiceError,
  type LocationSuggestion,
  type NormalizedLocation,
} from "@/services/location-search";

export function AddressAutocomplete({
  onSelect,
  onError,
  near,
  placeholder = "Search area, street, landmark or PIN",
  autoFocus = false,
  disabled = false,
  attribution = "Powered by Google",
  className,
}: {
  onSelect: (location: NormalizedLocation) => void;
  onError?: (error: LocationServiceError) => void;
  near?: { latitude: number; longitude: number } | null;
  placeholder?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  attribution?: string | null;
  className?: string;
}) {
  const listId = useId();
  const {
    query,
    setQuery,
    suggestions,
    status,
    error,
    resolvingPlaceId,
    minLength,
    selectSuggestion,
    reset,
  } = useAddressAutocomplete({ near, enabled: !disabled });
  const [highlight, setHighlight] = useState<{
    list: LocationSuggestion[];
    index: number;
  }>({ list: suggestions, index: 0 });
  const activeIndex = !suggestions.length
    ? -1
    : highlight.list === suggestions
      ? highlight.index
      : 0;
  const setActiveIndex = (next: number | ((current: number) => number)) =>
    setHighlight({
      list: suggestions,
      index: typeof next === "function" ? next(activeIndex) : next,
    });

  useEffect(() => {
    if (error) onError?.(error);
  }, [error, onError]);

  const trimmed = query.trim();
  const showPanel = trimmed.length >= minLength;
  const busy = status === "loading" || Boolean(resolvingPlaceId);

  async function choose(suggestion: LocationSuggestion) {
    if (resolvingPlaceId) return;
    try {
      const location = await selectSuggestion(suggestion);
      reset();
      onSelect(location);
    } catch {
      // Error state is rendered from the hook.
    }
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" && suggestions.length) {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % suggestions.length);
    } else if (event.key === "ArrowUp" && suggestions.length) {
      event.preventDefault();
      setActiveIndex(
        (index) => (index - 1 + suggestions.length) % suggestions.length,
      );
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      const suggestion = suggestions[activeIndex];
      if (suggestion) void choose(suggestion);
    } else if (event.key === "Escape" && query) {
      event.preventDefault();
      event.stopPropagation();
      reset();
    }
  }

  const activeId =
    activeIndex >= 0 && suggestions[activeIndex]
      ? `${listId}-${activeIndex}`
      : undefined;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          role="combobox"
          aria-expanded={showPanel && suggestions.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={activeId}
          aria-busy={busy}
          aria-label="Search for an address"
          autoComplete="off"
          spellCheck={false}
          autoFocus={autoFocus}
          disabled={disabled}
          value={query}
          placeholder={placeholder}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={onKeyDown}
          className="flex h-11 w-full rounded-xl border border-input bg-background pl-9 pr-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        />
        <span className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center">
          {busy ? (
            <Loader2
              className="mr-1 h-4 w-4 animate-spin text-slate-400"
              aria-hidden
            />
          ) : query ? (
            <button
              type="button"
              onClick={reset}
              className="rounded-md p-1 text-slate-400 hover:text-slate-600"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </span>
      </div>

      {showPanel ? (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          {suggestions.length > 0 ? (
            <ul
              id={listId}
              role="listbox"
              aria-label="Address suggestions"
              className="max-h-72 divide-y divide-slate-100 overflow-y-auto"
            >
              {suggestions.map((suggestion, index) => {
                const distance = formatDistance(suggestion.distanceMeters);
                const resolving = resolvingPlaceId === suggestion.placeId;
                return (
                  <li
                    key={suggestion.placeId}
                    id={`${listId}-${index}`}
                    role="option"
                    aria-selected={index === activeIndex}
                    onMouseEnter={() => setActiveIndex(index)}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => void choose(suggestion)}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 px-3 py-2.5 text-left",
                      index === activeIndex && "bg-[#1B6EF3]/5",
                      resolvingPlaceId && !resolving && "opacity-60",
                    )}
                  >
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                      {resolving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <MapPin className="h-4 w-4" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-slate-900">
                        {suggestion.primaryText}
                      </span>
                      {suggestion.secondaryText ? (
                        <span className="mt-0.5 block truncate text-xs text-slate-500">
                          {suggestion.secondaryText}
                        </span>
                      ) : null}
                    </span>
                    {distance ? (
                      <span className="mt-1 shrink-0 text-[11px] text-slate-400">
                        {distance}
                      </span>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p
              id={listId}
              role="status"
              className="px-3 py-4 text-center text-xs text-slate-500"
            >
              {status === "loading"
                ? "Searching…"
                : status === "error"
                  ? (error?.message ?? "Unable to load suggestions.")
                  : status === "ready"
                    ? "No matching places. Try a nearby landmark or PIN code."
                    : "Searching…"}
            </p>
          )}
          {error && suggestions.length > 0 ? (
            <p
              role="alert"
              className="border-t border-slate-100 px-3 py-2 text-xs text-amber-700"
            >
              {error.message}
            </p>
          ) : null}
          {attribution ? (
            <p className="border-t border-slate-100 bg-slate-50 px-3 py-1.5 text-right text-[10px] font-medium text-slate-400">
              {attribution}
            </p>
          ) : null}
        </div>
      ) : trimmed.length > 0 ? (
        <p className="px-1 text-[11px] text-slate-400">
          Keep typing to see suggestions
        </p>
      ) : null}
    </div>
  );
}
