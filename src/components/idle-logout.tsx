"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Sign the user out after this much inactivity. 30 minutes balances security
// (shared shop/counter devices) with not interrupting active use.
const IDLE_MS = 30 * 60 * 1000;

export function IdleLogout() {
  const router = useRouter();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let loggingOut = false;

    async function logout() {
      if (loggingOut) return;
      loggingOut = true;
      try {
        // Offline (PWA) still logs out: "local" clears the session from this
        // device without a network round-trip that would otherwise hang. Online
        // we use the default (global) so the token is revoked server-side too.
        const scope = typeof navigator !== "undefined" && !navigator.onLine ? "local" : "global";
        await createClient().auth.signOut({ scope });
      } catch {
        /* ignore — redirect below still ends the session locally */
      }
      router.replace("/login?reason=timeout");
      router.refresh();
    }

    function reset() {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(logout, IDLE_MS);
    }

    const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll", "click"];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    document.addEventListener("visibilitychange", reset);
    reset();

    return () => {
      if (timer.current) clearTimeout(timer.current);
      events.forEach((e) => window.removeEventListener(e, reset));
      document.removeEventListener("visibilitychange", reset);
    };
  }, [router]);

  return null;
}
