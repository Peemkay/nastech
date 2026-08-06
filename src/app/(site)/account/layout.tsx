import Link from "next/link";
import { LayoutDashboard, Package, Repeat, User, LogOut, Wrench } from "lucide-react";
import { auth } from "@/lib/auth";
import { logoutAction } from "@/lib/actions/auth";
import { Container } from "@/components/ui/Misc";

const NAV = [
  { href: "/account", label: "Overview", icon: LayoutDashboard },
  { href: "/account/orders", label: "My Orders", icon: Package },
  { href: "/account/sell-requests", label: "Sell Requests", icon: Repeat },
  { href: "/account/repairs", label: "My Repairs", icon: Wrench },
  { href: "/account/profile", label: "Profile", icon: User },
];

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <Container className="grid gap-8 py-10 lg:grid-cols-[220px_1fr]">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="mb-4 rounded-2xl border border-border bg-surface p-4">
          <p className="text-sm font-semibold text-foreground">{session?.user?.name}</p>
          <p className="truncate text-xs text-muted">{session?.user?.email}</p>
        </div>
        <nav className="flex gap-1 overflow-x-auto rounded-2xl border border-border bg-surface p-2 lg:flex-col lg:overflow-visible">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/80 transition hover:bg-brand-50 hover:text-brand-700"
            >
              <item.icon className="size-4" /> {item.label}
            </Link>
          ))}
          <form action={logoutAction} className="lg:mt-1">
            <button type="submit" className="flex w-full shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-danger transition hover:bg-red-50">
              <LogOut className="size-4" /> Log out
            </button>
          </form>
        </nav>
      </aside>
      <div>{children}</div>
    </Container>
  );
}
