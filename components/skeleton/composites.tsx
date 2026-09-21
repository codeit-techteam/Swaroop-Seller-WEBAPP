import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type ClassNameProps = {
  className?: string;
};

export function SkeletonText({
  className,
  lines = 1,
  widths,
}: ClassNameProps & {
  lines?: number;
  widths?: Array<string | number>;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className="h-4"
          style={{
            width:
              widths?.[index] ??
              (index === lines - 1 && lines > 1 ? "66%" : "100%"),
          }}
        />
      ))}
    </div>
  );
}

export function SkeletonCircle({
  className,
  size = 40,
}: ClassNameProps & { size?: number }) {
  return (
    <Skeleton
      className={cn("shrink-0 rounded-full", className)}
      style={{ width: size, height: size }}
    />
  );
}

export function SkeletonAvatar({
  className,
  size = 48,
  withText = true,
}: ClassNameProps & { size?: number; withText?: boolean }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <SkeletonCircle size={size} />
      {withText ? (
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      ) : null}
    </div>
  );
}

export function SkeletonStatsCard({ className }: ClassNameProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white p-4 shadow-soft",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-3 w-28" />
        </div>
        <Skeleton className="h-9 w-9 rounded-lg" />
      </div>
    </div>
  );
}

export function SkeletonForm({
  className,
  fields = 6,
}: ClassNameProps & { fields?: number }) {
  return (
    <div
      className={cn(
        "space-y-5 rounded-xl border border-slate-200 bg-white p-6",
        className,
      )}
    >
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <div className="flex justify-end gap-3 pt-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-28" />
      </div>
    </div>
  );
}

export function SkeletonDetails({
  className,
  rows = 6,
}: ClassNameProps & { rows?: number }) {
  return (
    <div
      className={cn(
        "space-y-4 rounded-xl border border-slate-200 bg-white p-5",
        className,
      )}
    >
      <div className="space-y-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-3 w-56" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-4 w-36" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonTimeline({
  className,
  steps = 4,
}: ClassNameProps & { steps?: number }) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: steps }).map((_, index) => (
        <div key={index} className="flex gap-3">
          <div className="flex flex-col items-center">
            <SkeletonCircle size={20} />
            {index < steps - 1 ? (
              <Skeleton className="mt-1 h-8 w-0.5 rounded-full" />
            ) : null}
          </div>
          <div className="flex-1 space-y-2 pb-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonBanner({ className }: ClassNameProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-slate-200 bg-white p-6",
        className,
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 space-y-3">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full max-w-md" />
          <Skeleton className="h-4 w-2/3 max-w-sm" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}
