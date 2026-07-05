"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button, Field, Input, Select, Spinner } from "@/components/ui";
import { BUSINESS_CATEGORIES } from "@/lib/types";

export function SignupForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email"));
    const password = String(fd.get("password"));

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          business_name: fd.get("business_name"),
          owner_name: fd.get("owner_name"),
          phone: fd.get("phone"),
          business_category: fd.get("business_category"),
          market_location: fd.get("market_location"),
          state: fd.get("state"),
          lga: fd.get("lga"),
          language: fd.get("language"),
          currency: fd.get("currency"),
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    if (data.session) {
      router.replace("/dashboard");
      router.refresh();
      return;
    }
    // Email confirmation is enabled on this project.
    setMessage("Account created! Check your email to confirm, then log in.");
    setLoading(false);
  }

  if (message) {
    return (
      <div>
        <h1 className="font-display text-2xl font-extrabold">Almost there</h1>
        <p className="mt-3 rounded-lg bg-lime/15 px-3 py-3 text-sm text-content">{message}</p>
        <Link href="/login" className="mt-6 inline-block text-sm font-medium underline underline-offset-4">
          Back to log in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold">Create your account</h1>
      <p className="mt-1 text-sm text-content-muted">Set up your business in a minute.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <Field label="Business name" htmlFor="business_name" required>
          <Input id="business_name" name="business_name" required placeholder="e.g. Amina Foodstuff Store" />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Owner name" htmlFor="owner_name">
            <Input id="owner_name" name="owner_name" placeholder="Full name" />
          </Field>
          <Field label="Phone" htmlFor="phone">
            <Input id="phone" name="phone" type="tel" placeholder="080..." />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Category" htmlFor="business_category">
            <Select id="business_category" name="business_category" defaultValue="">
              <option value="" disabled>
                Select…
              </option>
              {BUSINESS_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Market / location" htmlFor="market_location">
            <Input id="market_location" name="market_location" placeholder="e.g. Kurmi Market" />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="State" htmlFor="state">
            <Input id="state" name="state" placeholder="e.g. Kano" />
          </Field>
          <Field label="LGA" htmlFor="lga">
            <Input id="lga" name="lga" placeholder="Local govt. area" />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Language" htmlFor="language">
            <Select id="language" name="language" defaultValue="en">
              <option value="en">English</option>
              <option value="ha">Hausa</option>
            </Select>
          </Field>
          <Field label="Currency" htmlFor="currency">
            <Select id="currency" name="currency" defaultValue="NGN">
              <option value="NGN">₦ Naira (NGN)</option>
              <option value="USD">$ Dollar (USD)</option>
              <option value="GHS">GH₵ Cedi (GHS)</option>
              <option value="KES">KSh Shilling (KES)</option>
            </Select>
          </Field>
        </div>

        <div className="my-2 h-px bg-line" />

        <div className="grid grid-cols-2 gap-3">
          <Field label="Email" htmlFor="email" required>
            <Input id="email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" />
          </Field>
          <Field label="Password" htmlFor="password" required hint="Min. 6 characters">
            <Input id="password" name="password" type="password" required minLength={6} autoComplete="new-password" />
          </Field>
        </div>

        {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Spinner /> : "Create account"}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-content-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-ink underline-offset-4 hover:underline dark:text-lime">
          Log in
        </Link>
      </p>
    </div>
  );
}
