"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { AlertCircle, MessageSquareText, ShieldCheck } from "lucide-react";
import { Label, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type Mode = "register" | "login" | "otp";

export function InlineAuthGate({ onSuccess, defaultMode = "register" }: { onSuccess: () => void; defaultMode?: "register" | "login" }) {
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const [pendingId, setPendingId] = useState<string | null>(null);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  async function handleLogin() {
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", { identifier, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Incorrect email/phone or password.");
      return;
    }
    onSuccess();
  }

  async function handleStartRegister() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/auth/register/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, password: regPassword }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Could not start registration");
      return;
    }
    setPendingId(data.pendingId);
    setDevOtp(data.devOtp ?? null);
    setMode("otp");
    setResendCooldown(60);
    tickCooldown();
  }

  function tickCooldown() {
    const interval = setInterval(() => {
      setResendCooldown((s) => {
        if (s <= 1) {
          clearInterval(interval);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }

  async function handleVerify() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/auth/register/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pendingId, code }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Could not verify code");
      return;
    }
    onSuccess();
  }

  async function handleResend() {
    if (resendCooldown > 0) return;
    setError(null);
    const res = await fetch("/api/auth/register/resend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pendingId }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not resend code");
      return;
    }
    setDevOtp(data.devOtp ?? null);
    setResendCooldown(60);
    tickCooldown();
  }

  if (mode === "otp") {
    return (
      <div>
        <span className="mx-auto mb-3 flex size-11 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <MessageSquareText className="size-5" />
        </span>
        <p className="text-center text-sm font-semibold text-foreground">Verify your phone number</p>
        <p className="mt-1 text-center text-sm text-muted">We sent a 6-digit code to {phone}</p>

        {devOtp && (
          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-center text-xs text-amber-700 ring-1 ring-inset ring-amber-200">
            Test mode — verification code: <span className="font-mono font-bold">{devOtp}</span>
          </p>
        )}

        <div className="mt-4">
          <Label required>6-digit code</Label>
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="123456"
            inputMode="numeric"
            className="text-center text-lg tracking-[0.5em]"
          />
        </div>
        {error && (
          <p className="mt-3 flex items-center gap-1.5 text-sm text-danger">
            <AlertCircle className="size-4 shrink-0" /> {error}
          </p>
        )}
        <Button fullWidth className="mt-4" onClick={handleVerify} loading={loading} disabled={code.length !== 6}>
          Verify & Continue
        </Button>
        <button
          type="button"
          onClick={handleResend}
          disabled={resendCooldown > 0}
          className="mt-3 w-full text-center text-xs font-medium text-brand-600 hover:underline disabled:text-muted disabled:no-underline"
        >
          {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend code"}
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5 flex rounded-full bg-silver-100 p-1">
        <button
          type="button"
          onClick={() => { setMode("register"); setError(null); }}
          className={cn("flex-1 rounded-full py-2 text-xs font-semibold transition", mode === "register" ? "bg-white shadow-sm text-brand-700" : "text-muted")}
        >
          Create account
        </button>
        <button
          type="button"
          onClick={() => { setMode("login"); setError(null); }}
          className={cn("flex-1 rounded-full py-2 text-xs font-semibold transition", mode === "login" ? "bg-white shadow-sm text-brand-700" : "text-muted")}
        >
          I have an account
        </button>
      </div>

      {mode === "login" ? (
        <div className="space-y-4">
          <div>
            <Label required>Email or phone number</Label>
            <Input value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="Email or phone number" />
          </div>
          <div>
            <Label required>Password</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
          </div>
          {error && (
            <p className="flex items-center gap-1.5 text-sm text-danger">
              <AlertCircle className="size-4 shrink-0" /> {error}
            </p>
          )}
          <Button fullWidth onClick={handleLogin} loading={loading} disabled={!identifier || !password}>
            Log In & Continue
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="flex items-start gap-2 rounded-lg bg-brand-50 px-3 py-2.5 text-xs text-brand-700">
            <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
            We verify your phone number before scheduling a pickup, to keep both sides of every trade-in safe.
          </p>
          <div>
            <Label required>Full name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
          </div>
          <div>
            <Label required>Email or phone number</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email or phone number" type="email" />
          </div>
          <div>
            <Label required>Phone number</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="080X XXX XXXX" />
          </div>
          <div>
            <Label required>Password</Label>
            <Input type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} placeholder="Password" minLength={6} />
          </div>
          {error && (
            <p className="flex items-center gap-1.5 text-sm text-danger">
              <AlertCircle className="size-4 shrink-0" /> {error}
            </p>
          )}
          <Button fullWidth onClick={handleStartRegister} loading={loading} disabled={!name || !email || !phone || regPassword.length < 6}>
            Send Verification Code
          </Button>
        </div>
      )}
    </div>
  );
}
