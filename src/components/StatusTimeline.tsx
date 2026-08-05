import { CheckCircle2, Circle } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

export type TimelineEvent = { status: string; note?: string | null; createdAt: Date | string };

export function StatusTimeline({
  events,
  statusLabels,
}: {
  events: TimelineEvent[];
  statusLabels: Record<string, string>;
}) {
  if (events.length === 0) {
    return <p className="text-sm text-muted">No status updates yet.</p>;
  }

  return (
    <ol className="relative ml-3 border-l-2 border-border">
      {events.map((event, idx) => {
        const isLatest = idx === events.length - 1;
        return (
          <li key={idx} className="relative pb-8 pl-6 last:pb-0">
            <span
              className={cn(
                "absolute -left-[11px] top-0 flex size-5 items-center justify-center rounded-full bg-surface",
                isLatest ? "text-brand-600" : "text-silver-400",
              )}
            >
              {isLatest ? <CheckCircle2 className="size-5" /> : <Circle className="size-4 fill-silver-200" />}
            </span>
            <p className={cn("text-sm font-semibold", isLatest ? "text-brand-700" : "text-foreground")}>
              {statusLabels[event.status] ?? event.status}
            </p>
            <p className="mt-0.5 text-xs text-muted">{formatDateTime(event.createdAt)}</p>
            {event.note && <p className="mt-1 text-sm text-muted">{event.note}</p>}
          </li>
        );
      })}
    </ol>
  );
}
