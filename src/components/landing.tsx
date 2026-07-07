"use client";

import { useState } from "react";
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

type Lang = "en" | "ha";

// All landing copy in both languages. The toggle below flips `lang` and every
// string is read from here — nothing on this page is hard-coded to English.
const COPY = {
  en: {
    nav: { login: "Log in", getStarted: "Get started" },
    badge: "Sales · Debts · Reminders · Voice",
    heroTitle1: "Stop forgetting.",
    heroTitle2: "Start tracking.",
    heroBody:
      "KasuwaAI replaces your notebook with a simple digital record of every sale, customer, debt and payment — and helps you recover the money you’re owed.",
    ctaFree: "Get started free",
    login: "Log in",
    trust: ["Free to start", "Works on any phone", "English & Hausa"],
    featuresTitle: "Everything your shop needs, in one place",
    featuresBody: "No spreadsheets. No forgotten debts. Just clear records you can act on.",
    features: [
      { icon: Mic, title: "Record sales by voice", body: "Speak naturally in English, Hausa, or both. KasuwaAI turns it into a sale you can edit and save — no typing needed." },
      { icon: Bell, title: "Never forget a debt", body: "Every unpaid sale is tracked automatically. See who’s overdue and send a friendly reminder by WhatsApp or SMS in one tap." },
      { icon: LayoutDashboard, title: "Live business dashboard", body: "Today’s sales, outstanding debt, best products, top customers and a health score — all updating as you record." },
      { icon: BarChart3, title: "Reports you can share", body: "Sales, profit, debt, customer and product reports — download as CSV, PDF or Word for your records or your accountant." },
      { icon: Sparkles, title: "AI business assistant", body: "Ask “Who owes me money?” or “What’s my profit this week?” and get answers from your real data, in English or Hausa." },
      { icon: Languages, title: "Built for your shop", body: "English & Hausa, works on any phone, and starts free. Made for traders, market sellers and small businesses." },
    ],
    stepsTitle: "How it works",
    stepsBody: "Three simple steps to clean books and fewer forgotten debts.",
    steps: [
      { n: "01", title: "Record a sale", body: "Type it in seconds or just speak — pick the customer, product, amount and how much was paid." },
      { n: "02", title: "Debts track themselves", body: "Unpaid balances become debts automatically, sorted by overdue, due today and upcoming." },
      { n: "03", title: "Send reminders, get paid", body: "One tap sends a polite reminder on WhatsApp or SMS. Record the payment and your books stay perfect." },
    ],
    finalTitle: "Get your business records in order today",
    finalBody: "Join the traders and shop owners keeping cleaner books and recovering more of what they’re owed — for free.",
    finalCta: "Create your free account",
    footerBlurb: "Sales & debt tracking for traders and small businesses. Built in Nigeria, in English and Hausa.",
    footProduct: "Product",
    footLegal: "Legal",
    footContact: "Contact",
    footProductLinks: [["Get started", "/signup"], ["Log in", "/login"]] as [string, string][],
    footLegalLinks: [["Privacy Policy", "/privacy"], ["Terms of Service", "/terms"]] as [string, string][],
    rights: "All rights reserved.",
    madeFor: "Made for business owners. 🇳🇬",
  },
  ha: {
    nav: { login: "Shiga", getStarted: "Fara" },
    badge: "Sayarwa · Bashi · Tuni · Murya",
    heroTitle1: "Ka daina mantawa.",
    heroTitle2: "Ka fara rikodi.",
    heroBody:
      "KasuwaAI na maye gurbin littafinka da rikodi mai sauƙi na kowace sayarwa, abokin ciniki, bashi da biya — kuma yana taimaka maka ka karɓo kuɗin da ake bin ka.",
    ctaFree: "Fara kyauta",
    login: "Shiga",
    trust: ["Fara kyauta", "Yana aiki a kowane waya", "Turanci & Hausa"],
    featuresTitle: "Duk abin da shagon ka ke buƙata, a wuri ɗaya",
    featuresBody: "Ba jerin lissafi. Ba bashin da aka manta. Rikodi bayyananne da za ka iya yin aiki da shi.",
    features: [
      { icon: Mic, title: "Yi rikodin sayarwa da murya", body: "Yi magana cikin Turanci, Hausa, ko duka biyu. KasuwaAI zai mai da shi sayarwa da za ka iya gyara ka ajiye — babu buqatar rubutu." },
      { icon: Bell, title: "Kada ka manta bashi", body: "Ana bin kowace sayarwar da ba a biya ba kai tsaye. Ka ga wanda ya wuce lokaci ka aika masa da tuni ta WhatsApp ko SMS da danna guda." },
      { icon: LayoutDashboard, title: "Dashboard na kasuwanci kai tsaye", body: "Sayarwar yau, bashin da ake bin ka, kayan da suka fi sayuwa, manyan abokan ciniki da makin lafiya — duk suna sabuntawa yayin da kake rikodi." },
      { icon: BarChart3, title: "Rahotanni da za ka iya rabawa", body: "Rahotannin sayarwa, riba, bashi, abokin ciniki da kaya — sauke a matsayin CSV, PDF ko Word don rikodinka ko akantan ka." },
      { icon: Sparkles, title: "Mataimakin kasuwanci na AI", body: "Ka tambaya “Wa ke bin ni bashi?” ko “Menene ribata a wannan mako?” ka samu amsa daga bayananka na gaskiya, cikin Turanci ko Hausa." },
      { icon: Languages, title: "An gina shi don shagon ka", body: "Turanci & Hausa, yana aiki a kowane waya, kuma yana farawa kyauta. An yi shi don ’yan kasuwa da masu sayarwa a kasuwa da ƙananan kasuwanci." },
    ],
    stepsTitle: "Yadda yake aiki",
    stepsBody: "Matakai uku masu sauƙi zuwa littafi mai tsafta da rage bashin da ake mantawa.",
    steps: [
      { n: "01", title: "Yi rikodin sayarwa", body: "Rubuta cikin daƙiƙa ko kawai ka yi magana — zaɓi abokin ciniki, kaya, adadi da yawan da aka biya." },
      { n: "02", title: "Bashi na bin kansa", body: "Ragowar da ba a biya ba tana zama bashi kai tsaye, an tsara ta bisa wuce lokaci, ta yau da mai zuwa." },
      { n: "03", title: "Aika tuni, karɓi kuɗi", body: "Danna guda yana aika tuni mai ladabi ta WhatsApp ko SMS. Yi rikodin biyan kuma littafinka ya ci gaba da zama daidai." },
    ],
    finalTitle: "Ka tsara rikodin kasuwancin ka yau",
    finalBody: "Ka shiga tare da ’yan kasuwa da masu shaguna da ke rike da littafi mai tsafta suna karɓo abin da ake bin su — kyauta.",
    finalCta: "Ƙirƙiri asusun ka kyauta",
    footerBlurb: "Rikodin sayarwa da bashi don ’yan kasuwa da ƙananan kasuwanci. An gina a Najeriya, cikin Turanci da Hausa.",
    footProduct: "Samfur",
    footLegal: "Doka",
    footContact: "Tuntuɓi",
    footProductLinks: [["Fara", "/signup"], ["Shiga", "/login"]] as [string, string][],
    footLegalLinks: [["Manufar Sirri", "/privacy"], ["Sharuɗɗan Sabis", "/terms"]] as [string, string][],
    rights: "Duk haƙƙin an tanada.",
    madeFor: "An yi shi don masu kasuwanci. 🇳🇬",
  },
} satisfies Record<Lang, unknown>;

