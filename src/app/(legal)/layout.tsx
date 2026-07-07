import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/logo";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-line bg-bg">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4 sm:px-6">
          <Link href="/">
            <Logo />
          </Link>
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-content-muted hover:text-content">
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <article className="[&_h1]:font-display [&_h1]:text-3xl [&_h1]:font-extrabold [&_h1]:tracking-tight [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-content [&_p]:mt-3 [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-content-muted [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_li]:text-sm [&_li]:text-content-muted [&_a]:font-medium [&_a]:text-ink [&_a]:underline dark:[&_a]:text-lime">
          {children}
        </article>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto max-w-3xl px-4 py-8 text-sm text-content-muted sm:px-6">
          <div className="flex flex-wrap gap-4">
            <Link href="/privacy" className="hover:text-content">Privacy</Link>
            <Link href="/terms" className="hover:text-content">Terms</Link>
            <Link href="/login" className="hover:text-content">Log in</Link>
          </div>
          <p className="mt-3">© {new Date().getFullYear()} KasuwaAI</p>
        </div>
      </footer>
    </div>
  );
}
