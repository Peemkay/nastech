import { SearchX } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { LinkButton } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 px-4 text-center">
      <Logo size="lg" />
      <span className="flex size-16 items-center justify-center rounded-full bg-brand-50 text-brand-600">
        <SearchX className="size-8" />
      </span>
      <div>
        <p className="text-2xl font-extrabold text-foreground">Page not found</p>
        <p className="mt-2 max-w-sm text-sm text-muted">
          The page you&apos;re looking for doesn&apos;t exist or may have moved.
        </p>
      </div>
      <div className="flex gap-3">
        <LinkButton href="/">Back to home</LinkButton>
        <LinkButton href="/shop" variant="secondary">Shop devices</LinkButton>
      </div>
    </div>
  );
}
