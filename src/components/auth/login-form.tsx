"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button, Field, Input, Spinner } from "@/components/ui";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  // Supabase says "Email not confirmed" when the account exists but was never verified.
  const needsConfirm = !!error && /confirm|verif/i.test(error);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResent(false);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    router.replace("/dashboard");
    router.refresh();
  }

  async function resendConfirmation() {
    if (!email) {
      setError("Enter your email address first, then resend.");
      return;
    }
    setResending(true);
    setResent(false);
    const supabase = createClient();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/confirm` },
    });
    setResending(false);
    if (error) {
      setError(error.message);
      return;
    }
    setError(null);
    setResent(true);
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold">Welcome back</h1>
      <p className="mt-1 text-sm text-content-muted">Log in to manage your business records.</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <Field label="Email address" htmlFor="email">
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </Field>
        <Field label="Password" htmlFor="password">
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </Field>

        {error && (
          <div className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
            <p>{error}</p>
            {needsConfirm && (
              <button
                type="button"
                onClick={resendConfirmation}
                disabled={resending}
                className="mt-1.5 font-semibold underline underline-offset-2 hover:opacity-80"
              >
                {resending ? "Sending…" : "Resend confirmation email"}
              </button>
            )}
          </div>
        )}

        {resent && (
          <p className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
            Confirmation email sent. Check your inbox (and spam) to verify your account.
          </p>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Spinner /> : "Log in"}
        </Button>
      </form>

      <div className="mt-4 flex items-center justify-between text-sm">
        <Link href="/forgot-password" className="text-content-muted hover:text-content">
          Forgot password?
        </Link>
        <Link href="/signup" className="font-medium text-ink underline-offset-4 hover:underline dark:text-lime">
          Create account
        </Link>
      </div>
    </div>
  );
}
