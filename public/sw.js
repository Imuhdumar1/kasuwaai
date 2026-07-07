/*
 * KasuwaAI service worker.
 *
 * Goal: make the app installable and resilient when the connection drops,
 * WITHOUT ever serving stale business data while online.
 *  - Navigations: network-first, fall back to a cached offline page.
 *  - Static build assets: cache-first with background refresh (fast loads).
 *  - Cross-origin (Supabase API/realtime, fonts): never touched — always live.
 */
const CACHE = "kasuwa-v1";
const PRECACHE = ["/offline.html", "/icon.svg", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  // Leave cross-origin requests (Supabase, Google Fonts, Sentry) fully alone.
  if (url.origin !== self.location.origin) return;

  // App navigations: always try the network first so data is fresh; if the
  // network is unavailable, show the offline page.
  if (req.mode === "navigate") {
    event.respondWith(fetch(req).catch(() => caches.match("/offline.html")));
    return;
  }

  // Hashed build assets + the icon/manifest: cache-first, refresh in background.
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname === "/icon.svg" ||
    url.pathname === "/manifest.webmanifest"
  ) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const network = fetch(req)
          .then((res) => {
            if (res && res.status === 200) {
              const copy = res.clone();
              caches.open(CACHE).then((cache) => cache.put(req, copy));
            }
            return res;
          })
          .catch(() => cached);
        return cached || network;
      }),
    );
  }
});
