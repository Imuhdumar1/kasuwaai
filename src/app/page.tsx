import Link from "next/link";
import {
  Mic,
  Bell,
  LayoutDashboard,
  BarChart3,
  Sparkles,
  Languages,
  ArrowRight,
  Check,
} from "lucide-react";
import { Logo } from "@/components/logo";

export const metadata = {
  title: "KasuwaAI — Sales & Debt Tracking for Your Business",
  description:
    "Turn your notebook into a simple digital record. Track sales, customers, debts and payments, record sales by voice in English or Hausa, and never forget who owes you money.",
};

const FEATURES = [
  {
    icon: Mic,
    title: "Record sales by voice",
    body: "Speak naturally in English, Hausa, or both. KasuwaAI turns it into a sale you can edit and save — no typing needed.",
  },
  {
    icon: Bell,
    title: "Never forget a debt",
    body: "Every unpaid sale is tracked automatically. See who's overdue and send a friendly reminder by WhatsApp or SMS in one tap.",
  },
  {
    icon: LayoutDashboard,
    title: "Live business dashboard",
    body: "Today's sales, outstanding debt, best products, top customers and a health score — all updating as you record.",
  },
  {
    icon: BarChart3,
    title: "Reports you can share",
    body: "Sales, profit, debt, customer and product reports — download as CSV, PDF or Word for your records or your accountant.",
  },
  {
    icon: Sparkles,
    title: "AI business assistant",
    body: "Ask “Who owes me money?” or “What's my profit this week?” and get answers from your real data, in English or Hausa.",
  },
  {
    icon: Languages,
    title: "Built for your shop",
    body: "English & Hausa, works on any phone, and starts free. Made for traders, market sellers and small businesses.",
  },
];

const STEPS = [
  { n: "01", title: "Record a sale", body: "Type it in seconds or just speak — pick the customer, product, amount and how much was paid." },
  { n: "02", title: "Debts track themselves", body: "Unpaid balances become debts automatically, sorted by overdue, due today and upcoming." },
  { n: "03", title: "Send reminders, get paid", body: "One tap sends a polite reminder on WhatsApp or SMS. Record the payment and your books stay perfect." },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-bg text-content">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-line bg-bg/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <nav className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="rounded-lg px-3 py-2 text-sm font-medium text-content-muted hover:text-content"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-paper transition-colors hover:bg-ink/90"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pb-14 pt-14 sm:px-6 sm:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-content-muted">
            <span className="h-2 w-2 rounded-full bg-lime" /> Sales · Debts · Reminders · Voice
          </div>
          <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
            Stop forgetting. <br />
            <span className="text-lime-dark">Start tracking.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-content-muted sm:text-lg">
            KasuwaAI replaces your notebook with a simple digital record of every sale, customer,
            debt and payment — and helps you recover the money you&apos;re owed.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-lime px-6 py-3.5 font-semibold text-ink transition-colors hover:bg-lime-bright sm:w-auto"
            >
              Get started free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-surface px-6 py-3.5 font-semibold text-content transition-colors hover:bg-surface-2 sm:w-auto"
            >
              Log in
            </Link>
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-content-muted">
            <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-lime-dark" /> Free to start</span>
            <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-lime-dark" /> Works on any phone</span>
            <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-lime-dark" /> English &amp; Hausa</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-line bg-surface/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              Everything your shop needs, in one place
            </h2>
            <p className="mt-3 text-content-muted">
              No spreadsheets. No forgotten debts. Just clear records you can act on.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-2xl border border-line bg-surface p-6 shadow-card">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-lime/20 text-ink">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-content-muted">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">How it works</h2>
          <p className="mt-3 text-content-muted">Three simple steps to clean books and fewer forgotten debts.</p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="relative rounded-2xl border border-line bg-surface p-6">
              <div className="font-display text-3xl font-extrabold text-lime-dark">{s.n}</div>
              <h3 className="mt-2 font-display text-lg font-bold">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-content-muted">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="overflow-hidden rounded-3xl bg-ink px-6 py-14 text-center text-paper sm:px-12">
          <h2 className="mx-auto max-w-2xl font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            Get your business records in order today
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-paper/70">
            Join the traders and shop owners keeping cleaner books and recovering more of what
            they&apos;re owed — for free.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-lime px-6 py-3.5 font-semibold text-ink transition-colors hover:bg-lime-bright"
          >
            Create your free account <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-content-muted sm:flex-row sm:px-6">
          <Logo />
          <div className="flex items-center gap-5">
            <Link href="/login" className="hover:text-content">Log in</Link>
            <Link href="/signup" className="hover:text-content">Get started</Link>
          </div>
          <p>© {new Date().getFullYear()} KasuwaAI</p>
        </div>
      </footer>
    </div>
  );
}
