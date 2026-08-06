import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { loginAction } from "@/lib/actions/auth";
import { Container } from "@/components/ui/Misc";
import { Card, CardBody } from "@/components/ui/Card";
import { Label, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/layout/Logo";

export const metadata: Metadata = { title: "Login" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; callbackUrl?: string }> }) {
  const sp = await searchParams;
  const callbackUrl = sp.callbackUrl || "/account";

  return (
    <Container className="max-w-md py-16">
      <div className="mb-8 flex justify-center">
        <Logo size="lg" />
      </div>
      <Card>
        <CardBody>
          <p className="text-center text-lg font-bold text-foreground">Welcome back</p>
          <p className="mt-1 text-center text-sm text-muted">Log in to track orders, sell requests and manage your account.</p>

          {sp.error && (
            <p className="mt-4 flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">
              <AlertCircle className="size-4 shrink-0" /> Incorrect email/phone or password. Please try again.
            </p>
          )}

          <form action={loginAction} className="mt-6">
            <input type="hidden" name="callbackUrl" value={callbackUrl} />
            <div className="mb-4">
              <Label required>Email or phone number</Label>
              <Input name="identifier" required placeholder="Email or phone number" />
            </div>
            <div className="mb-2">
              <Label required>Password</Label>
              <Input type="password" name="password" required placeholder="Password" />
            </div>
            <Button type="submit" fullWidth size="lg" className="mt-4">
              Log In
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-muted">
            Don&apos;t have an account?{" "}
            <Link href={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="font-semibold text-brand-600 hover:underline">
              Sign up
            </Link>
          </p>
        </CardBody>
      </Card>

      <p className="mt-6 text-center text-xs text-muted">
        Are you a NASTECH staff member?{" "}
        <Link href="/admin/login" className="font-medium text-brand-600 hover:underline">
          Admin login
        </Link>
      </p>
    </Container>
  );
}
