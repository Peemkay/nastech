import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function StepIndicator({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="mx-auto mb-10 flex max-w-2xl items-center">
      {steps.map((label, i) => {
        const state = i < current ? "done" : i === current ? "active" : "todo";
        return (
          <li key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-full text-xs font-bold transition",
                  state === "done" && "bg-brand-600 text-white",
                  state === "active" && "bg-brand-600 text-white ring-4 ring-brand-100",
                  state === "todo" && "bg-silver-200 text-silver-600",
                )}
              >
                {state === "done" ? <Check className="size-4" /> : i + 1}
              </span>
              <span
                className={cn(
                  "text-center text-[11px] font-medium",
                  state === "active" ? "block" : "hidden sm:block",
                  state === "todo" ? "text-muted" : "text-foreground",
                )}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={cn("mx-2 h-0.5 flex-1 rounded-full transition", state === "done" ? "bg-brand-600" : "bg-silver-200")} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
