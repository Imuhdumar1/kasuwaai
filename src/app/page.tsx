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
import { Logo, LogoMark } from "@/components/logo";
import { Reveal } from "@/components/reveal";

export const metadata = {
  title: "KasuwaAI — Sales & Debt Tracking for Your Business",
  description:
    "Turn your notebook into a simple digital record. Track sales, customers, debts and payments, record sales by voice in English or Hausa, and never forget who owes you money.",
};

const FEATURES = [
  { icon: Mic, title: "Record sales by voice", body: "Speak naturally in English, Hausa, or both. KasuwaAI turns it into a sale you can edit and save — no typing needed." },
  { icon: Bell, title: "Never forget a debt", body: "Every unpaid sale is tracked automatically. See who's overdue and send a friendly reminder by WhatsApp or SMS in one tap." },
  { icon: LayoutDashboard, title: "Live business dashboard", body: "Today's sales, outstanding debt, best products, top customers and a health score — all updating as you record." },
  { icon: BarChart3, title: "Reports you can share", body: "Sales, profit, debt, customer and product reports — download as CSV, PDF or Word for your records or your accountant." },
  { icon: Sparkles, title: "AI business assistant", body: "Ask “Who owes me money?” or “What's my profit this week?” and get answers from your real data, in English or Hausa." },
  { icon: Languages, title: "Built for your shop", body: "English & Hausa, works on any phone, and starts free. Made for traders, market sellers and small businesses." },
];

const STEPS = [
  { n: "01", title: "Record a sale", body: "Type it in seconds or just speak — pick the customer, product, amount and how much was paid." },
  { n: "02", title: "Debts track themselves", body: "Unpaid balances become debts automatically, sorted by overdue, due today and upcoming." },
  { n: "03", title: "Send reminders, get paid", body: "One tap sends a polite reminder on WhatsApp or SMS. Record the payment and your books stay perfect." },
];

export default function Landing() {
  const year = new Date().getFullYear();
  return (
    <div className="min-h-screen bg-bg text-content">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-line bg-bg">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <nav className="flex items-center gap-2 sm:gap-3">
            <Link href="/login" className="rounded-lg px-3 py-2 text-sm font-medium text-content-muted hover:text-content">
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-paper transition-all hover:bg-ink/90 hover:shadow-soft"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* soft animated accent glow */}
        <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[36rem] max-w-[90vw] -translate-x-1/2 rounded-full bg-lime/20 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 pb-14 pt-14 sm:px-6 sm:pt-20">
          <div className="mx-auto max-w-3xl text-center">
            <Reveal>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-content-muted">
                <span className="h-2 w-2 animate-pulse rounded-full bg-lime" /> Sales · Debts · Reminders · Voice
              </div>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
                Stop forgetting. <br />
                <span className="text-lime-dark">Start tracking.</span>
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="mx-auto mt-5 max-w-xl text-base text-content-muted sm:text-lg">
                KasuwaAI replaces your notebook with a simple digital record of every sale, customer,
                debt and payment — and helps you recover the money you&apos;re owed.
              </p>
            </Reveal>
            <Reveal delay={240}>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/signup"
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-lime px-6 py-3.5 font-semibold text-ink transition-all hover:bg-lime-bright hover:shadow-soft sm:w-auto"
                >
                  Get started free
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-surface px-6 py-3.5 font-semibold text-content transition-colors hover:bg-surface-2 sm:w-auto"
                >
                  Log in
                </Link>
              </div>
            </Reveal>
            <Reveal delay={320}>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-content-muted">
                <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-lime-dark" /> Free to start</span>
                <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-lime-dark" /> Works on any phone</span>
                <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-lime-dark" /> English &amp; Hausa</span>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-line bg-surface/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              Everything your shop needs, in one place
            </h2>
            <p className="mt-3 text-content-muted">No spreadsheets. No forgotten debts. Just clear records you can act on.</p>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={(i % 3) * 90}>
                <div className="h-full rounded-2xl border border-line bg-surface p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-lime/40 hover:shadow-soft">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-lime/20 text-ink">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-bold">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-content-muted">{f.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">How it works</h2>
          <p className="mt-3 text-content-muted">Three simple steps to clean books and fewer forgotten debts.</p>
        </Reveal>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 110}>
              <div className="h-full rounded-2xl border border-line bg-surface p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-soft">
                <div className="font-display text-3xl font-extrabold text-lime-dark">{s.n}</div>
                <h3 className="mt-2 font-display text-lg font-bold">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-content-muted">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-ink px-6 py-14 text-center text-paper sm:px-12">
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-lime/20 blur-3xl" />
            <h2 className="relative mx-auto max-w-2xl font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              Get your business records in order today
            </h2>
            <p className="relative mx-auto mt-3 max-w-xl text-paper/70">
              Join the traders and shop owners keeping cleaner books and recovering more of what
              they&apos;re owed — for free.
            </p>
            <Link
              href="/signup"
              className="group relative mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-lime px-6 py-3.5 font-semibold text-ink transition-all hover:bg-lime-bright"
            >
              Create your free account
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="border-t border-line bg-surface/40">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2.5">
                <LogoMark className="h-7 w-7" />
                <span className="font-display text-lg font-extrabold">KasuwaAI</span>
              </div>
              <p className="mt-3 max-w-xs text-sm text-content-muted">
                Sales &amp; debt tracking for traders and small businesses. Built in Nigeria, in English and Hausa.
              </p>
            </div>
            <FooterCol title="Product" links={[["Get started", "/signup"], ["Log in", "/login"]]} />
            <FooterCol title="Legal" links={[["Privacy Policy", "/privacy"], ["Terms of Service", "/terms"]]} />
            <FooterCol title="Contact" links={[["support@kasuwaai.app", "mailto:support@kasuwaai.app"]]} />
          </div>
          <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-line pt-6 text-sm text-content-muted sm:flex-row">
            <p>© {year} KasuwaAI. All rights reserved.</p>
            <p>Made for Northern Nigeria&apos;s markets. 🇳🇬</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h4 className="font-display text-sm font-bold uppercase tracking-wide text-content-muted">{title}</h4>
      <ul className="mt-3 space-y-2">
        {links.map(([label, href]) => (
          <li key={href}>
            <Link href={href} className="text-sm text-content-muted hover:text-content">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
