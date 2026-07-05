import Link from "next/link";
import { Logo } from "@/components/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-ink p-12 text-paper lg:flex lg:flex-col lg:justify-between">
        <div
          className="pointer-events-none absolute -right-24 top-1/2 -translate-y-1/2 select-none font-display text-[22rem] font-extrabold leading-none text-transparent"
          style={{ WebkitTextStroke: "1px rgba(245,242,235,0.06)" }}
          aria-hidden
        >
          ₦
        </div>
        <Link href="/" className="relative">
          <Logo className="text-xl" />
        </Link>

        <div className="relative max-w-md">
          <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight">
            Stop forgetting. <br />
            <span className="text-lime">Start tracking.</span>
          </h1>
          <p className="mt-5 text-paper/60">
            Replace your notebook and memory with a simple digital record of every customer,
            sale, payment and debt — in English or Hausa.
          </p>
        </div>

        <div className="relative flex gap-8 text-sm text-paper/50">
          <div>
            <div className="font-display text-2xl font-extrabold text-paper">₦0</div>
            starts every new account
          </div>
          <div>
            <div className="font-display text-2xl font-extrabold text-paper">2</div>
            languages supported
          </div>
        </div>
      </div>

      {/* Form area */}
      <div className="flex items-center justify-center bg-bg p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-8 inline-flex lg:hidden">
            <Logo />
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
