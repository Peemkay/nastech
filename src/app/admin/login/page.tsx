import type { Metadata } from "next";
import { AlertCircle, ShieldCheck } from "lucide-react";
import { adminLoginAction } from "@/lib/actions/auth";
import { Card, CardBody } from "@/components/ui/Card";
import { Label, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/layout/Logo";
import { Container } from "@/components/ui/Misc";

export const metadata: Metadata = { title: "Admin Login" };

const ERROR_MESSAGES: Record<string, string> = {
  "1": "Incorrect email or password.",
  "2": "This account does not have admin access.",
};

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const sp = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#071129] px-4">
      <Container className="max-w-md">
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="[&_span]:text-white [&_span.text-brand-600]:text-brand-400">
            <Logo size="lg" href={null} />
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-brand-300">
            <ShieldCheck className="size-3.5" /> Admin Console
          </span>
        </div>
        <Card>
          <CardBody>
            <p className="text-center text-lg font-bold text-foreground">Sign in to admin</p>
            <p className="mt-1 text-center text-sm text-muted">Staff access only.</p>

            {sp.error && (
              <p className="mt-4 flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">
                <AlertCircle className="size-4 shrink-0" /> {ERROR_MESSAGES[sp.error] ?? "Something went wrong."}
              </p>
            )}

            <form action={adminLoginAction} className="mt-6">
              <div className="mb-4">
                <Label required>Email address</Label>
                <Input type="email" name="email" required placeholder="admin@nastech.ng" />
              </div>
              <div className="mb-2">
                <Label required>Password</Label>
                <Input type="password" name="password" required placeholder="••••••••" />
              </div>
              <Button type="submit" fullWidth size="lg" className="mt-4">
                Sign In
              </Button>
            </form>
          </CardBody>
        </Card>
      </Container>
    </div>
  );
}
