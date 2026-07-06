"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button, Field, Input, Select, Spinner } from "@/components/ui";
import { BUSINESS_CATEGORIES } from "@/lib/types";

const REQUIRED = [
  "business_name",
  "owner_name",
  "phone",
  "business_category",
  "market_location",
  "state",
  "lga",
  "email",
] as const;

export function SignupForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const get = (k: string) => String(fd.get(k) ?? "").trim();
    const email = get("email");
    const phone = get("phone");
    const password = String(fd.get("password") ?? "");

    // Every field is required.
    if (REQUIRED.some((f) => !get(f))) {
      setError("Please fill in every field before creating your account.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    // Friendly, up-front uniqueness checks for email + phone.
    try {
      const [emailRes, phoneRes] = await Promise.all([
        supabase.rpc("email_available", { p_email: email }),
        supabase.rpc("phone_available", { p_phone: phone }),
      ]);
      if (emailRes.data === false) {
        setError("This email is already registered. Try logging in instead.");
        setLoading(false);
        return;
      }
      if (phoneRes.data === false) {
        setError("This phone number is already registered to another account.");
        setLoading(false);
        return;
      }
    } catch {
      // If the checks are unavailable, continue — signUp still guards the email.
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          business_name: get("business_name"),
          owner_name: get("owner_name"),
          phone,
          business_category: get("business_category"),
          market_location: get("market_location"),
          state: get("state"),
          lga: get("lga"),
          language: get("language"),
          currency: get("currency"),
        },
      },
    });

    if (error) {
      setError(
        /already registered|already exists/i.test(error.message)
          ? "This email is already registered. Try logging in instead."
          : error.message,
      );
      setLoading(false);
      return;
    }
    if (data.session) {
      router.replace("/dashboard");
      router.refresh();
      return;
    }
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
      <p className="mt-1 text-sm text-content-muted">All fields are required.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate={false}>
        <Field label="Business name" htmlFor="business_name" required>
          <Input id="business_name" name="business_name" required maxLength={120} placeholder="e.g. Amina Foodstuff Store" />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Owner name" htmlFor="owner_name" required>
            <Input id="owner_name" name="owner_name" required maxLength={120} placeholder="Full name" />
          </Field>
          <Field label="Phone" htmlFor="phone" required>
            <Input id="phone" name="phone" type="tel" required maxLength={20} placeholder="080..." />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Category" htmlFor="business_category" required>
            <Select id="business_category" name="business_category" required defaultValue="">
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
          <Field label="Market / location" htmlFor="market_location" required>
            <Input id="market_location" name="market_location" required maxLength={120} placeholder="e.g. Kurmi Market" />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="State" htmlFor="state" required>
            <Input id="state" name="state" required maxLength={60} placeholder="e.g. Kano" />
          </Field>
          <Field label="LGA" htmlFor="lga" required>
            <Input id="lga" name="lga" required maxLength={60} placeholder="Local govt. area" />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Language" htmlFor="language" required>
            <Select id="language" name="language" defaultValue="en">
              <option value="en">English</option>
              <option value="ha">Hausa</option>
            </Select>
          </Field>
          <Field label="Currency" htmlFor="currency" required>
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
            <Input id="email" name="email" type="email" required maxLength={160} autoComplete="email" placeholder="you@example.com" />
          </Field>
          <Field label="Password" htmlFor="password" required hint="Min. 6 characters">
            <Input id="password" name="password" type="password" required minLength={6} maxLength={72} autoComplete="new-password" />
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
