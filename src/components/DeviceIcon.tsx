import { Smartphone, Laptop, Tablet, Watch, Headphones, Gamepad2, type LucideProps } from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS: Record<string, React.ComponentType<LucideProps>> = {
  smartphone: Smartphone,
  laptop: Laptop,
  tablet: Tablet,
  watch: Watch,
  headphones: Headphones,
  "gamepad-2": Gamepad2,
};

export function DeviceIcon({ icon, className }: { icon: string; className?: string }) {
  const Icon = ICONS[icon] ?? Smartphone;
  return <Icon className={className} />;
}

/** Gradient placeholder "photo" for products/models that have no real image yet. */
export function DeviceImagePlaceholder({
  icon,
  grade,
  className,
}: {
  icon: string;
  grade?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-brand-50 via-silver-100 to-brand-100",
        className,
      )}
    >
      <DeviceIcon icon={icon} className="size-[38%] text-brand-600/70" />
      {grade && (
        <span className="absolute bottom-2 left-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-brand-700 shadow-sm">
          {grade}
        </span>
      )}
    </div>
  );
}
