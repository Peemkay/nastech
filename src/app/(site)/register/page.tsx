import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { registerAction } from "@/lib/actions/auth";
import { Container } from "@/components/ui/Misc";
import { Card, CardBody } from "@/components/ui/Card";
import { Label, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/layout/Logo";

export const metadata: Metadata = { title: "Create an account" };

const ERROR_MESSAGES: Record<string, string> = {
  invalid: "Please check your details and try again — password must be at least 6 characters.",
  exists: "An account with this email already exists. Try logging in instead.",
};

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ error?: string; callbackUrl?: string }> }) {
  const sp = await searchParams;
  const callbackUrl = sp.callbackUrl || "/account";

  return (
    <Container className="max-w-md py-16">
      <div className="mb-8 flex justify-center">
        <Logo size="lg" />
      </div>
      <Card>
        <CardBody>
          <p className="text-center text-lg font-bold text-foreground">Create your account</p>
          <p className="mt-1 text-center text-sm text-muted">Sign up to track your orders and sell requests in one place.</p>

          {sp.error && (
            <p className="mt-4 flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">
              <AlertCircle className="size-4 shrink-0" /> {ERROR_MESSAGES[sp.error] ?? "Something went wrong. Please try again."}
            </p>
          )}

          <form action={registerAction} className="mt-6">
            <input type="hidden" name="callbackUrl" value={callbackUrl} />
            <div className="mb-4">
              <Label required>Full name</Label>
              <Input name="name" required placeholder="Chidinma Okafor" />
            </div>
            <div className="mb-4">
              <Label required>Email address</Label>
              <Input type="email" name="email" required placeholder="you@example.com" />
            </div>
            <div className="mb-4">
              <Label>Phone number</Label>
              <Input name="phone" placeholder="080X XXX XXXX" />
            </div>
            <div className="mb-2">
              <Label required>Password</Label>
              <Input type="password" name="password" required minLength={6} placeholder="At least 6 characters" />
            </div>
            <Button type="submit" fullWidth size="lg" className="mt-4">
              Create Account
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-muted">
            Already have an account?{" "}
            <Link href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="font-semibold text-brand-600 hover:underline">
              Log in
            </Link>
          </p>
        </CardBody>
      </Card>
    </Container>
  );
}
