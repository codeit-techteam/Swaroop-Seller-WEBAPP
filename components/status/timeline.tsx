import { cn } from "@/lib/utils";

export function Timeline({
  steps,
}: {
  steps: { id: string; label: string; status: string; at?: string }[];
}) {
  return (
    <ol className="space-y-3">
      {steps.map((step, index) => (
        <li key={step.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span
              className={cn(
                "mt-0.5 h-2.5 w-2.5 rounded-full",
                step.status === "completed" && "bg-emerald-500",
                step.status === "current" && "bg-[#1B6EF3]",
                step.status === "pending" && "bg-slate-300",
              )}
            />
            {index < steps.length - 1 ? (
              <span className="mt-1 w-px flex-1 bg-slate-200" />
            ) : null}
          </div>
          <div className="pb-3">
            <p className="text-sm font-medium text-slate-800">{step.label}</p>
            {step.at ? (
              <p className="text-xs text-slate-500">
                {new Date(step.at).toLocaleString("en-IN")}
              </p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
