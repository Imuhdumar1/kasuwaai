"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";
import { useI18n } from "@/components/providers";

/**
 * Registers the service worker (installable + offline-resilient) and shows a
 * small pill when the browser goes offline. Mounted inside <Providers> so it
 * has access to i18n.
 */
export function PWA() {
  const { t } = useI18n();
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      // Register after load so it never competes with first paint.
      const onLoad = () => navigator.serviceWorker.register("/sw.js").catch(() => {});
      if (document.readyState === "complete") onLoad();
      else window.addEventListener("load", onLoad, { once: true });
    }

    const goOnline = () => setOffline(false);
    const goOffline = () => setOffline(true);
    setOffline(!navigator.onLine);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="fixed left-1/2 top-3 z-[120] flex -translate-x-1/2 items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper shadow-card">
      <WifiOff className="h-4 w-4" />
      {t("pwa.offline")}
    </div>
  );
}
