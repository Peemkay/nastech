import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function Container({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("container-page", className)}>{children}</div>;
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div className={cn("mb-10", align === "center" && "text-center mx-auto max-w-2xl", className)}>
      {eyebrow && <p className="mb-2 text-sm font-semibold tracking-wide text-brand-600 uppercase">{eyebrow}</p>}
      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{title}</h2>
      {subtitle && <p className="mt-3 text-muted text-base leading-relaxed">{subtitle}</p>}
    </div>
  );
}

export function EmptyState({ icon, title, subtitle, action }: { icon?: ReactNode; title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-silver-100/40 px-6 py-16 text-center">
      {icon && <div className="mb-4 text-silver-500">{icon}</div>}
      <p className="text-base font-semibold text-foreground">{title}</p>
      {subtitle && <p className="mt-1.5 max-w-sm text-sm text-muted">{subtitle}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Divider({ className }: { className?: string }) {
  return <div className={cn("h-px w-full bg-border", className)} />;
}
