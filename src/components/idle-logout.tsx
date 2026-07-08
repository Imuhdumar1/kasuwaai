"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Sign the user out after this much inactivity. 30 minutes balances security
// (shared shop/counter devices) with not interrupting active use.
const IDLE_MS = 30 * 60 * 1000;
// How often to check elapsed idle time while the tab is in the foreground.
const CHECK_MS = 20 * 1000;

export function IdleLogout() {
  const router = useRouter();
  const lastActivity = useRef<number>(Date.now());

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
        /* ignore — redirect below still ends the session on this device */
      }
      router.replace("/login?reason=timeout");
      router.refresh();
    }

    // Record real activity. We store a wall-clock timestamp rather than
    // (re)starting a long timer, because mobile browsers suspend timers while
    // the phone is locked or the app is backgrounded.
    const markActive = () => {
      lastActivity.current = Date.now();
    };

    // Compare against wall-clock time so time spent locked/backgrounded counts.
    // Runs on an interval AND whenever the app returns to the foreground.
    const checkIdle = () => {
      if (Date.now() - lastActivity.current >= IDLE_MS) logout();
    };

    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "touchmove",
      "pointerdown",
      "scroll",
      "click",
    ];
    events.forEach((e) => window.addEventListener(e, markActive, { passive: true }));

    // Returning to the app (unlock / switch back) checks elapsed idle time
    // instead of resetting it — the previous bug that broke this on mobile.
    const onVisible = () => {
      if (document.visibilityState === "visible") checkIdle();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", checkIdle);
    window.addEventListener("pageshow", checkIdle);

    const interval = setInterval(checkIdle, CHECK_MS);

    return () => {
      events.forEach((e) => window.removeEventListener(e, markActive));
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", checkIdle);
      window.removeEventListener("pageshow", checkIdle);
      clearInterval(interval);
    };
  }, [router]);

  return null;
}
