"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/Misc";
import { Card, CardBody } from "@/components/ui/Card";
import { Logo } from "@/components/layout/Logo";
import { InlineAuthGate } from "@/components/InlineAuthGate";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/account";

  return (
    <Container className="max-w-md py-16">
      <div className="mb-8 flex justify-center">
        <Logo size="lg" />
      </div>
      <Card>
        <CardBody>
          <p className="text-center text-lg font-bold text-foreground">Create your account</p>
          <p className="mt-1 mb-6 text-center text-sm text-muted">Sign up to track your orders, sell requests and repairs in one place.</p>

          <InlineAuthGate defaultMode="register" onSuccess={() => router.push(callbackUrl)} />

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

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
