"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { type ReactNode, useCallback, useMemo, useRef, useState } from "react";

import { SearchSelect, type SelectOption } from "@/components/import/import-ui";
import { Label } from "@/components/ui/label";
import {
  fetchSellerGradeFacets,
  searchSellerGrades,
  sellerGradeHint,
  sellerGradeLabel,
  type SellerGradeOption,
} from "@/services/catalog";

const gradeCategoryId = (grade: SellerGradeOption | null) =>
  grade?.category?.id ?? grade?.categoryId ?? "";

/**
 * Category -> Grade Group -> Grade picker backed by the central Grade Master
 * (ACTIVE + seller-visible grades only). Filters never contradict the selected
 * grade: narrowing to a different category or group clears the selection.
 * Initial filters are taken from `selectedGrade` at mount.
 */
export function GradeMasterPicker({
  selectedGrade,
  fallbackLabel,
  onSelect,
  error,
  notice,
}: {
  selectedGrade: SellerGradeOption | null;
  /** Label for a saved grade that can no longer be loaded from the Grade Master. */
  fallbackLabel?: string | null;
  onSelect: (grade: SellerGradeOption | null) => void;
  error?: string;
  notice?: ReactNode;
}) {
  const [categoryId, setCategoryId] = useState(() =>
    gradeCategoryId(selectedGrade),
  );
  const [gradeGroup, setGradeGroup] = useState(
    () => selectedGrade?.gradeGroup ?? "",
  );
  const gradeResults = useRef(new Map<string, SellerGradeOption>());

  const facets = useQuery({
    queryKey: ["seller", "grade-facets", categoryId],
    queryFn: () =>
      fetchSellerGradeFacets({ categoryId: categoryId || undefined }),
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });

  const categoryOptions = useMemo<SelectOption[]>(
    () =>
      (facets.data?.categories ?? []).map((c) => ({
        value: c.id,
        label: c.displayName || c.name,
        hint: `${c.gradeCount} grades`,
      })),
    [facets.data?.categories],
  );

  const gradeGroupOptions = useMemo<SelectOption[]>(
    () =>
      categoryId && !facets.isPlaceholderData
        ? (facets.data?.gradeGroups ?? []).map((g) => ({
            value: g.name,
            label: g.name,
            hint: `${g.gradeCount}`,
          }))
        : [],
    [categoryId, facets.data?.gradeGroups, facets.isPlaceholderData],
  );

  const loadGrades = useCallback(
    async (search: string) => {
      const items = await searchSellerGrades(search, {
        categoryId: categoryId || undefined,
        gradeGroup: gradeGroup || undefined,
      });
      for (const item of items) gradeResults.current.set(item.id, item);
      return items.map((item) => ({
        value: item.id,
        label: sellerGradeLabel(item),
        hint: sellerGradeHint(item),
      }));
    },
    [categoryId, gradeGroup],
  );

  const changeCategory = (value: string | null) => {
    const next = value ?? "";
    setCategoryId(next);
    setGradeGroup("");
    if (selectedGrade && gradeCategoryId(selectedGrade) !== next) {
      onSelect(null);
    }
  };

  const changeGradeGroup = (value: string | null) => {
    const next = value ?? "";
    setGradeGroup(next);
    if (selectedGrade && next && selectedGrade.gradeGroup !== next) {
      onSelect(null);
    }
  };

  const changeGrade = (value: string | null) => {
    const grade = value ? (gradeResults.current.get(value) ?? null) : null;
    if (grade) {
      setCategoryId(gradeCategoryId(grade));
      setGradeGroup(grade.gradeGroup ?? "");
    }
    onSelect(grade);
  };

  const selectedCategoryLabel =
    categoryOptions.find((o) => o.value === categoryId)?.label ??
    (selectedGrade && gradeCategoryId(selectedGrade) === categoryId
      ? selectedGrade.category?.displayName || selectedGrade.category?.name
      : null);

  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
      <div>
        <h2 className="text-sm font-semibold text-slate-800">Grade Master</h2>
        <p className="mt-1 text-xs text-slate-500">
          Pick a category and grade group to narrow the search, then select the
          grade. Grade identity comes from the central Grade Master and cannot
          be edited here.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-1.5">
          <Label className="text-[13px] font-medium text-slate-700">
            Category
          </Label>
          <SearchSelect
            value={categoryId}
            selectedLabel={selectedCategoryLabel}
            options={categoryOptions}
            onChange={changeCategory}
            placeholder={
              facets.isLoading ? "Loading categories…" : "All categories"
            }
          />
          {facets.isError ? (
            <p className="text-xs text-red-600">
              Unable to load categories.{" "}
              <button
                type="button"
                className="font-medium underline"
                onClick={() => void facets.refetch()}
              >
                Retry
              </button>
            </p>
          ) : null}
        </div>
        <div className="space-y-1.5">
          <Label className="text-[13px] font-medium text-slate-700">
            Grade Group
          </Label>
          <SearchSelect
            value={gradeGroup}
            selectedLabel={gradeGroup || null}
            options={gradeGroupOptions}
            onChange={changeGradeGroup}
            disabled={!categoryId}
            placeholder={
              categoryId ? "All grade groups" : "Select a category first"
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[13px] font-medium text-slate-700">
            Grade<span className="ml-0.5 text-red-500">*</span>
          </Label>
          <SearchSelect
            value={selectedGrade?.id ?? (fallbackLabel ? "__saved" : "")}
            selectedLabel={
              selectedGrade ? sellerGradeLabel(selectedGrade) : fallbackLabel
            }
            placeholder="Search grade no., manufacturer or name"
            queryKey={["seller", "grade-master", categoryId, gradeGroup]}
            load={loadGrades}
            onChange={changeGrade}
            invalid={Boolean(error)}
          />
          {error ? <p className="text-xs text-red-600">{error}</p> : null}
        </div>
      </div>
      {notice}
      {selectedGrade ? (
        <dl className="grid gap-x-6 gap-y-3 rounded-lg border border-slate-200 bg-white p-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [
              "Category / Polymer Type",
              selectedGrade.category?.displayName ||
                selectedGrade.category?.name,
            ],
            ["Grade Group", selectedGrade.gradeGroup],
            ["Grade No.", selectedGrade.gradeNo],
            ["Manufacturer", selectedGrade.manufacturer],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                {label}
              </dt>
              <dd className="mt-0.5 text-sm text-slate-800">{value || "—"}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </section>
  );
}
