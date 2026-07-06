import Link from "next/link";
import { Logo } from "@/components/logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-6 text-center">
      <Logo className="mb-8 text-xl" />
      <div className="font-display text-6xl font-extrabold text-lime-dark">404</div>
      <h1 className="mt-2 font-display text-2xl font-extrabold">Page not found</h1>
      <p className="mt-2 max-w-sm text-content-muted">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 rounded-lg bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-ink/90"
      >
        Go to dashboard
      </Link>
    </div>
  );
}
