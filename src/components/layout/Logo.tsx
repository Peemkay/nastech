import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ size = "md", href = "/" }: { size?: "sm" | "md" | "lg"; href?: string | null }) {
  const dims = { sm: 28, md: 34, lg: 44 }[size];
  const text = { sm: "text-lg", md: "text-xl", lg: "text-2xl" }[size];

  const content = (
    <span className="inline-flex items-center gap-2 select-none">
      <Image src="/logo-icon.png" alt="" width={dims} height={dims} priority className="shrink-0" />
      <span className={cn("font-extrabold tracking-tight", text)}>
        <span className="text-brand-600">NAS</span>
        <span className="text-silver-700">TECH</span>
      </span>
    </span>
  );

  if (!href) return content;
  return (
    <Link href={href} className="inline-flex items-center">
      {content}
    </Link>
  );
}
