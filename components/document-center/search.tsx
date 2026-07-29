"use client";

import { Search as SearchIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { DocumentFilters } from "@/types/documents";
import { SEARCH_FIELD_OPTIONS } from "@/types/documents";

interface SearchProps {
  search: string;
  searchField: DocumentFilters["searchField"];
  onSearchChange: (value: string) => void;
  onSearchFieldChange: (field: DocumentFilters["searchField"]) => void;
  className?: string;
}

export function Search({
  search,
  searchField,
  onSearchChange,
  onSearchFieldChange,
  className,
}: SearchProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 sm:flex-row sm:items-center",
        className,
      )}
    >
      <Select value={searchField} onValueChange={onSearchFieldChange}>
        <SelectTrigger className="h-9 w-full border-slate-200 bg-white sm:w-[160px]">
          <SelectValue placeholder="Search by" />
        </SelectTrigger>
        <SelectContent>
          {SEARCH_FIELD_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="relative flex-1">
        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={`Search by ${SEARCH_FIELD_OPTIONS.find((o) => o.value === searchField)?.label ?? "name"}…`}
          className="h-9 border-slate-200 bg-white pl-9"
        />
      </div>
    </div>
  );
}