export function Landing() {
  const [lang, setLang] = useState<Lang>("en");
  const t = COPY[lang];
  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-bg text-content">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-line bg-bg">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <nav className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setLang((l) => (l === "en" ? "ha" : "en"))}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-sm font-medium text-content-muted transition-colors hover:text-content"
              aria-label="Switch language"
            >
              <Languages className="h-4 w-4" />
              {lang === "en" ? "Hausa" : "English"}
            </button>
            <Link href="/login" className="rounded-lg px-3 py-2 text-sm font-medium text-content-muted hover:text-content">
              {t.nav.login}
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-paper transition-all hover:bg-ink/90 hover:shadow-soft"
            >
              {t.nav.getStarted}
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[36rem] max-w-[90vw] -translate-x-1/2 rounded-full bg-lime/20 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 pb-14 pt-14 sm:px-6 sm:pt-20">
          <div className="mx-auto max-w-3xl text-center">
            <Reveal>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-content-muted">
                <span className="h-2 w-2 animate-pulse rounded-full bg-lime" /> {t.badge}
              </div>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
                {t.heroTitle1} <br />
                <span className="text-lime-dark">{t.heroTitle2}</span>
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="mx-auto mt-5 max-w-xl text-base text-content-muted sm:text-lg">{t.heroBody}</p>
            </Reveal>
            <Reveal delay={240}>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/signup"
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-lime px-6 py-3.5 font-semibold text-ink transition-all hover:bg-lime-bright hover:shadow-soft sm:w-auto"
                >
                  {t.ctaFree}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-surface px-6 py-3.5 font-semibold text-content transition-colors hover:bg-surface-2 sm:w-auto"
                >
                  {t.login}
                </Link>
              </div>
            </Reveal>
            <Reveal delay={320}>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-content-muted">
                {t.trust.map((item) => (
                  <span key={item} className="inline-flex items-center gap-1.5">
                    <Check className="h-4 w-4 text-lime-dark" /> {item}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-line bg-surface/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{t.featuresTitle}</h2>
            <p className="mt-3 text-content-muted">{t.featuresBody}</p>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {t.features.map((f, i) => (
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
          <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{t.stepsTitle}</h2>
          <p className="mt-3 text-content-muted">{t.stepsBody}</p>
        </Reveal>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {t.steps.map((s, i) => (
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
            <h2 className="relative mx-auto max-w-2xl font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{t.finalTitle}</h2>
            <p className="relative mx-auto mt-3 max-w-xl text-paper/70">{t.finalBody}</p>
            <Link
              href="/signup"
              className="group relative mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-lime px-6 py-3.5 font-semibold text-ink transition-all hover:bg-lime-bright"
            >
              {t.finalCta}
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
              <p className="mt-3 max-w-xs text-sm text-content-muted">{t.footerBlurb}</p>
            </div>
            <FooterCol title={t.footProduct} links={t.footProductLinks} />
            <FooterCol title={t.footLegal} links={t.footLegalLinks} />
            <FooterCol title={t.footContact} links={[["support@kasuwaai.app", "mailto:support@kasuwaai.app"]]} />
          </div>
          <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-line pt-6 text-sm text-content-muted sm:flex-row">
            <p>© {year} KasuwaAI. {t.rights}</p>
            <p>{t.madeFor}</p>
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
