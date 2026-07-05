"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button, Field, Input, Spinner } from "@/components/ui";

export function ForgotForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/reset-password`,
    });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div>
        <h1 className="font-display text-2xl font-extrabold">Check your email</h1>
        <p className="mt-3 rounded-lg bg-lime/15 px-3 py-3 text-sm text-content">
          If an account exists for <strong>{email}</strong>, we&apos;ve sent a link to reset your
          password.
        </p>
        <Link href="/login" className="mt-6 inline-block text-sm font-medium underline underline-offset-4">
          Back to log in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold">Reset your password</h1>
      <p className="mt-1 text-sm text-content-muted">
        Enter your email and we&apos;ll send you a reset link.
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <Field label="Email address" htmlFor="email">
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </Field>
        {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Spinner /> : "Send reset link"}
        </Button>
      </form>
      <Link href="/login" className="mt-4 inline-block text-sm text-content-muted hover:text-content">
        Back to log in
      </Link>
    </div>
  );
}
