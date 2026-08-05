import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardBody } from "@/components/ui/Card";

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = "brand",
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
  tone?: "brand" | "success" | "warning" | "silver";
}) {
  const toneClasses = {
    brand: "bg-brand-50 text-brand-600",
    success: "bg-green-50 text-green-600",
    warning: "bg-amber-50 text-amber-600",
    silver: "bg-silver-100 text-silver-600",
  }[tone];

  return (
    <Card>
      <CardBody className="flex items-center gap-4">
        <span className={cn("flex size-12 shrink-0 items-center justify-center rounded-2xl", toneClasses)}>
          <Icon className="size-5.5" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-xl font-extrabold text-foreground">{value}</p>
          <p className="text-xs text-muted">{label}</p>
          {hint && <p className="mt-0.5 text-[11px] text-silver-500">{hint}</p>}
        </div>
      </CardBody>
    </Card>
  );
}
