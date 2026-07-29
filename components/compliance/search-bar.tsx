"use client";

import { SearchBar as CommonSearchBar } from "@/components/common/search-bar";
import { cn } from "@/lib/utils";

interface ComplianceSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function SearchBar({
  value,
  onChange,
  className,
}: ComplianceSearchBarProps) {
  return (
    <CommonSearchBar
      value={value}
      onChange={onChange}
      placeholder="Search certifications..."
      className={cn("w-full max-w-xs lg:max-w-sm", className)}
    />
  );
}
