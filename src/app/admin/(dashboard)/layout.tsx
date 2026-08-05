import Link from "next/link";
import { ExternalLink, LogOut } from "lucide-react";
import { auth } from "@/lib/auth";
import { adminLogoutAction } from "@/lib/actions/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Logo } from "@/components/layout/Logo";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="flex min-h-screen bg-silver-100/60">
      <aside className="hidden w-64 shrink-0 bg-[#071129] lg:block">
        <div className="border-b border-white/10 p-5">
          <div className="[&_span]:text-white [&_span.text-brand-600]:text-brand-400">
            <Logo href="/admin" />
          </div>
        </div>
        <AdminSidebar />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-surface/90 px-4 py-3 backdrop-blur sm:px-6">
          <div className="lg:hidden">
            <Logo size="sm" href="/admin" />
          </div>
          <div className="hidden text-sm text-muted lg:block">Admin Console</div>
          <div className="flex items-center gap-3">
            <Link href="/" target="_blank" className="flex items-center gap-1.5 text-xs font-medium text-muted hover:text-brand-600">
              View storefront <ExternalLink className="size-3.5" />
            </Link>
            <div className="hidden text-right sm:block">
              <p className="text-xs font-semibold text-foreground">{session?.user?.name}</p>
              <p className="text-[10px] text-muted">{session?.user?.role}</p>
            </div>
            <form action={adminLogoutAction}>
              <button type="submit" aria-label="Log out" className="flex size-9 items-center justify-center rounded-full text-muted hover:bg-red-50 hover:text-danger">
                <LogOut className="size-4" />
              </button>
            </form>
          </div>
        </header>

        <div className="lg:hidden">
          <div className="overflow-x-auto bg-[#071129]">
            <AdminSidebar />
          </div>
        </div>

        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
